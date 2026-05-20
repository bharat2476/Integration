import { v4 as uuidv4 } from "uuid";
import { globalBroker } from "../pubsub/broker.js";
import { AppError } from "../shared/errors.js";
import { childLogger } from "../shared/logger.js";
import type { OrderLifecycleState, ShipUrgency } from "../shared/types.js";
import type { OrderExecutionContext } from "../shared/types.js";
import {
  allocateWesRobotics,
  closeSapOrderLoop,
  pledgeSapFinancial,
  rateBlueYonderFreight,
  releaseManhattanWave,
} from "./integrations.js";
import { resolveOrderSla, waveQueueRank, type OrderSlaProfile } from "./priority.js";

export interface OrderPipelineResult {
  orderId: string;
  state: OrderLifecycleState;
  shipUrgency: ShipUrgency;
  priorityScore: number;
  slaTargetHours: number;
  promisedShipBy: string;
  waveTier: OrderSlaProfile["waveTier"];
  correlationId: string;
}

const orderStore = new Map<
  string,
  { ctx: OrderExecutionContext; state: OrderLifecycleState; sla: OrderSlaProfile }
>();

export async function runOrderExecutionPipeline(
  tenantId: string,
  correlationId: string,
  omsOrderRef: string,
  shipUrgency: ShipUrgency = "standard",
  wesVendor?: OrderExecutionContext["wesVendor"],
): Promise<OrderPipelineResult> {
  const orderId = uuidv4();
  const sla = resolveOrderSla(shipUrgency);
  const ctx: OrderExecutionContext = {
    tenantId,
    correlationId,
    orderId,
    omsOrderRef,
    wesVendor,
    shipUrgency,
    priorityScore: sla.priorityScore,
    promisedShipBy: sla.promisedShipBy,
  };
  const log = childLogger({
    tenantId,
    correlationId,
    orderId,
    omsOrderRef,
    shipUrgency,
    priorityScore: sla.priorityScore,
  });

  orderStore.set(orderId, { ctx, state: "RECEIVED_OMS", sla });
  log.info({ promisedShipBy: sla.promisedShipBy }, "order.pipeline.start");

  await globalBroker.publish("order.execution.stage", tenantId, correlationId, {
    orderId,
    stage: "RECEIVED_OMS",
    shipUrgency,
    priorityScore: sla.priorityScore,
    promisedShipBy: sla.promisedShipBy,
  });

  try {
    await pledgeSapFinancial(ctx);
    orderStore.set(orderId, { ctx, state: "ERP_PLEDGED", sla });
    await globalBroker.publish("order.execution.stage", tenantId, correlationId, {
      orderId,
      stage: "ERP_PLEDGED",
      priorityScore: sla.priorityScore,
    });

    await releaseManhattanWave(ctx, sla.waveTier, waveQueueRank(sla.priorityScore));
    orderStore.set(orderId, { ctx, state: "WMS_WAVE_RELEASED", sla });
    await allocateWesRobotics(ctx);
    const freight = await rateBlueYonderFreight(ctx, sla.carrierServiceLevel);
    orderStore.set(orderId, { ctx, state: "TMS_RATED", sla });

    await globalBroker.publish("order.execution.stage", tenantId, correlationId, {
      orderId,
      stage: "TMS_RATED",
      freight,
      shipUrgency,
    });

    orderStore.set(orderId, { ctx, state: "SHIPPED", sla });
    await closeSapOrderLoop(ctx);
    orderStore.set(orderId, { ctx, state: "ERP_CLOSED", sla });

    log.info({ freight, shipUrgency, promisedShipBy: sla.promisedShipBy }, "order.pipeline.complete");

    return {
      orderId,
      state: "ERP_CLOSED",
      shipUrgency,
      priorityScore: sla.priorityScore,
      slaTargetHours: sla.slaTargetHours,
      promisedShipBy: sla.promisedShipBy,
      waveTier: sla.waveTier,
      correlationId,
    };
  } catch (err) {
    orderStore.set(orderId, { ctx, state: "FAILED", sla });
    log.error({ err }, "order.pipeline.failed");
    throw err instanceof AppError ? err : new AppError("Order pipeline failed", 500, "PIPELINE_ERROR", {
      orderId,
      correlationId,
    });
  }
}

export function getOrderState(orderId: string) {
  return orderStore.get(orderId);
}

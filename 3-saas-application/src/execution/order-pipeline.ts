import { v4 as uuidv4 } from "uuid";
import { globalBroker } from "../pubsub/broker.js";
import { AppError } from "../shared/errors.js";
import { childLogger } from "../shared/logger.js";
import type { OrderExecutionContext, OrderLifecycleState } from "../shared/types.js";
import {
  allocateWesRobotics,
  closeSapOrderLoop,
  pledgeSapFinancial,
  rateBlueYonderFreight,
  releaseManhattanWave,
} from "./integrations.js";

const orderStore = new Map<string, { ctx: OrderExecutionContext; state: OrderLifecycleState }>();

export async function runOrderExecutionPipeline(
  tenantId: string,
  correlationId: string,
  omsOrderRef: string,
  wesVendor?: OrderExecutionContext["wesVendor"],
): Promise<{ orderId: string; state: OrderLifecycleState }> {
  const orderId = uuidv4();
  const ctx: OrderExecutionContext = { tenantId, correlationId, orderId, omsOrderRef, wesVendor };
  const log = childLogger({ tenantId, correlationId, orderId, omsOrderRef });

  orderStore.set(orderId, { ctx, state: "RECEIVED_OMS" });
  log.info("order.pipeline.start");

  try {
    await pledgeSapFinancial(ctx);
    orderStore.set(orderId, { ctx, state: "ERP_PLEDGED" });
    await globalBroker.publish("order.execution.stage", tenantId, correlationId, {
      orderId,
      stage: "ERP_PLEDGED",
    });

    await releaseManhattanWave(ctx);
    await allocateWesRobotics(ctx);
    const freight = await rateBlueYonderFreight(ctx);
    orderStore.set(orderId, { ctx, state: "TMS_RATED" });

    await globalBroker.publish("order.execution.stage", tenantId, correlationId, {
      orderId,
      stage: "TMS_RATED",
      freight,
    });

    orderStore.set(orderId, { ctx, state: "SHIPPED" });
    await closeSapOrderLoop(ctx);
    orderStore.set(orderId, { ctx, state: "ERP_CLOSED" });

    log.info({ freight }, "order.pipeline.complete");
    return { orderId, state: "ERP_CLOSED" };
  } catch (err) {
    orderStore.set(orderId, { ctx, state: "FAILED" });
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

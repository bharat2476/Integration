import { IntegrationError } from "../shared/errors.js";
import { childLogger } from "../shared/logger.js";
import type { OrderExecutionContext, OrderLifecycleState } from "../shared/types.js";

function logStage(ctx: OrderExecutionContext, stage: OrderLifecycleState, meta?: Record<string, unknown>) {
  childLogger({
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    orderId: ctx.orderId,
    stage,
  }).info(meta ?? {}, "order.pipeline.stage");
}

export async function pledgeSapFinancial(ctx: OrderExecutionContext): Promise<void> {
  logStage(ctx, "ERP_PLEDGE_PENDING");
  // Mock SAP IDoc / BAPI financial pledge
  if (!ctx.omsOrderRef) {
    throw new IntegrationError("SAP", "Missing OMS reference for financial pledge");
  }
  await delay(10);
  logStage(ctx, "ERP_PLEDGED", { sapDocumentType: "F2PLEDGE" });
}

export async function releaseManhattanWave(
  ctx: OrderExecutionContext,
  waveTier: "RUSH" | "STANDARD",
  queueRank: number,
): Promise<void> {
  logStage(ctx, "WMS_WAVE_RELEASED", {
    wms: "Manhattan",
    waveId: `WAVE-${ctx.orderId.slice(0, 8)}`,
    waveTier,
    queueRank,
    priorityScore: ctx.priorityScore,
    promisedShipBy: ctx.promisedShipBy,
  });
  await delay(waveTier === "RUSH" ? 5 : 10);
}

export async function allocateWesRobotics(ctx: OrderExecutionContext): Promise<void> {
  const vendor = ctx.wesVendor ?? "Locus";
  logStage(ctx, "WES_ALLOCATED", { wesVendor: vendor });
  await delay(10);
}

export async function rateBlueYonderFreight(
  ctx: OrderExecutionContext,
  serviceLevel: "EXPEDITED" | "GROUND",
): Promise<{ carrier: string; cost: number; serviceLevel: string }> {
  logStage(ctx, "TMS_RATED", { tms: "BlueYonder", serviceLevel, promisedShipBy: ctx.promisedShipBy });
  await delay(10);
  return {
    carrier: serviceLevel === "EXPEDITED" ? "FDX-EXPRESS" : "FDX-GROUND",
    cost: serviceLevel === "EXPEDITED" ? 42.5 : 24.87,
    serviceLevel,
  };
}

export async function closeSapOrderLoop(ctx: OrderExecutionContext): Promise<void> {
  logStage(ctx, "ERP_CLOSED", { sapClosingDoc: `SAP-CLOSE-${ctx.orderId}` });
  await delay(10);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

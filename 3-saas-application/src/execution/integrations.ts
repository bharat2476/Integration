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

export async function releaseManhattanWave(ctx: OrderExecutionContext): Promise<void> {
  logStage(ctx, "WMS_WAVE_RELEASED", { wms: "Manhattan", waveId: `WAVE-${ctx.orderId.slice(0, 8)}` });
  await delay(10);
}

export async function allocateWesRobotics(ctx: OrderExecutionContext): Promise<void> {
  const vendor = ctx.wesVendor ?? "Locus";
  logStage(ctx, "WES_ALLOCATED", { wesVendor: vendor });
  await delay(10);
}

export async function rateBlueYonderFreight(ctx: OrderExecutionContext): Promise<{ carrier: string; cost: number }> {
  logStage(ctx, "TMS_RATED", { tms: "BlueYonder" });
  await delay(10);
  return { carrier: "FDX-GROUND", cost: 24.87 };
}

export async function closeSapOrderLoop(ctx: OrderExecutionContext): Promise<void> {
  logStage(ctx, "ERP_CLOSED", { sapClosingDoc: `SAP-CLOSE-${ctx.orderId}` });
  await delay(10);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

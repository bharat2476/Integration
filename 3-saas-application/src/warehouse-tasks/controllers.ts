import { v4 as uuidv4 } from "uuid";
import { childLogger } from "../shared/logger.js";
import type { TenantContext } from "../shared/types.js";

export interface TaskResult {
  taskId: string;
  taskType: string;
  status: "COMPLETED" | "QUEUED";
  correlationId: string;
  payload?: Record<string, unknown>;
}

function baseTask(ctx: TenantContext, taskType: string, payload?: Record<string, unknown>): TaskResult {
  const taskId = uuidv4();
  childLogger({ ...ctx, taskId, taskType }).info(payload ?? {}, "warehouse.task.executed");
  return { taskId, taskType, status: "COMPLETED", correlationId: ctx.correlationId, payload };
}

export const WarehouseTaskController = {
  releaseWave(ctx: TenantContext, waveId: string) {
    return baseTask(ctx, "RELEASE_WAVE", { waveId, wms: "Manhattan" });
  },
  pickTask(ctx: TenantContext, pickListId: string) {
    return baseTask(ctx, "PICK_TASK", { pickListId });
  },
  packStationVerification(ctx: TenantContext, stationId: string, orderId: string) {
    return baseTask(ctx, "PACK_STATION_VERIFY", { stationId, orderId });
  },
  stageOrder(ctx: TenantContext, orderId: string, stagingLane: string) {
    return baseTask(ctx, "STAGE_ORDER", { orderId, stagingLane });
  },
  fluidLoadTrailer(ctx: TenantContext, trailerId: string, doorId: string) {
    return baseTask(ctx, "FLUID_LOAD_TRAILER", { trailerId, doorId });
  },
  shipOrder(ctx: TenantContext, orderId: string) {
    return baseTask(ctx, "SHIP_ORDER", { orderId });
  },
  autoPick(ctx: TenantContext, vendor: "Locus" | "Rapyuta", missionId: string) {
    return baseTask(ctx, "AUTO_PICK", { vendor, missionId, robotics: "AMR" });
  },
  autoPack(ctx: TenantContext, scannerId: string, orderId: string) {
    return baseTask(ctx, "AUTO_PACK", { scannerId, orderId, packagingMachine: "INLINE" });
  },
  printShippingLabel(ctx: TenantContext, orderId: string, format: "ZPL" | "PDF") {
    const mockZpl = `^XA^FO50,50^ADN,36,20^FDSHIP:${orderId}^FS^XZ`;
    const mockPdfBase64 = Buffer.from(`PDF-MOCK-LABEL-${orderId}`).toString("base64");
    return baseTask(ctx, "PRINT_SHIPPING_LABEL", {
      orderId,
      format,
      stream: format === "ZPL" ? mockZpl : mockPdfBase64,
      contentType: format === "ZPL" ? "text/zpl" : "application/pdf",
    });
  },
};

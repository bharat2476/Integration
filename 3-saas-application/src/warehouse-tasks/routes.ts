import { Router } from "express";
import { z } from "zod";
import { WarehouseTaskController } from "./controllers.js";
import { getTenantContext } from "../shared/tenant.js";
import { ValidationError } from "../shared/errors.js";

export const warehouseRouter = Router();

function handle<T extends z.ZodTypeAny>(
  schema: T,
  handler: (ctx: ReturnType<typeof getTenantContext>, data: z.infer<T>) => unknown,
) {
  return (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
    try {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid warehouse task payload", { issues: parsed.error.flatten() });
      }
      const ctx = getTenantContext(req);
      res.status(200).json(handler(ctx, parsed.data));
    } catch (e) {
      next(e);
    }
  };
}

warehouseRouter.post("/wave/release", handle(z.object({ waveId: z.string() }), (ctx, d) => WarehouseTaskController.releaseWave(ctx, d.waveId)));
warehouseRouter.post("/pick", handle(z.object({ pickListId: z.string() }), (ctx, d) => WarehouseTaskController.pickTask(ctx, d.pickListId)));
warehouseRouter.post("/pack/verify", handle(z.object({ stationId: z.string(), orderId: z.string() }), (ctx, d) => WarehouseTaskController.packStationVerification(ctx, d.stationId, d.orderId)));
warehouseRouter.post("/stage", handle(z.object({ orderId: z.string(), stagingLane: z.string() }), (ctx, d) => WarehouseTaskController.stageOrder(ctx, d.orderId, d.stagingLane)));
warehouseRouter.post("/load/trailer", handle(z.object({ trailerId: z.string(), doorId: z.string() }), (ctx, d) => WarehouseTaskController.fluidLoadTrailer(ctx, d.trailerId, d.doorId)));
warehouseRouter.post("/ship", handle(z.object({ orderId: z.string() }), (ctx, d) => WarehouseTaskController.shipOrder(ctx, d.orderId)));
warehouseRouter.post("/auto-pick", handle(z.object({ vendor: z.enum(["Locus", "Rapyuta"]), missionId: z.string() }), (ctx, d) => WarehouseTaskController.autoPick(ctx, d.vendor, d.missionId)));
warehouseRouter.post("/auto-pack", handle(z.object({ scannerId: z.string(), orderId: z.string() }), (ctx, d) => WarehouseTaskController.autoPack(ctx, d.scannerId, d.orderId)));
warehouseRouter.post(
  "/labels/print",
  handle(
    z.object({ orderId: z.string(), format: z.enum(["ZPL", "PDF"]).default("ZPL") }),
    (ctx, d) => WarehouseTaskController.printShippingLabel(ctx, d.orderId, d.format),
  ),
);

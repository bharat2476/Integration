import { Router } from "express";
import { z } from "zod";
import { runOrderExecutionPipeline, getOrderState } from "./order-pipeline.js";
import { getTenantContext } from "../shared/tenant.js";
import { ValidationError } from "../shared/errors.js";

const startSchema = z.object({
  omsOrderRef: z.string().min(1),
  shipUrgency: z.enum(["rush", "standard"]).default("standard"),
  wesVendor: z.enum(["AutoStore", "Vanderlande", "Locus", "Schaefer", "Rapyuta"]).optional(),
});

export const executionRouter = Router();

executionRouter.post("/orders", async (req, res, next) => {
  try {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid order start payload", { issues: parsed.error.flatten() });
    }
    const ctx = getTenantContext(req);
    const result = await runOrderExecutionPipeline(
      ctx.tenantId,
      ctx.correlationId,
      parsed.data.omsOrderRef,
      parsed.data.shipUrgency,
      parsed.data.wesVendor,
    );
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
});

executionRouter.get("/orders/:orderId", (req, res) => {
  const record = getOrderState(req.params.orderId);
  if (!record) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({
    orderId: req.params.orderId,
    state: record.state,
    correlationId: record.ctx.correlationId,
    tenantId: record.ctx.tenantId,
    shipUrgency: record.ctx.shipUrgency,
    priorityScore: record.ctx.priorityScore,
    promisedShipBy: record.ctx.promisedShipBy,
    slaTargetHours: record.sla.slaTargetHours,
    waveTier: record.sla.waveTier,
    tmsLoadId: record.ctx.tmsLoadId,
    stagingLane: record.ctx.stagingLane,
    trailerId: record.ctx.trailerId,
    doorId: record.ctx.doorId,
  });
});

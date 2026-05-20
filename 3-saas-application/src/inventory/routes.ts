import { Router } from "express";
import { z } from "zod";
import { getTenantContext } from "../shared/tenant.js";
import { ValidationError } from "../shared/errors.js";
import {
  dailyReconciliation,
  listAuditEntries,
  postInventoryAdjustment,
  recordCycleCount,
} from "./services.js";

const adjustmentSchema = z.object({
  sku: z.string().min(1),
  locationId: z.string().min(1),
  reasonCode: z.string().min(1),
  adjustmentType: z.enum(["overage", "shortage", "damage"]),
  quantityDelta: z.number(),
  notes: z.string().optional(),
});

export const inventoryRouter = Router();

inventoryRouter.post("/cycle-count", (req, res, next) => {
  try {
    const body = z.object({
      sku: z.string(),
      locationId: z.string(),
      countedQty: z.number(),
    }).parse(req.body);
    const ctx = getTenantContext(req);
    res.json(recordCycleCount(ctx, body.sku, body.locationId, body.countedQty));
  } catch (e) {
    next(e);
  }
});

inventoryRouter.post("/reconciliation/daily", (req, res, next) => {
  try {
    const body = z.object({ siteId: z.string() }).parse(req.body);
    const ctx = getTenantContext(req);
    res.json(dailyReconciliation(ctx, body.siteId));
  } catch (e) {
    next(e);
  }
});

inventoryRouter.post("/adjustments", async (req, res, next) => {
  try {
    const parsed = adjustmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid adjustment", { issues: parsed.error.flatten() });
    }
    const ctx = getTenantContext(req);
    const audit = await postInventoryAdjustment(ctx, parsed.data);
    res.status(201).json(audit);
  } catch (e) {
    next(e);
  }
});

inventoryRouter.get("/audit-ledger", (req, res) => {
  const ctx = getTenantContext(req);
  res.json({ entries: listAuditEntries(ctx.tenantId) });
});

import { Router } from "express";
import { z } from "zod";
import { pimBrokerClient } from "./pim-broker-client.js";
import { getTenantContext } from "../shared/tenant.js";
import { ValidationError } from "../shared/errors.js";

const catalogDeltaSchema = z.object({
  pimBatchId: z.string().min(1),
  operation: z.enum(["UPSERT", "DELETE"]),
  items: z.array(
    z.object({
      sku: z.string().min(1),
      attributes: z.record(z.unknown()).default({}),
    }),
  ).min(1),
});

export const catalogRouter = Router();

catalogRouter.post("/delta", async (req, res, next) => {
  try {
    const parsed = catalogDeltaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid catalog delta payload", { issues: parsed.error.flatten() });
    }
    const ctx = getTenantContext(req);
    const message = await pimBrokerClient.publishCatalogDelta(ctx.tenantId, ctx.correlationId, {
      pimBatchId: parsed.data.pimBatchId,
      skuCount: parsed.data.items.length,
      operation: parsed.data.operation,
      items: parsed.data.items,
    });
    res.status(202).json({ accepted: true, messageId: message.messageId, correlationId: ctx.correlationId });
  } catch (err) {
    next(err);
  }
});

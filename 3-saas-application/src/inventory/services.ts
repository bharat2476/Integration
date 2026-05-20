import { v4 as uuidv4 } from "uuid";
import { globalBroker } from "../pubsub/broker.js";
import { ValidationError } from "../shared/errors.js";
import { childLogger } from "../shared/logger.js";
import type {
  AuditLedgerPayload,
  InventoryAdjustmentRequest,
  OsdAdjustmentType,
  TenantContext,
} from "../shared/types.js";

const REASON_CODES: Record<OsdAdjustmentType, string[]> = {
  overage: ["RCV-OVER", "CNT-OVER", "ADJ-OVER"],
  shortage: ["PICK-SHORT", "CNT-SHORT", "SHRINK"],
  damage: ["DMG-FREIGHT", "DMG-HANDLING", "DMG-QA"],
};

const perpetualBaseline = new Map<string, number>();
const wmsPhysical = new Map<string, number>();
const sapLedger = new Map<string, number>();
const auditLedger: AuditLedgerPayload[] = [];

function skuKey(tenantId: string, sku: string, locationId: string) {
  return `${tenantId}::${sku}::${locationId}`;
}

export function recordCycleCount(
  ctx: TenantContext,
  sku: string,
  locationId: string,
  countedQty: number,
) {
  const key = skuKey(ctx.tenantId, sku, locationId);
  const baseline = perpetualBaseline.get(key) ?? 0;
  const variance = countedQty - baseline;
  perpetualBaseline.set(key, countedQty);

  childLogger({ ...ctx, sku, locationId, variance }).info("inventory.cycle_count.completed");
  return { sku, locationId, priorBaseline: baseline, countedQty, variance };
}

export function dailyReconciliation(ctx: TenantContext, siteId: string) {
  const mismatches: Array<{
    sku: string;
    locationId: string;
    wmsQty: number;
    sapQty: number;
    delta: number;
  }> = [];

  for (const [key, wmsQty] of wmsPhysical.entries()) {
    if (!key.startsWith(`${ctx.tenantId}::`)) continue;
    const sapQty = sapLedger.get(key) ?? 0;
    if (wmsQty !== sapQty) {
      const [, sku, locationId] = key.split("::");
      mismatches.push({ sku, locationId, wmsQty, sapQty, delta: wmsQty - sapQty });
    }
  }

  childLogger({ ...ctx, siteId, mismatchCount: mismatches.length }).info("inventory.reconciliation.completed");
  return { siteId, reconciledAt: new Date().toISOString(), mismatches };
}

export async function postInventoryAdjustment(
  ctx: TenantContext,
  req: InventoryAdjustmentRequest,
): Promise<AuditLedgerPayload> {
  const allowed = REASON_CODES[req.adjustmentType];
  if (!allowed.includes(req.reasonCode)) {
    throw new ValidationError(`Invalid reason code for ${req.adjustmentType}`, {
      allowed,
      received: req.reasonCode,
    });
  }

  const key = skuKey(ctx.tenantId, req.sku, req.locationId);
  const prior = perpetualBaseline.get(key) ?? 0;
  const next = prior + req.quantityDelta;
  perpetualBaseline.set(key, next);
  wmsPhysical.set(key, next);
  sapLedger.set(key, next);

  const ledgerEntryId = uuidv4();
  const audit: AuditLedgerPayload = {
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    ledgerEntryId,
    adjustmentType: req.adjustmentType,
    reasonCode: req.reasonCode,
    financeReviewRequired: Math.abs(req.quantityDelta) > 10 || req.adjustmentType === "damage",
    legalHold: req.adjustmentType === "damage" && req.reasonCode.startsWith("DMG-"),
    varianceAmount: req.quantityDelta,
    capturedAt: new Date().toISOString(),
    payload: {
      sku: req.sku,
      locationId: req.locationId,
      priorQty: prior,
      newQty: next,
      notes: req.notes ?? null,
      osdCategory: req.adjustmentType.toUpperCase(),
    },
  };

  auditLedger.push(audit);
  childLogger({ ...ctx, ledgerEntryId }).info(audit.payload, "inventory.adjustment.posted");

  await globalBroker.publish("inventory.adjustment.posted", ctx.tenantId, ctx.correlationId, audit);
  return audit;
}

export function seedDemoInventory(tenantId: string, sku: string, locationId: string, qty: number) {
  const key = skuKey(tenantId, sku, locationId);
  perpetualBaseline.set(key, qty);
  wmsPhysical.set(key, qty);
  sapLedger.set(key, qty);
}

export function listAuditEntries(tenantId: string) {
  return auditLedger.filter((e) => e.tenantId === tenantId);
}

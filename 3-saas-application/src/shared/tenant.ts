import type { NextFunction, Request, Response } from "express";
import { TenantError } from "./errors.js";
import type { TenantContext } from "./types.js";

const TENANT_HEADER = "x-tenant-id";

export function tenantMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const tenantId = req.header(TENANT_HEADER)?.trim();
  if (!tenantId) {
    next(new TenantError(`Missing required header: ${TENANT_HEADER}`));
    return;
  }
  req.tenantId = tenantId;
  next();
}

export function getTenantContext(req: Request): TenantContext {
  if (!req.tenantId || !req.correlationId) {
    throw new TenantError("Tenant or correlation context not initialized");
  }
  return { tenantId: req.tenantId, correlationId: req.correlationId };
}

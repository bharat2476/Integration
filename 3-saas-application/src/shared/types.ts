export type WmsVendor = "Manhattan";
export type WesVendor = "AutoStore" | "Vanderlande" | "Locus" | "Schaefer" | "Rapyuta";
export type TmsVendor = "BlueYonder";
export type ErpSystem = "SAP";

export type OrderLifecycleState =
  | "RECEIVED_OMS"
  | "ERP_PLEDGE_PENDING"
  | "ERP_PLEDGED"
  | "TMS_LOAD_ASSIGNED"
  | "WMS_WAVE_RELEASED"
  | "WES_ALLOCATED"
  | "TMS_RATED"
  | "SHIPPED"
  | "ERP_CLOSED"
  | "FAILED";

export interface TenantContext {
  tenantId: string;
  correlationId: string;
}

export type ShipUrgency = "rush" | "standard";

export interface OrderExecutionContext extends TenantContext {
  orderId: string;
  omsOrderRef: string;
  wesVendor?: WesVendor;
  shipUrgency: ShipUrgency;
  priorityScore: number;
  promisedShipBy: string;
  /** Assigned by TMS before WMS wave — ties order to staging lane and trailer. */
  tmsLoadId?: string;
  stagingLane?: string;
  trailerId?: string;
  doorId?: string;
}

export interface TmsLoadReservation {
  loadId: string;
  stagingLane: string;
  trailerId: string;
  doorId: string;
  serviceLevel: "EXPEDITED" | "GROUND";
}

export type OsdAdjustmentType = "overage" | "shortage" | "damage";

export interface InventoryAdjustmentRequest {
  sku: string;
  locationId: string;
  reasonCode: string;
  adjustmentType: OsdAdjustmentType;
  quantityDelta: number;
  notes?: string;
}

export interface AuditLedgerPayload {
  tenantId: string;
  correlationId: string;
  ledgerEntryId: string;
  adjustmentType: OsdAdjustmentType;
  reasonCode: string;
  financeReviewRequired: boolean;
  legalHold: boolean;
  varianceAmount: number;
  capturedAt: string;
  payload: Record<string, unknown>;
}

export interface PubSubMessage<T = unknown> {
  messageId: string;
  topic: string;
  tenantId: string;
  correlationId: string;
  publishedAt: string;
  payload: T;
}

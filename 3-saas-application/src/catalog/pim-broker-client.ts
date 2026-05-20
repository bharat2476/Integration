import { globalBroker } from "../pubsub/broker.js";
import { childLogger } from "../shared/logger.js";

export interface CatalogDeltaPayload {
  pimBatchId: string;
  skuCount: number;
  operation: "UPSERT" | "DELETE";
  items: Array<{ sku: string; attributes: Record<string, unknown> }>;
}

/**
 * PIM Event Broker client — accepts massive async catalog deltas from upstream PIM.
 */
export class PimEventBrokerClient {
  async publishCatalogDelta(
    tenantId: string,
    correlationId: string,
    payload: CatalogDeltaPayload,
  ) {
    const log = childLogger({ tenantId, correlationId, pimBatchId: payload.pimBatchId });
    log.info({ skuCount: payload.skuCount }, "pim.catalog.delta.received");

    return globalBroker.publish("pim.catalog.delta", tenantId, correlationId, payload);
  }
}

export const pimBrokerClient = new PimEventBrokerClient();

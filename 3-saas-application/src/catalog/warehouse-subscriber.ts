import { globalBroker } from "../pubsub/broker.js";
import { childLogger } from "../shared/logger.js";
import type { CatalogDeltaPayload } from "./pim-broker-client.js";

export interface WarehouseNode {
  nodeId: string;
  wmsSiteCode: string;
  wesVendor: string;
}

/**
 * Downstream warehouse nodes ingest catalog updates without blocking order execution workflows.
 */
export class CatalogWarehouseSubscriber {
  constructor(private readonly nodes: WarehouseNode[]) {
    globalBroker.subscribe<CatalogDeltaPayload>("pim.catalog.delta", async (message) => {
      const log = childLogger({
        tenantId: message.tenantId,
        correlationId: message.correlationId,
        topic: message.topic,
      });

      await Promise.all(
        this.nodes.map(async (node) => {
          log.info({ nodeId: node.nodeId, skuCount: message.payload.skuCount }, "catalog.node.ingest.start");
          // Non-blocking simulated ingest — production: upsert to node-local SKU cache / WMS item master API
          await new Promise((r) => setTimeout(r, 5));
          log.info({ nodeId: node.nodeId }, "catalog.node.ingest.complete");
        }),
      );
    });
  }
}

export const defaultCatalogSubscriber = new CatalogWarehouseSubscriber([
  { nodeId: "wh-east-01", wmsSiteCode: "MHT-EAST", wesVendor: "Locus" },
  { nodeId: "wh-west-02", wmsSiteCode: "MHT-WEST", wesVendor: "AutoStore" },
]);

import { v4 as uuidv4 } from "uuid";
import { childLogger } from "../shared/logger.js";
import type { PubSubMessage } from "../shared/types.js";

export type TopicName =
  | "pim.catalog.delta"
  | "order.execution.stage"
  | "warehouse.task.completed"
  | "inventory.adjustment.posted";

type SubscriberHandler<T = unknown> = (message: PubSubMessage<T>) => Promise<void>;

/**
 * In-process Pub/Sub broker (production: replace with GCP Pub/Sub, SNS/SQS, or Kafka).
 */
export class EventBroker {
  private readonly subscribers = new Map<TopicName, Set<SubscriberHandler>>();
  private backlogDepth = 0;

  subscribe<T>(topic: TopicName, handler: SubscriberHandler<T>): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    const set = this.subscribers.get(topic)!;
    set.add(handler as SubscriberHandler);
    return () => set.delete(handler as SubscriberHandler);
  }

  async publish<T>(topic: TopicName, tenantId: string, correlationId: string, payload: T): Promise<PubSubMessage<T>> {
    const log = childLogger({ topic, tenantId, correlationId });
    const message: PubSubMessage<T> = {
      messageId: uuidv4(),
      topic,
      tenantId,
      correlationId,
      publishedAt: new Date().toISOString(),
      payload,
    };

    this.backlogDepth += 1;
    log.info({ messageId: message.messageId }, "pubsub.message.published");

    const handlers = this.subscribers.get(topic) ?? new Set();
    try {
      await Promise.all(
        Array.from(handlers).map(async (handler) => {
          try {
            await handler(message);
          } catch (err) {
            log.error({ err, messageId: message.messageId }, "pubsub.subscriber.failed");
            throw err;
          }
        }),
      );
    } finally {
      this.backlogDepth = Math.max(0, this.backlogDepth - 1);
    }

    return message;
  }

  getBacklogDepth(): number {
    return this.backlogDepth;
  }
}

export const globalBroker = new EventBroker();

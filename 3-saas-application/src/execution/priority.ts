export type ShipUrgency = "rush" | "standard";

export interface OrderSlaProfile {
  shipUrgency: ShipUrgency;
  priorityScore: number;
  slaTargetHours: number;
  promisedShipBy: string;
  waveTier: "RUSH" | "STANDARD";
  carrierServiceLevel: "EXPEDITED" | "GROUND";
}

const SLA_HOURS: Record<ShipUrgency, number> = {
  rush: 24,
  standard: 120,
};

const PRIORITY_SCORE: Record<ShipUrgency, number> = {
  rush: 100,
  standard: 10,
};

export function resolveOrderSla(shipUrgency: ShipUrgency, orderPlacedAt = new Date()): OrderSlaProfile {
  const hours = SLA_HOURS[shipUrgency];
  const promised = new Date(orderPlacedAt.getTime() + hours * 60 * 60 * 1000);

  return {
    shipUrgency,
    priorityScore: PRIORITY_SCORE[shipUrgency],
    slaTargetHours: hours,
    promisedShipBy: promised.toISOString(),
    waveTier: shipUrgency === "rush" ? "RUSH" : "STANDARD",
    carrierServiceLevel: shipUrgency === "rush" ? "EXPEDITED" : "GROUND",
  };
}

/** Lower number = higher priority in WMS wave queue (demo model). */
export function waveQueueRank(priorityScore: number): number {
  return priorityScore >= 100 ? 1 : 50;
}

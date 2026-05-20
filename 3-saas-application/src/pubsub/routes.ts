import { Router } from "express";
import { globalBroker } from "./broker.js";

export const pubsubRouter = Router();

pubsubRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    backlogDepth: globalBroker.getBacklogDepth(),
  });
});

pubsubRouter.get("/metrics/backlog", (_req, res) => {
  res.json({ metric: "omniroute_pubsub_backlog_depth", value: globalBroker.getBacklogDepth() });
});

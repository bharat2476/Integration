import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { catalogRouter } from "./catalog/routes.js";
import { defaultCatalogSubscriber } from "./catalog/warehouse-subscriber.js";
import { executionRouter } from "./execution/routes.js";
import { inventoryRouter } from "./inventory/routes.js";
import { pubsubRouter } from "./pubsub/routes.js";
import { seedDemoInventory } from "./inventory/services.js";
import { AppError } from "./shared/errors.js";
import { correlationMiddleware } from "./shared/correlation.js";
import { logger } from "./shared/logger.js";
import { tenantMiddleware } from "./shared/tenant.js";
import { warehouseRouter } from "./warehouse-tasks/routes.js";
import { mountDevPortal } from "./dev-portal/index.js";

// Bootstrap async catalog subscribers at module load
void defaultCatalogSubscriber;

export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use(correlationMiddleware);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      logger.info({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - start,
        tenantId: req.tenantId,
        correlationId: req.correlationId,
      }, "http.request");
    });
    next();
  });

  mountDevPortal(app);
  app.get("/health/live", (_req, res) => res.json({ status: "live" }));
  app.get("/health/ready", (_req, res) => {
    res.json({ status: "ready", subscribers: "catalog,execution,inventory" });
  });

  const api = express.Router();
  api.use(tenantMiddleware);
  api.use("/pubsub", pubsubRouter);
  api.use("/catalog", catalogRouter);
  api.use("/execution", executionRouter);
  api.use("/warehouse-tasks", warehouseRouter);
  api.use("/inventory", inventoryRouter);

  app.use("/api/v1", api);

  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: err.code,
        message: err.message,
        correlationId: req.correlationId,
        details: err.details,
      });
      return;
    }
    logger.error({ err, correlationId: req.correlationId }, "unhandled.error");
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unexpected server error",
      correlationId: req.correlationId,
    });
  });

  seedDemoInventory("tenant-demo", "SKU-HYDRO-001", "LOC-A1", 120);
  return app;
}

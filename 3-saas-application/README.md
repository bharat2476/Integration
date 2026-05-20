# 3-saas-application — OmniRoute-Core API

TypeScript Express API implementing event-driven domains: PIM catalog, order execution, warehouse tasks, and inventory hygiene.

## Run locally

```bash
cd 3-saas-application
npm install
npm run dev
```

Required headers on `/api/v1/*`:

- `x-tenant-id: tenant-demo`
- `x-correlation-id: <uuid>` (optional — generated if omitted)

## API map

| Domain | Method | Path |
|--------|--------|------|
| Catalog | POST | `/api/v1/catalog/delta` |
| Execution | POST | `/api/v1/execution/orders` |
| Execution | GET | `/api/v1/execution/orders/:orderId` |
| Warehouse | POST | `/api/v1/warehouse-tasks/wave/release` |
| Warehouse | POST | `/api/v1/warehouse-tasks/auto-pick` |
| Warehouse | POST | `/api/v1/warehouse-tasks/labels/print` |
| Inventory | POST | `/api/v1/inventory/cycle-count` |
| Inventory | POST | `/api/v1/inventory/reconciliation/daily` |
| Inventory | POST | `/api/v1/inventory/adjustments` |
| Pub/Sub metrics | GET | `/api/v1/pubsub/metrics/backlog` |

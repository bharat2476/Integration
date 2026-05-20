-- OmniRoute-Core multi-tenant PostgreSQL bootstrap
-- Strategy: dedicated schemas for enterprise tenants + RLS on shared operational tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS tenant_shared;

-- Session context set by application on every connection
CREATE OR REPLACE FUNCTION platform.current_tenant_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '');
$$ LANGUAGE SQL STABLE;

CREATE TABLE IF NOT EXISTS platform.tenants (
  tenant_id     TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  schema_mode   TEXT NOT NULL CHECK (schema_mode IN ('dedicated', 'shared_rls')),
  dedicated_schema TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shared tables protected by RLS
CREATE TABLE IF NOT EXISTS tenant_shared.orders (
  order_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       TEXT NOT NULL REFERENCES platform.tenants(tenant_id),
  correlation_id  UUID NOT NULL,
  oms_order_ref     TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_shared.inventory_ledger (
  ledger_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       TEXT NOT NULL REFERENCES platform.tenants(tenant_id),
  sku             TEXT NOT NULL,
  location_id     TEXT NOT NULL,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('overage', 'shortage', 'damage', 'cycle_count', 'reconciliation')),
  reason_code     TEXT NOT NULL,
  quantity_delta  NUMERIC(18, 4) NOT NULL,
  audit_payload   JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tenant_shared.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_shared.inventory_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_orders ON tenant_shared.orders
  USING (tenant_id = platform.current_tenant_id())
  WITH CHECK (tenant_id = platform.current_tenant_id());

CREATE POLICY tenant_isolation_inventory ON tenant_shared.inventory_ledger
  USING (tenant_id = platform.current_tenant_id())
  WITH CHECK (tenant_id = platform.current_tenant_id());

-- Dedicated schemas for large tenants (example loop — run per tenant registration)
-- CREATE SCHEMA tenant_acme;
-- GRANT USAGE ON SCHEMA tenant_acme TO omniroute_app_role;

CREATE INDEX IF NOT EXISTS idx_orders_tenant_correlation
  ON tenant_shared.orders (tenant_id, correlation_id);

CREATE INDEX IF NOT EXISTS idx_inventory_tenant_sku
  ON tenant_shared.inventory_ledger (tenant_id, sku, created_at DESC);

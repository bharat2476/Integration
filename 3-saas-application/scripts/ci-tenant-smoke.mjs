/**
 * CI smoke tests: multi-tenant header enforcement and parallel tenant order flows.
 * Run after `npm run build`.
 */
import http from "node:http";
import { createApp } from "../dist/app.js";

const TENANT_A = "tenant-ci-alpha";
const TENANT_B = "tenant-ci-beta";

function request(app, method, path, headers = {}, body) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const opts = {
        method,
        hostname: "127.0.0.1",
        port,
        path,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };
      const req = http.request(opts, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          server.close(() => {
            try {
              resolve({
                status: res.statusCode,
                body: data ? JSON.parse(data) : {},
              });
            } catch {
              resolve({ status: res.statusCode, body: data });
            }
          });
        });
      });
      req.on("error", (e) => {
        server.close(() => reject(e));
      });
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  });
}

async function main() {
  const app = createApp();
  let failed = 0;

  const noTenant = await request(app, "POST", "/api/v1/execution/orders", {
    "x-correlation-id": "ci-no-tenant",
  }, { omsOrderRef: "OMS-CI-1", shipUrgency: "standard" });
  if (noTenant.status !== 400) {
    console.error("FAIL: expected 400 without x-tenant-id, got", noTenant.status);
    failed++;
  } else {
    console.log("OK: rejects missing x-tenant-id");
  }

  const orderA = await request(
    app,
    "POST",
    "/api/v1/execution/orders",
    { "x-tenant-id": TENANT_A, "x-correlation-id": "ci-a-1" },
    { omsOrderRef: "OMS-CI-A", shipUrgency: "rush" },
  );
  if (orderA.status !== 202 || !orderA.body.orderId) {
    console.error("FAIL: tenant A order", orderA);
    failed++;
  } else {
    console.log("OK: tenant A order accepted", orderA.body.orderId);
  }

  const orderB = await request(
    app,
    "POST",
    "/api/v1/execution/orders",
    { "x-tenant-id": TENANT_B, "x-correlation-id": "ci-b-1" },
    { omsOrderRef: "OMS-CI-B", shipUrgency: "standard" },
  );
  if (orderB.status !== 202 || !orderB.body.orderId) {
    console.error("FAIL: tenant B order", orderB);
    failed++;
  } else {
    console.log("OK: tenant B order accepted", orderB.body.orderId);
  }

  if (orderA.body?.orderId && orderA.body.orderId === orderB.body?.orderId) {
    console.error("FAIL: order IDs must differ per request");
    failed++;
  }

  const lookupA = await request(app, "GET", `/api/v1/execution/orders/${orderA.body.orderId}`, {
    "x-tenant-id": TENANT_A,
    "x-correlation-id": "ci-a-2",
  });
  if (lookupA.status !== 200 || lookupA.body.tenantId !== TENANT_A) {
    console.error("FAIL: tenant A lookup", lookupA);
    failed++;
  } else {
    console.log("OK: tenant A lookup returns correct tenantId");
  }

  if (failed > 0) {
    console.error(`\n${failed} check(s) failed`);
    process.exit(1);
  }
  console.log("\nAll multi-tenant smoke checks passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

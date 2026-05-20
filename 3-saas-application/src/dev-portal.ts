import type { Request, Response } from "express";

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OmniRoute-Core — Local Dev</title>
  <style>
    :root { font-family: system-ui, Segoe UI, sans-serif; background: #0f1419; color: #e7ecf3; }
    body { max-width: 52rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .sub { color: #8b9cb3; font-size: 0.9rem; margin-bottom: 1.5rem; }
    section { background: #1a2332; border: 1px solid #2a3a52; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
    h2 { font-size: 1rem; margin: 0 0 0.75rem; color: #7eb8ff; }
    button { background: #2563eb; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; margin-top: 0.5rem; }
    button:hover { background: #1d4ed8; }
    pre { background: #0a0e14; padding: 0.75rem; border-radius: 6px; overflow: auto; font-size: 0.8rem; white-space: pre-wrap; word-break: break-word; }
    a { color: #7eb8ff; }
    label { display: block; font-size: 0.85rem; color: #8b9cb3; margin-top: 0.5rem; }
    input { width: 100%; box-sizing: border-box; padding: 0.4rem; margin-top: 0.25rem; border-radius: 4px; border: 1px solid #2a3a52; background: #0a0e14; color: #e7ecf3; }
  </style>
</head>
<body>
  <h1>OmniRoute-Core</h1>
  <p class="sub">Supply chain API — local dev on port 8080. Use the buttons below to call the API (requires <code>x-tenant-id</code>).</p>

  <section>
    <h2>Health</h2>
    <button type="button" data-get="/health/live">Liveness</button>
    <button type="button" data-get="/health/ready">Readiness</button>
  </section>

  <section>
    <h2>Headers (all API calls)</h2>
    <label>Tenant ID <input id="tenantId" value="tenant-demo" /></label>
  </section>

  <section>
    <h2>Try workflows</h2>
    <button type="button" data-post="/api/v1/execution/orders" data-body='{"omsOrderRef":"OMS-10042","wesVendor":"Locus"}'>Start order pipeline</button>
    <button type="button" data-get="/api/v1/pubsub/metrics/backlog">Pub/Sub backlog</button>
    <button type="button" data-post="/api/v1/inventory/cycle-count" data-body='{"sku":"SKU-HYDRO-001","locationId":"LOC-A1","countedQty":118}'>Cycle count</button>
    <button type="button" data-post="/api/v1/warehouse-tasks/labels/print" data-body='{"orderId":"ORD-DEMO-1","format":"ZPL"}'>Print label (ZPL mock)</button>
  </section>

  <section>
    <h2>Response</h2>
    <pre id="out">Click a button to run a request…</pre>
  </section>

  <p class="sub">API docs: <a href="https://github.com/bharat2476/Integration">Integration repo README</a> · JSON-only routes under <code>/api/v1/*</code></p>

  <script>
    const out = document.getElementById("out");
    const tenantInput = document.getElementById("tenantId");

    function headers() {
      return {
        "Content-Type": "application/json",
        "x-tenant-id": tenantInput.value.trim() || "tenant-demo",
        "x-correlation-id": crypto.randomUUID()
      };
    }

    async function run(method, path, body) {
      out.textContent = "Loading…";
      try {
        const opts = { method, headers: headers() };
        if (body) opts.body = body;
        const res = await fetch(path, opts);
        const text = await res.text();
        let parsed;
        try { parsed = JSON.parse(text); } catch { parsed = text; }
        out.textContent = res.status + " " + res.statusText + "\\n\\n" +
          (typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2));
      } catch (e) {
        out.textContent = "Error: " + e.message;
      }
    }

    document.querySelectorAll("button[data-get]").forEach(btn => {
      btn.addEventListener("click", () => run("GET", btn.dataset.get));
    });
    document.querySelectorAll("button[data-post]").forEach(btn => {
      btn.addEventListener("click", () => run("POST", btn.dataset.post, btn.dataset.body));
    });
  </script>
</body>
</html>`;

export function renderDevPortal(_req: Request, res: Response): void {
  res.type("html").send(HTML);
}

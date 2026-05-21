/** Display name (README: Omni-Channel End to End Integration). */
export const PRODUCT_NAME = "Omni-Channel End to End Integration";
export const PRODUCT_CODE_NAME = "OmniRoute-Core";

export const STYLES = `
  :root { font-family: system-ui, Segoe UI, sans-serif; background: #0f1419; color: #e7ecf3; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; }
  nav { width: 220px; flex-shrink: 0; background: #0a0e14; border-right: 1px solid #2a3a52; padding: 1.25rem 0; }
  nav a { display: block; padding: 0.5rem 1.25rem; color: #8b9cb3; text-decoration: none; font-size: 0.9rem; }
  nav a:hover { color: #e7ecf3; background: #1a2332; }
  nav a.active { color: #7eb8ff; border-left: 3px solid #2563eb; background: #1a2332; }
  nav .brand { padding: 0 1.25rem 1rem; font-weight: 600; color: #e7ecf3; font-size: 0.95rem; }
  nav .brand span { display: block; font-weight: 400; color: #8b9cb3; font-size: 0.75rem; margin-top: 0.25rem; }
  main { flex: 1; padding: 1.5rem 2rem; max-width: 56rem; }
  h1 { font-size: 1.35rem; margin: 0 0 0.35rem; }
  .sub { color: #8b9cb3; font-size: 0.88rem; margin-bottom: 1.25rem; }
  section { background: #1a2332; border: 1px solid #2a3a52; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  h2 { font-size: 0.95rem; margin: 0 0 0.75rem; color: #7eb8ff; }
  button, .btn { background: #2563eb; color: #fff; border: none; padding: 0.45rem 0.9rem; border-radius: 6px; cursor: pointer; margin: 0.35rem 0.5rem 0.35rem 0; font-size: 0.85rem; }
  button:hover { background: #1d4ed8; }
  button.secondary { background: #334155; }
  pre { background: #0a0e14; padding: 0.75rem; border-radius: 6px; overflow: auto; font-size: 0.78rem; white-space: pre-wrap; word-break: break-word; min-height: 4rem; }
  label { display: block; font-size: 0.82rem; color: #8b9cb3; margin-top: 0.6rem; }
  input, select, textarea { width: 100%; padding: 0.45rem; margin-top: 0.25rem; border-radius: 4px; border: 1px solid #2a3a52; background: #0a0e14; color: #e7ecf3; font-size: 0.85rem; }
  textarea { min-height: 5rem; font-family: ui-monospace, monospace; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  @media (max-width: 700px) { body { flex-direction: column; } nav { width: 100%; display: flex; flex-wrap: wrap; } nav a { padding: 0.4rem 0.75rem; } }
  .flow { font-family: ui-monospace, monospace; font-size: 0.8rem; color: #8b9cb3; line-height: 1.6; }
  .tag { display: inline-block; background: #253045; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-right: 0.35rem; }
  .sticky-out { position: sticky; bottom: 0; }
  a.ui-card { display: block; background: #253045; border: 1px solid #3d5270; border-radius: 8px; padding: 0.85rem 1rem; margin-bottom: 0.5rem; text-decoration: none; color: #e7ecf3; }
  a.ui-card:hover { border-color: #7eb8ff; }
  a.ui-card strong { color: #7eb8ff; }
`;

export const NAV_ITEMS: Array<{ id: string; href: string; label: string }> = [
  { id: "guide", href: "/ui/guide", label: "Product Guide" },
  { id: "home", href: "/", label: "Overview (API)" },
  { id: "orders", href: "/ui/orders", label: "Order execution" },
  { id: "catalog", href: "/ui/catalog", label: "PIM catalog" },
  { id: "warehouse", href: "/ui/warehouse", label: "Warehouse tasks" },
  { id: "inventory", href: "/ui/inventory", label: "Inventory & OS&D" },
  { id: "platform", href: "/ui/platform", label: "Global / Edge / Data" },
  { id: "health", href: "/ui/health", label: "Health & metrics" },
];

export function renderShell(activeId: string, title: string, subtitle: string, bodyHtml: string): string {
  const nav = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="${item.id === activeId ? "active" : ""}">${item.label}</a>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${PRODUCT_CODE_NAME}</title>
  <style>${STYLES}</style>
</head>
<body>
  <nav>
    <div class="brand">${PRODUCT_NAME}<span>${PRODUCT_CODE_NAME} · local :8080</span></div>
    ${nav}
  </nav>
  <main>
    <h1>${title}</h1>
    <p class="sub">${subtitle}</p>
    <section>
      <h2>Tenant context</h2>
      <label>Tenant ID (x-tenant-id) <input id="tenantId" value="tenant-demo" /></label>
    </section>
    ${bodyHtml}
    <section class="sticky-out">
      <h2>API response</h2>
      <pre id="out">Run an action to see the response…</pre>
    </section>
  </main>
  <script>${API_SCRIPT}</script>
</body>
</html>`;
}

export const API_SCRIPT = `
  const out = document.getElementById("out");
  const tenantInput = document.getElementById("tenantId");

  function headers() {
    return {
      "Content-Type": "application/json",
      "x-tenant-id": (tenantInput && tenantInput.value.trim()) || "tenant-demo",
      "x-correlation-id": crypto.randomUUID()
    };
  }

  window.runApi = async function(method, path, body) {
    out.textContent = "Loading…";
    try {
      const opts = { method, headers: headers() };
      if (body) opts.body = typeof body === "string" ? body : JSON.stringify(body);
      const res = await fetch(path, opts);
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = text; }
      out.textContent = res.status + " " + res.statusText + "\\n\\n" +
        (typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2));
    } catch (e) {
      out.textContent = "Error: " + e.message;
    }
  };

  document.querySelectorAll("[data-get]").forEach(btn => {
    btn.addEventListener("click", () => runApi("GET", btn.dataset.get));
  });
  document.querySelectorAll("[data-post]").forEach(btn => {
    btn.addEventListener("click", () => {
      const body = btn.dataset.bodyFrom
        ? document.getElementById(btn.dataset.bodyFrom).value
        : btn.dataset.body;
      runApi("POST", btn.dataset.post, body);
    });
  });
`;

export function renderGuideShell(activeId: string, title: string, subtitle: string, bodyHtml: string, extraStyles = ""): string {
  const nav = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="${item.id === activeId ? "active" : ""}">${item.label}</a>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${PRODUCT_CODE_NAME}</title>
  <style>${STYLES}${extraStyles}</style>
</head>
<body>
  <nav>
    <div class="brand">${PRODUCT_NAME}<span>${PRODUCT_CODE_NAME} · local :8080</span></div>
    ${nav}
  </nav>
  <main>
    <h1>${title}</h1>
    <p class="sub">${subtitle}</p>
    ${bodyHtml}
  </main>
</body>
</html>`;
}

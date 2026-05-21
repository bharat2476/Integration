import type { Express, Request, Response } from "express";
import { listPageIds, renderPage } from "./pages.js";

export function mountDevPortal(app: Express): void {
  app.get("/", (_req, res) => {
    res.redirect("/ui/guide");
  });

  app.get("/ui", (_req, res) => {
    res.redirect("/ui/guide");
  });

  app.get("/ui/:page", (req, res) => {
    const page = String(req.params.page ?? "").toLowerCase();
    if (!listPageIds().includes(page)) {
      res.redirect("/");
      return;
    }
    const html = renderPage(page);
    if (html) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.type("html").send(html);
    }
    else res.redirect("/");
  });
}

/** @deprecated use mountDevPortal */
export function renderDevPortal(_req: Request, res: Response): void {
  const html = renderPage("home");
  res.type("html").send(html ?? "");
}

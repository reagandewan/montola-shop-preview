// ============================================================================
// Notices API routes for the Montola demo backend.
// Registered from server.js via registerNotices(app, ctx).
// Public: list active notices. Admin (ADMIN/MANAGER): full CRUD.
// ============================================================================

const store = require("./noticesData");

function registerNotices(app, ctx) {
  const { auth } = ctx;
  const byId = (id) => store.notices.find((n) => n.id === Number(id));
  const sorted = (list) => [...list].sort((a, b) => a.orderIndex - b.orderIndex);

  // ---- Public: active notices for the homepage --------------------------
  app.get("/api/v1/notices", (_req, res) =>
    res.json(sorted(store.notices.filter((n) => n.active)))
  );

  // ---- Admin ------------------------------------------------------------
  app.get("/api/v1/notices/admin", auth(["ADMIN", "MANAGER"]), (_req, res) =>
    res.json(sorted(store.notices))
  );

  app.post("/api/v1/notices/admin", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const b = req.body || {};
    const n = {
      id: ++store.counters.notice,
      title: b.title || "",
      message: b.message || "",
      type: b.type || "INFO",
      link: b.link || "",
      active: b.active !== undefined ? !!b.active : true,
      orderIndex: b.orderIndex ?? store.notices.length,
    };
    store.notices.push(n);
    res.status(201).json(n);
  });

  app.put("/api/v1/notices/admin/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const n = byId(req.params.id);
    if (!n) return res.status(404).json({ message: "Notice not found" });
    Object.assign(n, req.body || {});
    res.json(n);
  });

  app.delete("/api/v1/notices/admin/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const i = store.notices.findIndex((n) => n.id === Number(req.params.id));
    if (i >= 0) store.notices.splice(i, 1);
    res.status(204).end();
  });
}

module.exports = { registerNotices };

// ============================================================================
// Shop API routes for the Montola demo backend.
// Registered from server.js via registerShop(app, ctx). All access is decided
// server-side: catalog + previews are public; full product content requires a
// valid Entitlement; downloads require a DOWNLOAD-mode bundle entitlement AND a
// teacher/coaching account.
// ============================================================================

const shop = require("./shopData");

function registerShop(app, ctx) {
  const { auth, userById, chapterById, subjectById, classById, isAdminOrManager, getUserFromReq } = ctx;

  const levelById = (id) => shop.levels.find((l) => l.id === Number(id));
  const shopClassById = (id) => shop.classes.find((c) => c.id === Number(id));
  const productById = (id) => shop.products.find((p) => p.id === Number(id));
  const bundleById = (id) => shop.bundles.find((b) => b.id === Number(id));

  // ---- access helpers ------------------------------------------------------
  const directlyEntitled = (userId, productId) =>
    shop.entitlements.some((e) => e.userId === userId && e.productId === productId);

  const bundleEntitled = (userId, productId) =>
    shop.entitlements
      .filter((e) => e.userId === userId && e.bundleId)
      .some((e) => {
        const b = bundleById(e.bundleId);
        return b && b.productIds.includes(productId);
      });

  const isEntitled = (user, productId) => {
    if (!user) return false;
    if (isAdminOrManager(user) || user.roles.includes("TEACHER")) return true; // staff preview
    return directlyEntitled(user.id, productId) || bundleEntitled(user.id, productId);
  };

  // download eligibility: download-type product, owned via a DOWNLOAD bundle,
  // and the account is a teacher or coaching/institution account.
  const canDownload = (user, product) => {
    if (!user) return false;
    if (!shop.DOWNLOADABLE_TYPES.includes(product.type)) return false;
    const eligibleAccount = user.accountType === "COACHING" || user.roles.includes("TEACHER") || isAdminOrManager(user);
    if (!eligibleAccount) return false;
    const ownsDownloadBundle = shop.entitlements
      .filter((e) => e.userId === user.id && e.bundleId)
      .some((e) => {
        const b = bundleById(e.bundleId);
        return b && b.accessMode === "DOWNLOAD" && b.productIds.includes(product.id);
      });
    return ownsDownloadBundle || isAdminOrManager(user);
  };

  // ---- DTO assemblers ------------------------------------------------------
  function scopeLabels(p) {
    const subject = p.subjectId ? subjectById(p.subjectId) : null;
    const chapter = p.chapterId ? chapterById(p.chapterId) : null;
    const level = p.levelId ? levelById(p.levelId) : null;
    const cls = p.classId ? shopClassById(p.classId) : null;
    return {
      levelId: p.levelId || null, levelName: level ? level.name : null,
      classId: p.classId || null, className: cls ? cls.name : null,
      subjectId: p.subjectId || null, subjectName: subject ? subject.name : null,
      chapterId: p.chapterId || null, chapterTitle: chapter ? chapter.title : null,
    };
  }

  function productCard(p) {
    return {
      id: p.id, title: p.title, description: p.description, type: p.type, format: p.format,
      price: p.price, status: p.status, featured: !!p.featured, preview: p.preview,
      downloadable: shop.DOWNLOADABLE_TYPES.includes(p.type),
      ...scopeLabels(p),
    };
  }

  function bundleCard(b) {
    const level = b.levelId ? levelById(b.levelId) : null;
    const subject = b.subjectId ? subjectById(b.subjectId) : null;
    return {
      id: b.id, title: b.title, description: b.description, audience: b.audience,
      accessMode: b.accessMode, price: b.price, status: b.status,
      levelId: b.levelId || null, levelName: level ? level.name : null,
      subjectId: b.subjectId || null, subjectName: subject ? subject.name : null,
      productCount: b.productIds.length,
      products: b.productIds.map(productById).filter(Boolean).map(productCard),
    };
  }

  function paymentDto(p) {
    const u = userById(p.userId);
    const product = p.productId ? productById(p.productId) : null;
    const bundle = p.bundleId ? bundleById(p.bundleId) : null;
    return {
      id: p.id, userId: p.userId, userName: u ? u.fullName : null,
      productId: p.productId, productTitle: product ? product.title : null,
      bundleId: p.bundleId, bundleTitle: bundle ? bundle.title : null,
      itemTitle: product ? product.title : bundle ? bundle.title : null,
      amount: p.amount, senderNumber: p.senderNumber, transactionId: p.transactionId,
      paymentMethod: p.paymentMethod, status: p.status, verifiedAt: p.verifiedAt,
    };
  }

  function grantEntitlement(userId, payment) {
    const already = shop.entitlements.some(
      (e) => e.userId === userId && e.productId === payment.productId && e.bundleId === payment.bundleId
    );
    if (!already) {
      shop.entitlements.push({
        id: ++shop.counters.entitlement, userId,
        productId: payment.productId || null, bundleId: payment.bundleId || null,
        source: "PAYMENT", grantedAt: new Date().toISOString().slice(0, 19),
      });
    }
  }

  // ==========================================================================
  // PUBLIC catalog
  // ==========================================================================
  app.get("/api/v1/shop/levels", (_req, res) => res.json(shop.levels));

  // Classes (optionally filtered by level) for the class-tier browse.
  app.get("/api/v1/shop/classes", (req, res) => {
    const { levelId } = req.query;
    let list = [...shop.classes].sort((a, b) => a.levelId - b.levelId || a.orderIndex - b.orderIndex);
    if (levelId) list = list.filter((c) => c.levelId === Number(levelId));
    res.json(list);
  });

  app.get("/api/v1/shop/products", (req, res) => {
    const { type, levelId, classId, subjectId, chapterId, format } = req.query;
    let list = shop.products.filter((p) => p.status === "PUBLISHED");
    if (type) list = list.filter((p) => p.type === type);
    if (format) list = list.filter((p) => p.format === format);
    if (levelId) list = list.filter((p) => p.levelId === Number(levelId));
    if (classId) list = list.filter((p) => p.classId === Number(classId));
    if (subjectId) list = list.filter((p) => p.subjectId === Number(subjectId));
    if (chapterId) list = list.filter((p) => p.chapterId === Number(chapterId));
    res.json(list.map(productCard));
  });

  app.get("/api/v1/shop/featured", (_req, res) =>
    res.json(shop.products.filter((p) => p.featured && p.status === "PUBLISHED").map(productCard))
  );

  app.get("/api/v1/shop/bundles", (_req, res) =>
    res.json(shop.bundles.filter((b) => b.status === "PUBLISHED").map(bundleCard))
  );

  app.get("/api/v1/shop/bundles/:id", (req, res) => {
    const b = bundleById(req.params.id);
    if (!b) return res.status(404).json({ message: "Bundle not found" });
    res.json(bundleCard(b));
  });

  // product detail — public metadata + preview; flags access if logged in
  app.get("/api/v1/shop/products/:id", optionalAuth, (req, res) => {
    const p = productById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json({
      ...productCard(p),
      entitled: isEntitled(req.user, p.id),
      canDownload: canDownload(req.user, p),
    });
  });

  // ==========================================================================
  // GATED full content — requires entitlement
  // ==========================================================================
  app.get("/api/v1/shop/products/:id/content", auth(), (req, res) => {
    const p = productById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    if (!isEntitled(req.user, p.id)) {
      return res.status(403).json({ message: "Purchase required to view this product" });
    }
    // Online viewing payload. PDFs would be streamed + watermarked server-side;
    // here we return a watermark stamped with the viewer's identity to show intent.
    res.json({
      id: p.id, title: p.title, type: p.type, format: p.format,
      watermark: `Licensed to ${req.user.email} — Montola School`,
      ...p.content,
    });
  });

  // ==========================================================================
  // GATED download — only download-bundle entitlement + teacher/coaching
  // ==========================================================================
  app.get("/api/v1/shop/products/:id/download", auth(), (req, res) => {
    const p = productById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    if (!canDownload(req.user, p)) {
      return res.status(403).json({ message: "Download not permitted for this account/product" });
    }
    // Demo: a short-lived signed link would be generated here.
    res.json({
      fileId: p.content.fileId || `demo_${p.id}`,
      url: `/api/v1/shop/files/${p.id}?token=demo-signed-token`,
      expiresInSeconds: 300,
      watermark: `${req.user.email} · ${req.user.id}`,
    });
  });

  // ==========================================================================
  // PURCHASES + PAYMENTS
  // ==========================================================================
  app.get("/api/v1/shop/my-purchases", auth(), (req, res) => {
    const mine = shop.entitlements.filter((e) => e.userId === req.user.id);
    res.json(mine.map((e) => {
      if (e.productId) {
        const p = productById(e.productId);
        return p ? { kind: "PRODUCT", grantedAt: e.grantedAt, ...productCard(p) } : null;
      }
      const b = bundleById(e.bundleId);
      return b ? { kind: "BUNDLE", grantedAt: e.grantedAt, ...bundleCard(b) } : null;
    }).filter(Boolean));
  });

  app.post("/api/v1/shop/payments/submit", auth(), (req, res) => {
    const b = req.body || {};
    if (!b.productId && !b.bundleId) {
      return res.status(400).json({ message: "productId or bundleId is required" });
    }
    const p = {
      id: ++shop.counters.payment, userId: req.user.id,
      productId: b.productId ? Number(b.productId) : null,
      bundleId: b.bundleId ? Number(b.bundleId) : null,
      amount: b.amount, senderNumber: b.senderNumber, transactionId: b.transactionId,
      paymentMethod: b.paymentMethod || "BKASH", status: "PENDING", verifiedAt: null, verifiedByUserId: null,
    };
    shop.payments.push(p);
    res.status(201).json(paymentDto(p));
  });

  app.get("/api/v1/shop/payments/my", auth(), (req, res) =>
    res.json(shop.payments.filter((p) => p.userId === req.user.id).map(paymentDto))
  );

  app.get("/api/v1/shop/payments", auth(["ADMIN", "MANAGER"]), (_req, res) =>
    res.json(shop.payments.map(paymentDto))
  );

  app.get("/api/v1/shop/payments/unverified", auth(["ADMIN", "MANAGER"]), (_req, res) =>
    res.json(shop.payments.filter((p) => p.status === "PENDING").map(paymentDto))
  );

  app.put("/api/v1/shop/payments/:id/verify", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const p = shop.payments.find((x) => x.id === Number(req.params.id));
    if (!p) return res.status(404).json({ message: "Payment not found" });
    p.status = "VERIFIED";
    p.verifiedAt = new Date().toISOString().slice(0, 19);
    p.verifiedByUserId = req.user.id;
    grantEntitlement(p.userId, p);
    res.json(paymentDto(p));
  });

  app.put("/api/v1/shop/payments/:id/reject", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const p = shop.payments.find((x) => x.id === Number(req.params.id));
    if (!p) return res.status(404).json({ message: "Payment not found" });
    p.status = "REJECTED";
    res.json(paymentDto(p));
  });

  // ==========================================================================
  // ADMIN product/bundle management (minimal)
  // ==========================================================================
  app.get("/api/v1/shop/admin/products", auth(["ADMIN", "MANAGER"]), (_req, res) =>
    res.json(shop.products.map(productCard))
  );
  app.post("/api/v1/shop/admin/products", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const b = req.body || {};
    const p = {
      id: ++shop.counters.product, title: b.title, description: b.description || "",
      type: b.type, format: b.format || "PDF", price: b.price ?? 0,
      levelId: b.levelId || null, classId: b.classId || null,
      subjectId: b.subjectId || null, chapterId: b.chapterId || null,
      status: b.status || "DRAFT", featured: !!b.featured, preview: b.preview || "",
      content: b.content || {},
    };
    shop.products.push(p);
    res.status(201).json(productCard(p));
  });
  app.put("/api/v1/shop/admin/products/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const p = productById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    Object.assign(p, req.body || {});
    res.json(productCard(p));
  });
  app.delete("/api/v1/shop/admin/products/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const i = shop.products.findIndex((p) => p.id === Number(req.params.id));
    if (i >= 0) shop.products.splice(i, 1);
    res.status(204).end();
  });

  // ---- admin: bundles ------------------------------------------------------
  app.get("/api/v1/shop/admin/bundles", auth(["ADMIN", "MANAGER"]), (_req, res) =>
    res.json(shop.bundles.map(bundleCard))
  );
  app.post("/api/v1/shop/admin/bundles", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const b = req.body || {};
    const bundle = {
      id: ++shop.counters.bundle, title: b.title, description: b.description || "",
      audience: b.audience || "GENERAL", accessMode: b.accessMode || "ONLINE",
      levelId: b.levelId || null, subjectId: b.subjectId || null,
      price: b.price ?? 0, status: b.status || "DRAFT",
      productIds: Array.isArray(b.productIds) ? b.productIds.map(Number) : [],
    };
    shop.bundles.push(bundle);
    res.status(201).json(bundleCard(bundle));
  });
  app.put("/api/v1/shop/admin/bundles/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const bundle = bundleById(req.params.id);
    if (!bundle) return res.status(404).json({ message: "Bundle not found" });
    const b = req.body || {};
    if (Array.isArray(b.productIds)) b.productIds = b.productIds.map(Number);
    Object.assign(bundle, b);
    res.json(bundleCard(bundle));
  });
  app.delete("/api/v1/shop/admin/bundles/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
    const i = shop.bundles.findIndex((x) => x.id === Number(req.params.id));
    if (i >= 0) shop.bundles.splice(i, 1);
    res.status(204).end();
  });

  // optional-auth middleware: sets req.user if a valid token is present, never blocks
  function optionalAuth(req, _res, next) {
    req.user = getUserFromReq(req) || undefined;
    next();
  }
}

module.exports = { registerShop };

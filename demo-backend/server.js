// ============================================================================
// Montola School — DEMO backend
// A lightweight Express server that implements the exact API contract the
// Montola-School-FrontEnd expects, backed by in-memory seed data (see data.js).
// Real JWT login + refresh so you can log in as admin/teacher/student.
// NOT for production — passwords are plain text and data is in memory.
// ============================================================================

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./data");
const { registerShop } = require("./shopRoutes");

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = "montola-demo-secret-not-for-production";
const ACCESS_TTL = "60m";
const REFRESH_TTL = "7d";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));

// Tiny request logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const findUser = (email) => db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
const userById = (id) => db.users.find((u) => u.id === Number(id));
const classById = (id) => db.classes.find((c) => c.id === Number(id));
const subjectById = (id) => db.subjects.find((s) => s.id === Number(id));
const chapterById = (id) => db.chapters.find((c) => c.id === Number(id));
const topicById = (id) => db.topics.find((t) => t.id === Number(id));
const contentById = (id) => db.contentItems.find((c) => c.id === Number(id));

function signTokens(user) {
  const payload = { sub: user.email, uid: user.id, roles: user.roles };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign({ sub: user.email, uid: user.id, type: "refresh" }, JWT_SECRET, { expiresIn: REFRESH_TTL });
  return { accessToken, refreshToken };
}

// Auth middleware — sets req.user, or 401. Pass `roles` to require one of them.
function auth(roles) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or malformed Authorization header" });
    }
    try {
      const decoded = jwt.verify(header.substring(7), JWT_SECRET);
      const user = userById(decoded.uid) || findUser(decoded.sub);
      if (!user) return res.status(401).json({ message: "User not found" });
      req.user = user;
      if (roles && roles.length && !user.roles.some((r) => roles.includes(r))) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (e) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

const isAdminOrManager = (u) => u.roles.includes("ADMIN") || u.roles.includes("MANAGER");

// ---- DTO assemblers --------------------------------------------------------
function teacherDtosForChapter(chapterId) {
  return db.chapterTeachers
    .filter((ct) => ct.chapterId === chapterId)
    .map((ct) => userById(ct.teacherId))
    .filter(Boolean)
    .map((t) => ({ id: t.id, fullName: t.fullName, email: t.email }));
}

function chapterDto(ch) {
  const subject = subjectById(ch.subjectId);
  const cls = subject ? classById(subject.classId) : null;
  return {
    id: ch.id,
    title: ch.title,
    description: ch.description,
    status: ch.status,
    orderIndex: ch.orderIndex,
    subjectId: ch.subjectId,
    subjectName: subject ? subject.name : null,
    classId: cls ? cls.id : null,
    className: cls ? cls.name : null,
    videoId: ch.videoId,
    price: ch.price,
    free: ch.isFree,
    teachers: teacherDtosForChapter(ch.id),
  };
}

function subjectDto(s) {
  const cls = classById(s.classId);
  return {
    id: s.id, name: s.name, description: s.description, orderIndex: s.orderIndex,
    classId: s.classId, className: cls ? cls.name : null,
  };
}

function classDto(c) {
  return { id: c.id, name: c.name, description: c.description };
}

function userDto(u) {
  return {
    id: u.id, email: u.email, fullName: u.fullName, phone: u.phone,
    roles: u.roles, hasProfilePicture: false,
    createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00",
  };
}

function contentItemStructureDto(ci) {
  return { id: ci.id, title: ci.title, type: ci.type, orderIndex: ci.orderIndex };
}

function topicStructureDto(t) {
  const items = db.contentItems
    .filter((ci) => ci.topicId === t.id)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(contentItemStructureDto);
  return { id: t.id, title: t.title, orderIndex: t.orderIndex, contentItems: items };
}

function chapterStructureDto(ch, { includeContent = true } = {}) {
  const subject = subjectById(ch.subjectId);
  const cls = subject ? classById(subject.classId) : null;
  const topicsForCh = db.topics
    .filter((t) => t.chapterId === ch.id)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((t) => {
      const dto = topicStructureDto(t);
      if (!includeContent) return { ...dto }; // public still shows titles
      return dto;
    });
  return {
    id: ch.id, title: ch.title, status: ch.status, orderIndex: ch.orderIndex,
    subjectId: ch.subjectId, subjectName: subject ? subject.name : null,
    classId: cls ? cls.id : null, className: cls ? cls.name : null,
    topics: topicsForCh,
  };
}

function subjectStructureDto(s) {
  const cls = classById(s.classId);
  const chs = db.chapters
    .filter((c) => c.subjectId === s.id)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((c) => chapterStructureDto(c));
  return {
    id: s.id, name: s.name, description: s.description, orderIndex: s.orderIndex,
    classId: s.classId, className: cls ? cls.name : null, chapters: chs,
  };
}

function classStructureDto(c) {
  const subs = db.subjects
    .filter((s) => s.classId === c.id)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(subjectStructureDto);
  return { id: c.id, name: c.name, description: c.description, subjects: subs };
}

function paymentDto(p) {
  const u = userById(p.userId);
  const ch = chapterById(p.chapterId);
  const verifier = p.verifiedByUserId ? userById(p.verifiedByUserId) : null;
  return {
    id: p.id, userId: p.userId, userName: u ? u.fullName : null,
    chapterId: p.chapterId, chapterTitle: ch ? ch.title : null,
    senderNumber: p.senderNumber, transactionId: p.transactionId,
    amount: p.amount, paymentMethod: p.paymentMethod, status: p.status,
    verifiedAt: p.verifiedAt, verifiedByUserId: p.verifiedByUserId,
    verifiedByName: verifier ? verifier.fullName : null,
  };
}

function contentResponse(ci) {
  const topic = topicById(ci.topicId);
  const base = { topicId: ci.topicId, topicTitle: topic ? topic.title : null, orderIndex: ci.orderIndex };
  if (ci.type === "LECTURE") {
    const l = db.lectures[ci.id] || { id: 0, videoId: "", content: "" };
    return { id: l.id, title: ci.title, videoId: l.videoId, content: l.content, type: "LECTURE", contentItemId: ci.id, ...base };
  }
  if (ci.type === "PDF") {
    const p = db.pdfs[ci.id] || { id: 0, googleFileId: "", pageCount: 0 };
    return { id: p.id, title: ci.title, googleFileId: p.googleFileId, pageCount: p.pageCount, type: "PDF", contentItemId: ci.id, ...base };
  }
  if (ci.type === "QUIZ") {
    const q = db.quizzes[ci.id] || { id: 0, quizType: "MCQ", questions: [] };
    return { ...q, title: ci.title, type: "QUIZ", contentItemId: ci.id, ...base };
  }
  return { id: ci.id, title: ci.title, type: ci.type, contentItemId: ci.id, ...base };
}

const isEnrolled = (userId, chapterId) =>
  db.enrollments.some((e) => e.userId === userId && e.chapterId === chapterId);

// ============================================================================
// HEALTH
// ============================================================================
app.get("/internal/health", (_req, res) => res.json({ status: "UP" }));

// ============================================================================
// AUTH  (/api/auth)
// ============================================================================
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = findUser(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.isActivated) {
    return res.status(403).json({ message: "Account not activated" });
  }
  const { accessToken, refreshToken } = signTokens(user);
  res.json({ accessToken, refreshToken, email: user.email, fullName: user.fullName, roles: user.roles });
});

app.post("/api/auth/refresh-token", (req, res) => {
  const { refreshToken } = req.body || {};
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = userById(decoded.uid) || findUser(decoded.sub);
    if (!user) return res.status(401).json({ message: "User not found" });
    const tokens = signTokens(user);
    res.json(tokens);
  } catch (e) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { email, fullName, phone, password } = req.body || {};
  if (findUser(email)) return res.status(409).json({ message: "Email already exists" });
  const user = { id: ++db.counters.user, email, fullName, phone, password, roles: ["STUDENT"], isActivated: true };
  db.users.push(user);
  // Demo: auto-activate (no email service). Frontend will route to check-email.
  res.status(201).json(userDto(user));
});

app.post("/api/auth/admin/register", auth(["ADMIN"]), (req, res) => {
  const { email, fullName, phone, password, roles } = req.body || {};
  if (findUser(email)) return res.status(409).json({ message: "Email already exists" });
  const user = { id: ++db.counters.user, email, fullName, phone, password: password || "password123", roles: roles && roles.length ? roles : ["TEACHER"], isActivated: true };
  db.users.push(user);
  res.status(201).json(userDto(user));
});

app.post("/api/auth/activate", (req, res) => res.json("Account activated successfully"));
app.post("/api/auth/resend-activation", (req, res) => res.json("A new activation link has been sent!"));
app.post("/api/auth/forgot-password", (req, res) => res.json("Password reset link has been sent!"));
app.post("/api/auth/reset-password", (req, res) => res.json("Password reset successfully!"));
app.post("/api/auth/change-password", auth(), (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (oldPassword && req.user.password !== oldPassword) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }
  if (newPassword) req.user.password = newPassword;
  res.json("Password changed successfully");
});
app.post("/api/auth/logout", auth(), (_req, res) => res.status(204).end());

// ============================================================================
// USERS  (/api/users)
// ============================================================================
app.get("/api/users", auth(["ADMIN", "MANAGER"]), (_req, res) => res.json(db.users.map(userDto)));
app.get("/api/users/role/:role", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const role = req.params.role.toUpperCase();
  res.json(db.users.filter((u) => u.roles.includes(role)).map((u) => ({ id: u.id, fullName: u.fullName, email: u.email })));
});
app.get("/api/users/email", auth(), (req, res) => {
  const u = findUser(req.query.email);
  if (!u) return res.status(404).json({ message: "User not found" });
  res.json(userDto(u));
});
app.get("/api/users/exists", auth(["ADMIN", "MANAGER"]), (req, res) => res.json(!!findUser(req.query.email)));
app.get("/api/users/:id/profile-picture", (_req, res) => res.status(404).end());
app.post("/api/users/:id/profile-picture", auth(), (_req, res) => res.json({ message: "uploaded (demo no-op)" }));

// ============================================================================
// ADMIN STATISTICS  (/api/v1/admin)
// ============================================================================
app.get("/api/v1/admin/statistics", auth(["ADMIN", "MANAGER"]), (_req, res) => {
  res.json({
    userStats: {
      totalUsers: db.users.length,
      activeUsers: db.users.filter((u) => u.isActivated).length,
      admins: db.users.filter((u) => u.roles.includes("ADMIN")).length,
      managers: db.users.filter((u) => u.roles.includes("MANAGER")).length,
      teachers: db.users.filter((u) => u.roles.includes("TEACHER")).length,
      students: db.users.filter((u) => u.roles.includes("STUDENT")).length,
    },
    courseStats: {
      totalClasses: db.classes.length,
      totalSubjects: db.subjects.length,
      totalChapters: db.chapters.length,
    },
    chapterStats: {
      totalDraft: db.chapters.filter((c) => c.status === "DRAFT").length,
      totalPublished: db.chapters.filter((c) => c.status === "PUBLISHED").length,
      totalFree: db.chapters.filter((c) => c.isFree).length,
    },
  });
});

// ============================================================================
// CLASSES  (/api/v1/classes)
// ============================================================================
app.get("/api/v1/classes", (_req, res) => res.json(db.classes.map(classDto))); // public
app.post("/api/v1/classes", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const c = { id: ++db.counters.class, name: req.body.name, description: req.body.description || "" };
  db.classes.push(c);
  res.status(201).json(classDto(c));
});
app.get("/api/v1/classes/:id/public-structure", (req, res) => {
  const c = classById(req.params.id);
  if (!c) return res.status(404).json({ message: "Class not found" });
  res.json(classStructureDto(c));
});
app.get("/api/v1/classes/:id/structure", auth(), (req, res) => {
  const c = classById(req.params.id);
  if (!c) return res.status(404).json({ message: "Class not found" });
  res.json(classStructureDto(c));
});
app.get("/api/v1/classes/:id", auth(), (req, res) => {
  const c = classById(req.params.id);
  if (!c) return res.status(404).json({ message: "Class not found" });
  res.json(classDto(c));
});
app.put("/api/v1/classes/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const c = classById(req.params.id);
  if (!c) return res.status(404).json({ message: "Class not found" });
  Object.assign(c, { name: req.body.name ?? c.name, description: req.body.description ?? c.description });
  res.json(classDto(c));
});
app.delete("/api/v1/classes/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const i = db.classes.findIndex((c) => c.id === Number(req.params.id));
  if (i >= 0) db.classes.splice(i, 1);
  res.status(204).end();
});

// ============================================================================
// SUBJECTS  (/api/v1/subjects)
// ============================================================================
app.get("/api/v1/subjects", auth(["ADMIN", "MANAGER"]), (_req, res) => res.json(db.subjects.map(subjectDto)));
app.post("/api/v1/subjects", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const s = { id: ++db.counters.subject, classId: Number(req.body.classId), name: req.body.name, description: req.body.description || "", orderIndex: req.body.orderIndex ?? 0 };
  db.subjects.push(s);
  res.status(201).json(subjectDto(s));
});
app.get("/api/v1/subjects/:id/public-structure", (req, res) => {
  const s = subjectById(req.params.id);
  if (!s) return res.status(404).json({ message: "Subject not found" });
  res.json(subjectStructureDto(s));
});
app.get("/api/v1/subjects/:id/structure", auth(), (req, res) => {
  const s = subjectById(req.params.id);
  if (!s) return res.status(404).json({ message: "Subject not found" });
  res.json(subjectStructureDto(s));
});
app.get("/api/v1/subjects/:id", auth(), (req, res) => {
  const s = subjectById(req.params.id);
  if (!s) return res.status(404).json({ message: "Subject not found" });
  res.json(subjectDto(s));
});
app.put("/api/v1/subjects/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const s = subjectById(req.params.id);
  if (!s) return res.status(404).json({ message: "Subject not found" });
  Object.assign(s, {
    name: req.body.name ?? s.name, description: req.body.description ?? s.description,
    classId: req.body.classId ?? s.classId, orderIndex: req.body.orderIndex ?? s.orderIndex,
  });
  res.json(subjectDto(s));
});
app.delete("/api/v1/subjects/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const i = db.subjects.findIndex((s) => s.id === Number(req.params.id));
  if (i >= 0) db.subjects.splice(i, 1);
  res.status(204).end();
});

// ============================================================================
// CHAPTERS  (/api/v1/chapters)
// ============================================================================
app.get("/api/v1/chapters", auth(["ADMIN", "MANAGER"]), (_req, res) => res.json(db.chapters.map(chapterDto)));
app.post("/api/v1/chapters", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const b = req.body || {};
  const ch = {
    id: ++db.counters.chapter, subjectId: Number(b.subjectId), title: b.title, description: b.description || "",
    status: b.status || "DRAFT", orderIndex: b.orderIndex ?? 0, videoId: b.videoId || "",
    price: b.price ?? 0, isFree: !!b.free, createdBy: req.user.id,
  };
  db.chapters.push(ch);
  res.status(201).json(chapterDto(ch));
});
app.get("/api/v1/chapters/public/free", (_req, res) => {
  res.json(db.chapters.filter((c) => c.isFree && c.status === "PUBLISHED").map(chapterDto));
});
app.get("/api/v1/chapters/status/:status", auth(["ADMIN", "MANAGER"]), (req, res) => {
  res.json(db.chapters.filter((c) => c.status === req.params.status.toUpperCase()).map(chapterDto));
});
app.get("/api/v1/chapters/:id/public-structure", (req, res) => {
  const ch = chapterById(req.params.id);
  if (!ch) return res.status(404).json({ message: "Chapter not found" });
  res.json(chapterStructureDto(ch, { includeContent: false }));
});
app.get("/api/v1/chapters/:id/structure", auth(), (req, res) => {
  const ch = chapterById(req.params.id);
  if (!ch) return res.status(404).json({ message: "Chapter not found" });
  res.json(chapterStructureDto(ch));
});
app.get("/api/v1/chapters/:id/public", (req, res) => {
  const ch = chapterById(req.params.id);
  if (!ch) return res.status(404).json({ message: "Chapter not found" });
  res.json(chapterDto(ch));
});
app.get("/api/v1/chapters/:id/cover-image", (_req, res) => res.status(404).end()); // public, no images in demo
app.post("/api/v1/chapters/:id/cover-image", auth(["ADMIN", "MANAGER"]), (_req, res) => res.json({ message: "uploaded (demo no-op)" }));
app.patch("/api/v1/chapters/:id/status", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const ch = chapterById(req.params.id);
  if (!ch) return res.status(404).json({ message: "Chapter not found" });
  ch.status = String(req.query.status).toUpperCase();
  res.json(chapterDto(ch));
});
app.patch("/api/v1/chapters/:id/free-status", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const ch = chapterById(req.params.id);
  if (!ch) return res.status(404).json({ message: "Chapter not found" });
  ch.isFree = String(req.query.isFree) === "true";
  res.json(chapterDto(ch));
});
app.post("/api/v1/chapters/:chapterId/assign-teacher", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const chapterId = Number(req.params.chapterId);
  const teacherId = Number(req.query.teacherId);
  if (!db.chapterTeachers.some((ct) => ct.chapterId === chapterId && ct.teacherId === teacherId)) {
    db.chapterTeachers.push({ chapterId, teacherId });
  }
  res.json({ message: "assigned" });
});
app.delete("/api/v1/chapters/:chapterId/teachers/:teacherId", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const i = db.chapterTeachers.findIndex((ct) => ct.chapterId === Number(req.params.chapterId) && ct.teacherId === Number(req.params.teacherId));
  if (i >= 0) db.chapterTeachers.splice(i, 1);
  res.status(204).end();
});
app.get("/api/v1/chapters/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const ch = chapterById(req.params.id);
  if (!ch) return res.status(404).json({ message: "Chapter not found" });
  res.json(chapterDto(ch));
});
app.put("/api/v1/chapters/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const ch = chapterById(req.params.id);
  if (!ch) return res.status(404).json({ message: "Chapter not found" });
  const b = req.body || {};
  Object.assign(ch, {
    title: b.title ?? ch.title, description: b.description ?? ch.description,
    status: b.status ?? ch.status, orderIndex: b.orderIndex ?? ch.orderIndex,
    subjectId: b.subjectId ?? ch.subjectId, videoId: b.videoId ?? ch.videoId,
    price: b.price ?? ch.price, isFree: b.free ?? ch.isFree,
  });
  res.json(chapterDto(ch));
});
app.delete("/api/v1/chapters/:id", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const i = db.chapters.findIndex((c) => c.id === Number(req.params.id));
  if (i >= 0) db.chapters.splice(i, 1);
  res.status(204).end();
});

// ============================================================================
// FEATURED CHAPTERS  (/api/v1/featured-chapters)
// ============================================================================
app.get("/api/v1/featured-chapters", (_req, res) => {
  res.json(db.featured.map((f) => {
    const ch = chapterById(f.chapterId);
    if (!ch) return null;
    const subject = subjectById(ch.subjectId);
    const cls = subject ? classById(subject.classId) : null;
    return {
      id: f.chapterId, chapterId: f.chapterId, title: ch.title, description: ch.description,
      subjectName: subject ? subject.name : "", className: cls ? cls.name : "",
      price: ch.price, free: ch.isFree, featuredAt: f.featuredAt,
    };
  }).filter(Boolean));
});
app.post("/api/v1/featured-chapters/:chapterId", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const chapterId = Number(req.params.chapterId);
  if (!db.featured.some((f) => f.chapterId === chapterId)) {
    db.featured.push({ chapterId, featuredAt: new Date().toISOString().slice(0, 19) });
  }
  res.json({ message: "added" });
});
app.delete("/api/v1/featured-chapters/:chapterId", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const i = db.featured.findIndex((f) => f.chapterId === Number(req.params.chapterId));
  if (i >= 0) db.featured.splice(i, 1);
  res.status(204).end();
});

// ============================================================================
// TEACHER  (/api/v1/teachers)
// ============================================================================
app.get("/api/v1/teachers/assigned-chapters", auth(["TEACHER", "ADMIN", "MANAGER"]), (req, res) => {
  const ids = db.chapterTeachers.filter((ct) => ct.teacherId === req.user.id).map((ct) => ct.chapterId);
  res.json(db.chapters.filter((c) => ids.includes(c.id)).map(chapterDto));
});
app.get("/api/v1/teachers/chapters/:id/statistics", auth(["TEACHER", "ADMIN", "MANAGER"]), (req, res) => {
  const chapterId = Number(req.params.id);
  res.json({
    chapterId,
    totalEnrolledStudents: db.enrollments.filter((e) => e.chapterId === chapterId).length,
  });
});

// ============================================================================
// TOPICS  (/api/v1/topics)
// ============================================================================
app.post("/api/v1/topics", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const b = req.body || {};
  const t = { id: ++db.counters.topic, chapterId: Number(b.chapterId), title: b.title, description: b.description || "", orderIndex: b.orderIndex ?? 0 };
  db.topics.push(t);
  res.status(201).json({ id: t.id, title: t.title, description: t.description, orderIndex: t.orderIndex, chapterId: t.chapterId });
});
app.get("/api/v1/topics/:id", auth(), (req, res) => {
  const t = topicById(req.params.id);
  if (!t) return res.status(404).json({ message: "Topic not found" });
  res.json({ id: t.id, title: t.title, description: t.description, orderIndex: t.orderIndex, chapterId: t.chapterId });
});
app.put("/api/v1/topics/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const t = topicById(req.params.id);
  if (!t) return res.status(404).json({ message: "Topic not found" });
  Object.assign(t, { title: req.body.title ?? t.title, description: req.body.description ?? t.description, orderIndex: req.body.orderIndex ?? t.orderIndex });
  res.json({ id: t.id, title: t.title, description: t.description, orderIndex: t.orderIndex, chapterId: t.chapterId });
});
app.delete("/api/v1/topics/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const i = db.topics.findIndex((t) => t.id === Number(req.params.id));
  if (i >= 0) db.topics.splice(i, 1);
  res.status(204).end();
});

// ============================================================================
// CONTENT  (/api/v1/contents)
// ============================================================================
function newContentItem(topicId, title, type, orderIndex) {
  const ci = { id: ++db.counters.content, topicId: Number(topicId), title, type, orderIndex: orderIndex ?? 0 };
  db.contentItems.push(ci);
  return ci;
}

app.post("/api/v1/contents/lecture", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const b = req.body || {};
  const ci = newContentItem(b.topicId, b.title, "LECTURE", b.orderIndex);
  db.lectures[ci.id] = { id: ++db.counters.sub, videoId: b.videoId || "", content: b.content || "" };
  res.status(201).json(contentResponse(ci));
});
app.post("/api/v1/contents/pdf", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const b = req.body || {};
  const ci = newContentItem(b.topicId, b.title, "PDF", b.orderIndex);
  db.pdfs[ci.id] = { id: ++db.counters.sub, googleFileId: b.googleFileId || "", pageCount: b.pageCount ?? 0 };
  res.status(201).json(contentResponse(ci));
});
app.post("/api/v1/contents/quiz", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const b = req.body || {};
  const ci = newContentItem(b.topicId, b.title, "QUIZ", b.orderIndex);
  db.quizzes[ci.id] = {
    id: ++db.counters.quiz, title: b.title, quizType: b.quizType || "MCQ",
    instruction: b.instruction || "", timeLimit: b.timeLimit ?? 0, totalMarks: b.totalMarks ?? 0,
    passPercentage: b.passPercentage ?? 0, questions: assignQuestionIds(b.questions || []),
  };
  res.status(201).json(contentResponse(ci));
});

function assignQuestionIds(questions) {
  return questions.map((q) => ({
    id: ++db.counters.qpart,
    questionText: q.questionText, type: q.type, orderIndex: q.orderIndex ?? 0, marks: q.marks ?? 1,
    options: (q.options || []).map((o) => ({ id: ++db.counters.qpart, optionText: o.optionText, isCorrect: !!o.isCorrect })),
    writtenAnswer: q.writtenAnswer ? { id: ++db.counters.qpart, sampleAnswer: q.writtenAnswer.sampleAnswer } : null,
    fillBlanks: (q.fillBlanks || []).map((f) => ({ id: ++db.counters.qpart, blankPosition: f.blankPosition, correctAnswer: f.correctAnswer })),
    tableMatchings: (q.tableMatchings || []).map((m) => ({ id: ++db.counters.qpart, leftItem: m.leftItem, rightItem: m.rightItem, orderIndex: m.orderIndex ?? 0 })),
  }));
}

// Read a single content item — students must be enrolled (admin/teacher exempt)
app.get("/api/v1/contents/:id", auth(), (req, res) => {
  const ci = contentById(req.params.id);
  if (!ci) return res.status(404).json({ message: "Content not found" });
  const topic = topicById(ci.topicId);
  const chapterId = topic ? topic.chapterId : null;
  const ch = chapterId ? chapterById(chapterId) : null;
  const privileged = isAdminOrManager(req.user) || req.user.roles.includes("TEACHER");
  if (!privileged && ch && !ch.isFree && !isEnrolled(req.user.id, chapterId)) {
    return res.status(403).json({ message: "You are not enrolled in this chapter" });
  }
  res.json(contentResponse(ci));
});

// Update / delete content by content-item id
function findQuizContentItem(contentItemId) {
  return contentById(contentItemId);
}
app.put("/api/v1/contents/lecture/content-item/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const ci = contentById(req.params.id);
  if (!ci || !db.lectures[ci.id]) return res.status(404).json({ message: "Lecture not found" });
  const b = req.body || {};
  if (b.title) ci.title = b.title;
  Object.assign(db.lectures[ci.id], { videoId: b.videoId ?? db.lectures[ci.id].videoId, content: b.content ?? db.lectures[ci.id].content });
  res.json(contentResponse(ci));
});
app.put("/api/v1/contents/pdf/content-item/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const ci = contentById(req.params.id);
  if (!ci || !db.pdfs[ci.id]) return res.status(404).json({ message: "PDF not found" });
  const b = req.body || {};
  if (b.title) ci.title = b.title;
  Object.assign(db.pdfs[ci.id], { googleFileId: b.googleFileId ?? db.pdfs[ci.id].googleFileId, pageCount: b.pageCount ?? db.pdfs[ci.id].pageCount });
  res.json(contentResponse(ci));
});
app.put("/api/v1/contents/quiz/:quizId", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  // quizId here is the quiz entity id; find owning content item
  const entry = Object.entries(db.quizzes).find(([, q]) => q.id === Number(req.params.quizId));
  if (!entry) return res.status(404).json({ message: "Quiz not found" });
  const [ciId, quiz] = entry;
  const b = req.body || {};
  Object.assign(quiz, {
    title: b.title ?? quiz.title, quizType: b.quizType ?? quiz.quizType, instruction: b.instruction ?? quiz.instruction,
    timeLimit: b.timeLimit ?? quiz.timeLimit, totalMarks: b.totalMarks ?? quiz.totalMarks, passPercentage: b.passPercentage ?? quiz.passPercentage,
  });
  const ci = contentById(Number(ciId));
  if (ci && b.title) ci.title = b.title;
  res.json(contentResponse(ci));
});
app.put("/api/v1/contents/quiz/:quizId/questions", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const entry = Object.entries(db.quizzes).find(([, q]) => q.id === Number(req.params.quizId));
  if (!entry) return res.status(404).json({ message: "Quiz not found" });
  const [ciId, quiz] = entry;
  quiz.questions = assignQuestionIds(Array.isArray(req.body) ? req.body : []);
  res.json(contentResponse(contentById(Number(ciId))));
});
app.delete("/api/v1/contents/lecture/content-item/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => deleteContent(req, res, "lectures"));
app.delete("/api/v1/contents/pdf/content-item/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => deleteContent(req, res, "pdfs"));
app.delete("/api/v1/contents/quiz/content-item/:id", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => deleteContent(req, res, "quizzes"));
function deleteContent(req, res, table) {
  const id = Number(req.params.id);
  delete db[table][id];
  const i = db.contentItems.findIndex((c) => c.id === id);
  if (i >= 0) db.contentItems.splice(i, 1);
  res.status(204).end();
}

// ============================================================================
// ENROLLMENT  (/api/v1/enrollments)
// ============================================================================
app.post("/api/v1/enrollments/free/:chapterId", auth(), (req, res) => {
  const chapterId = Number(req.params.chapterId);
  const ch = chapterById(chapterId);
  if (!ch) return res.status(404).json({ message: "Chapter not found" });
  if (!ch.isFree) return res.status(400).json({ message: "Chapter is not free" });
  if (!isEnrolled(req.user.id, chapterId)) {
    db.enrollments.push({ id: ++db.counters.enrollment, userId: req.user.id, chapterId });
  }
  res.json({ id: chapterId, chapterId, chapterTitle: ch.title, userId: req.user.id });
});

// ============================================================================
// PAYMENTS  (/api/v1/payments)
// ============================================================================
app.post("/api/v1/payments/submit", auth(), (req, res) => {
  const b = req.body || {};
  const p = {
    id: ++db.counters.payment, userId: req.user.id, chapterId: Number(b.chapterId),
    senderNumber: b.senderNumber, transactionId: b.transactionId, amount: b.amount,
    paymentMethod: b.paymentMethod, status: "PENDING", verifiedAt: null, verifiedByUserId: null,
  };
  db.payments.push(p);
  res.status(201).json(paymentDto(p));
});
app.get("/api/v1/payments/my-payments", auth(), (req, res) => {
  res.json(db.payments.filter((p) => p.userId === req.user.id).map(paymentDto));
});
app.get("/api/v1/payments/my-payments/chapter/:id", auth(), (req, res) => {
  const p = db.payments.find((x) => x.userId === req.user.id && x.chapterId === Number(req.params.id));
  if (!p) return res.status(200).send(""); // frontend expects "" when none
  res.json(paymentDto(p));
});
app.get("/api/v1/payments", auth(["ADMIN", "MANAGER"]), (_req, res) => res.json(db.payments.map(paymentDto)));
app.get("/api/v1/payments/unverified", auth(["ADMIN", "MANAGER"]), (_req, res) => {
  res.json(db.payments.filter((p) => p.status === "PENDING").map(paymentDto));
});
app.put("/api/v1/payments/:id/verify", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const p = db.payments.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ message: "Payment not found" });
  p.status = "VERIFIED";
  p.verifiedAt = new Date().toISOString().slice(0, 19);
  p.verifiedByUserId = req.user.id;
  if (!isEnrolled(p.userId, p.chapterId)) {
    db.enrollments.push({ id: ++db.counters.enrollment, userId: p.userId, chapterId: p.chapterId });
  }
  res.json(paymentDto(p));
});
app.put("/api/v1/payments/:id/reject", auth(["ADMIN", "MANAGER"]), (req, res) => {
  const p = db.payments.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ message: "Payment not found" });
  p.status = "REJECTED";
  res.json(paymentDto(p));
});

// ============================================================================
// PROGRESS  (/api/v1/progress)
// ============================================================================
function contentItemsForChapter(chapterId) {
  const topicIds = db.topics.filter((t) => t.chapterId === chapterId).map((t) => t.id);
  return db.contentItems.filter((ci) => topicIds.includes(ci.topicId));
}
function chapterProgressDto(userId, chapterId) {
  const ch = chapterById(chapterId);
  const items = contentItemsForChapter(chapterId);
  const completed = items.filter((ci) => (db.progress[`${userId}:${ci.id}`] || {}).completed).length;
  const pct = items.length ? Math.round((completed / items.length) * 100) : 0;
  return { chapterId, chapterTitle: ch ? ch.title : null, progressPercentage: pct, completed: pct === 100 };
}

app.post("/api/v1/progress/content/:id/complete", auth(), (req, res) => {
  const id = Number(req.params.id);
  const key = `${req.user.id}:${id}`;
  db.progress[key] = { completed: true, score: (db.progress[key] || {}).score ?? null };
  res.json({ contentItemId: id, completed: true, score: db.progress[key].score });
});
app.post("/api/v1/progress/content/:id/quiz", auth(), (req, res) => {
  const id = Number(req.params.id);
  const key = `${req.user.id}:${id}`;
  const score = req.body && typeof req.body.score === "number" ? req.body.score : (typeof req.body === "number" ? req.body : 0);
  db.progress[key] = { completed: true, score };
  res.json({ contentItemId: id, completed: true, score });
});
app.get("/api/v1/progress/chapter/:id/detailed", auth(), (req, res) => {
  const chapterId = Number(req.params.id);
  const items = contentItemsForChapter(chapterId);
  const map = {};
  items.forEach((ci) => { map[ci.id] = !!(db.progress[`${req.user.id}:${ci.id}`] || {}).completed; });
  res.json(map);
});
app.get("/api/v1/progress/chapter/:id", auth(), (req, res) => {
  res.json(chapterProgressDto(req.user.id, Number(req.params.id)));
});
app.get("/api/v1/progress/my-chapters", auth(), (req, res) => {
  const chapterIds = [...new Set(db.enrollments.filter((e) => e.userId === req.user.id).map((e) => e.chapterId))];
  res.json(chapterIds.map((id) => chapterProgressDto(req.user.id, id)));
});
app.get("/api/v1/progress/admin/chapter/:id/students-progress", auth(["ADMIN", "MANAGER", "TEACHER"]), (req, res) => {
  const chapterId = Number(req.params.id);
  const studentIds = [...new Set(db.enrollments.filter((e) => e.chapterId === chapterId).map((e) => e.userId))];
  res.json(studentIds.map((sid) => {
    const u = userById(sid);
    const cp = chapterProgressDto(sid, chapterId);
    return { studentId: sid, studentName: u ? u.fullName : `User ${sid}`, progressPercentage: cp.progressPercentage, completed: cp.completed };
  }));
});

// ============================================================================
// SHOP  (/api/v1/shop)  — registered from shopRoutes.js
// ============================================================================
function getUserFromReq(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(header.substring(7), JWT_SECRET);
    return userById(decoded.uid) || findUser(decoded.sub) || null;
  } catch {
    return null;
  }
}
registerShop(app, { auth, userById, chapterById, subjectById, classById, isAdminOrManager, getUserFromReq });

// ----------------------------------------------------------------------------
// Fallback
// ----------------------------------------------------------------------------
app.use((req, res) => res.status(404).json({ message: `No demo handler for ${req.method} ${req.path}` }));

app.listen(PORT, () => {
  console.log(`\n🏫 Montola DEMO backend running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/internal/health`);
  console.log(`   Demo logins (password: password123):`);
  console.log(`     admin@montola.test  · manager@montola.test`);
  console.log(`     teacher@montola.test · student@montola.test · multi@montola.test\n`);
});

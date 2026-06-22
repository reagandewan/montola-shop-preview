// ============================================================================
// Shop demo data — educational products sold on the Montola website.
// In-memory, resets on restart. Scope (level/subject/chapter) reuses the
// existing course taxonomy ids from data.js where possible.
//
// Product types:  NOTES, PDF_CHAPTER, INTERACTIVE_LEARNING, BOARD_ANALYSIS,
//                 CHAPTER_ANALYSIS, BOARD_SOLUTION, WORKSHEET, DRILLSHEET,
//                 RECALL_CARD, INTERACTIVE_TEST, BOOK
// Formats:        PDF | INTERACTIVE
// Most products are VIEW_ONLINE. Only WORKSHEET/DRILLSHEET/RECALL_CARD are
// download-eligible, and only via a DOWNLOAD bundle bought by a teacher /
// coaching (accountType COACHING) account.
// ============================================================================

// Levels group classes (JSC = class 6-8, SSC = 9-10, HSC = 11-12)
const levels = [
  { id: 1, name: "JSC", orderIndex: 0 },
  { id: 2, name: "SSC", orderIndex: 1 },
  { id: 3, name: "HSC", orderIndex: 2 },
];

// existing demo classes (data.js): Class 9 (1) and Class 10 (2) roll up to SSC
const classLevel = { 1: 2, 2: 2 };

const DOWNLOADABLE_TYPES = ["WORKSHEET", "DRILLSHEET", "RECALL_CARD"];

// subjectId / chapterId values below reference data.js course seed ids.
const products = [
  {
    id: 5001, title: "Algebra — infographic notes", type: "NOTES", format: "INTERACTIVE",
    description: "Visual, colour-coded notes covering variables, expressions and linear equations.",
    levelId: 2, subjectId: 10, chapterId: 100, price: 80, status: "PUBLISHED", featured: true,
    preview: "Preview: a variable is a placeholder for an unknown number…",
    content: { html: "<h2>Algebra basics</h2><p>A <b>variable</b> stands for an unknown number. To isolate it, do the same operation to both sides…</p><ul><li>2x + 3 = 7 → x = 2</li></ul>" },
  },
  {
    id: 5002, title: "Geometry foundations — chapter PDF", type: "PDF_CHAPTER", format: "PDF",
    description: "Full chapter notes on lines, angles, triangles and circles.",
    levelId: 2, subjectId: 10, chapterId: 101, price: 60, status: "PUBLISHED", featured: false,
    preview: "Preview: page 1 of 12 — definitions of point, line and ray.",
    content: { fileId: "demo_geometry_chapter", pageCount: 12 },
  },
  {
    id: 5003, title: "Motion & force — interactive lesson", type: "INTERACTIVE_LEARNING", format: "INTERACTIVE",
    description: "Step-through interactive lesson on Newton's laws with animations.",
    levelId: 2, subjectId: 11, chapterId: 110, price: 120, status: "PUBLISHED", featured: true,
    preview: "Preview: try the first interaction — push the block and watch acceleration.",
    content: { html: "<h2>Newton's first law</h2><p>An object stays at rest or in uniform motion unless acted on by a net force…</p>" },
  },
  {
    id: 5004, title: "SSC Physics — board analysis 2024", type: "BOARD_ANALYSIS", format: "PDF",
    description: "Question-pattern analysis across all education boards for SSC Physics 2024.",
    levelId: 2, subjectId: 11, chapterId: null, price: 150, status: "PUBLISHED", featured: false,
    preview: "Preview: chapter-wise mark distribution summary.",
    content: { fileId: "demo_ssc_physics_board_2024", pageCount: 20 },
  },
  {
    id: 5005, title: "Algebra — chapter analysis", type: "CHAPTER_ANALYSIS", format: "PDF",
    description: "What gets asked from this chapter, with frequency and difficulty.",
    levelId: 2, subjectId: 10, chapterId: 100, price: 70, status: "PUBLISHED", featured: false,
    preview: "Preview: top 5 most-asked question types.",
    content: { fileId: "demo_algebra_chapter_analysis", pageCount: 8 },
  },
  {
    id: 5006, title: "SSC Math — board solutions", type: "BOARD_SOLUTION", format: "INTERACTIVE",
    description: "Fully worked board-question solutions, taught step by step.",
    levelId: 2, subjectId: 20, chapterId: null, price: 150, status: "PUBLISHED", featured: false,
    preview: "Preview: 2023 Dhaka board Q1 worked solution.",
    content: { html: "<h2>Dhaka 2023 — Q1</h2><p>Given…, we solve step by step…</p>" },
  },
  {
    id: 5007, title: "Trigonometry — worksheet", type: "WORKSHEET", format: "PDF",
    description: "Practice worksheet on trig ratios and identities.",
    levelId: 2, subjectId: 20, chapterId: 200, price: 40, status: "PUBLISHED", featured: false,
    preview: "Preview: questions 1–3 of 25.",
    content: { fileId: "demo_trig_worksheet", pageCount: 4 },
  },
  {
    id: 5008, title: "Grammar — drill sheet", type: "DRILLSHEET", format: "PDF",
    description: "Rapid-fire grammar drills with answer key.",
    levelId: 2, subjectId: 12, chapterId: 120, price: 30, status: "PUBLISHED", featured: false,
    preview: "Preview: tense drills, set A.",
    content: { fileId: "demo_grammar_drill", pageCount: 3 },
  },
  {
    id: 5009, title: "Periodic table — recall cards", type: "RECALL_CARD", format: "INTERACTIVE",
    description: "Active-recall flash cards for groups, periods and key elements.",
    levelId: 2, subjectId: 21, chapterId: 210, price: 35, status: "PUBLISHED", featured: false,
    preview: "Preview: 3 sample cards.",
    content: { html: "<h2>Recall card</h2><p>Front: Group 1 metals? · Back: alkali metals (Li, Na, K…)</p>" },
  },
  {
    id: 5010, title: "Newton's laws — interactive test", type: "INTERACTIVE_TEST", format: "INTERACTIVE",
    description: "Timed interactive test with instant scoring.",
    levelId: 2, subjectId: 11, chapterId: 110, price: 50, status: "PUBLISHED", featured: true,
    preview: "Preview: 2 sample questions.",
    content: { html: "<h2>Test</h2><p>Q1. F = ? (ma / mv / m/a)</p>" },
  },
  {
    id: 5011, title: "Class 10 Math — complete book", type: "BOOK", format: "PDF",
    description: "Full digital book for Class 10 mathematics.",
    levelId: 2, subjectId: 20, chapterId: null, price: 250, status: "PUBLISHED", featured: false,
    preview: "Preview: table of contents + chapter 1.",
    content: { fileId: "demo_class10_math_book", pageCount: 180 },
  },
];

// Bundles group products. DOWNLOAD bundles target TEACHER_COACHING audiences.
const bundles = [
  {
    id: 7001, title: "SSC practice pack (worksheets + drills + recall)", audience: "TEACHER_COACHING",
    accessMode: "DOWNLOAD", levelId: 2, subjectId: null, price: 90, status: "PUBLISHED",
    description: "Download-and-print pack for classrooms: worksheets, drill sheets and recall cards.",
    productIds: [5007, 5008, 5009],
  },
  {
    id: 7002, title: "Class 10 Math — notes & solutions", audience: "GENERAL",
    accessMode: "ONLINE", levelId: 2, subjectId: 20, price: 350, status: "PUBLISHED",
    description: "Everything for Class 10 Math: board solutions and the complete book.",
    productIds: [5006, 5011],
  },
];

// Entitlements: who can access what (granted on verified payment).
const entitlements = [
  { id: 8001, userId: 5, productId: 5001, bundleId: null, source: "PAYMENT", grantedAt: "2026-06-10T10:00:00" },
  { id: 8002, userId: 7, productId: null, bundleId: 7001, source: "PAYMENT", grantedAt: "2026-06-12T10:00:00" },
];

// Shop payments: separate from the chapter Payment table.
const payments = [
  { id: 9101, userId: 5, productId: 5001, bundleId: null, amount: 80, senderNumber: "01711111111", transactionId: "SHOP1001", paymentMethod: "BKASH", status: "VERIFIED", verifiedAt: "2026-06-10T09:00:00", verifiedByUserId: 1 },
  { id: 9102, userId: 7, productId: null, bundleId: 7001, amount: 90, senderNumber: "01744444444", transactionId: "SHOP1002", paymentMethod: "NAGAD", status: "VERIFIED", verifiedAt: "2026-06-12T09:00:00", verifiedByUserId: 1 },
  { id: 9103, userId: 5, productId: 5003, bundleId: null, amount: 120, senderNumber: "01722222222", transactionId: "SHOP1003", paymentMethod: "BKASH", status: "PENDING", verifiedAt: null, verifiedByUserId: null },
];

const counters = { product: 5100, bundle: 7100, entitlement: 8100, payment: 9200 };

module.exports = {
  levels, classLevel, DOWNLOADABLE_TYPES, products, bundles, entitlements, payments, counters,
};

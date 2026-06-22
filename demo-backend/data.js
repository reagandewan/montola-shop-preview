// ============================================================================
// In-memory demo data store for the Montola School demo backend.
// Normalized tables + seed data. The server assembles DTOs from these.
// All data lives in memory and resets on restart (mutations during the demo
// persist until the process stops).
// ============================================================================

// ---- Users (passwords are plain-text for the demo only) --------------------
const users = [
  { id: 1, email: "admin@montola.test",   fullName: "Admin Ananya",   phone: "01700000001", password: "password123", roles: ["ADMIN"],   isActivated: true },
  { id: 2, email: "manager@montola.test", fullName: "Manager Mizan",  phone: "01700000002", password: "password123", roles: ["MANAGER"], isActivated: true },
  { id: 3, email: "teacher@montola.test", fullName: "Teacher Tanvir", phone: "01700000003", password: "password123", roles: ["TEACHER"], isActivated: true },
  { id: 4, email: "teacher2@montola.test",fullName: "Teacher Rupa",   phone: "01700000004", password: "password123", roles: ["TEACHER"], isActivated: true },
  { id: 5, email: "student@montola.test", fullName: "Student Shuvo",  phone: "01700000005", password: "password123", roles: ["STUDENT"], isActivated: true },
  { id: 6, email: "multi@montola.test",   fullName: "Multi Mahmuda",  phone: "01700000006", password: "password123", roles: ["TEACHER", "STUDENT"], isActivated: true },
  { id: 7, email: "coaching@montola.test",fullName: "Hill Tracts Coaching", phone: "01700000007", password: "password123", roles: ["STUDENT"], isActivated: true, accountType: "COACHING" },
];

// ---- Course hierarchy: Class -> Subject -> Chapter -> Topic -> ContentItem --
const classes = [
  { id: 1, name: "Class 9",  description: "Secondary level — ninth grade." },
  { id: 2, name: "Class 10", description: "Secondary level — SSC candidates." },
];

const subjects = [
  { id: 10, classId: 1, name: "Mathematics", description: "Algebra, geometry and more.", orderIndex: 0 },
  { id: 11, classId: 1, name: "Physics",     description: "Motion, force, light and energy.", orderIndex: 1 },
  { id: 12, classId: 1, name: "English",     description: "Grammar and composition.", orderIndex: 2 },
  { id: 20, classId: 2, name: "Mathematics", description: "Trigonometry, algebra, statistics.", orderIndex: 0 },
  { id: 21, classId: 2, name: "Chemistry",   description: "Atoms, periodic table, reactions.", orderIndex: 1 },
];

// status: DRAFT | PUBLISHED | ARCHIVED
const chapters = [
  { id: 100, subjectId: 10, title: "Algebra Basics",      description: "Variables, expressions and simple equations.", status: "PUBLISHED", orderIndex: 0, videoId: "dQw4w9WgXcQ", price: 0,   isFree: true,  createdBy: 1 },
  { id: 101, subjectId: 10, title: "Geometry Foundations",description: "Lines, angles, triangles and circles.",      status: "PUBLISHED", orderIndex: 1, videoId: "",            price: 500, isFree: false, createdBy: 1 },
  { id: 110, subjectId: 11, title: "Motion and Force",    description: "Newton's laws and kinematics.",               status: "PUBLISHED", orderIndex: 0, videoId: "",            price: 600, isFree: false, createdBy: 1 },
  { id: 111, subjectId: 11, title: "Light and Optics",    description: "Reflection, refraction and lenses.",          status: "DRAFT",     orderIndex: 1, videoId: "",            price: 600, isFree: false, createdBy: 2 },
  { id: 120, subjectId: 12, title: "Grammar Essentials",  description: "Tenses, articles and prepositions.",          status: "PUBLISHED", orderIndex: 0, videoId: "",            price: 0,   isFree: true,  createdBy: 2 },
  { id: 200, subjectId: 20, title: "Trigonometry",        description: "Ratios, identities and applications.",        status: "PUBLISHED", orderIndex: 0, videoId: "",            price: 700, isFree: false, createdBy: 1 },
  { id: 210, subjectId: 21, title: "The Periodic Table",  description: "Elements, groups and periods.",               status: "PUBLISHED", orderIndex: 0, videoId: "",            price: 0,   isFree: true,  createdBy: 2 },
];

// chapter <-> teacher assignments
const chapterTeachers = [
  { chapterId: 100, teacherId: 3 },
  { chapterId: 101, teacherId: 3 },
  { chapterId: 110, teacherId: 4 },
  { chapterId: 120, teacherId: 3 },
  { chapterId: 200, teacherId: 6 },
];

const topics = [
  // Algebra Basics (100)
  { id: 1000, chapterId: 100, title: "Introduction to Variables", description: "What is a variable?", orderIndex: 0 },
  { id: 1001, chapterId: 100, title: "Linear Equations",          description: "Solving for x.",       orderIndex: 1 },
  // Geometry Foundations (101)
  { id: 1010, chapterId: 101, title: "Lines and Angles",          description: "Basic definitions.",   orderIndex: 0 },
  { id: 1011, chapterId: 101, title: "Triangles",                 description: "Properties of triangles.", orderIndex: 1 },
  // Motion and Force (110)
  { id: 1100, chapterId: 110, title: "Describing Motion",         description: "Speed and velocity.",  orderIndex: 0 },
  { id: 1101, chapterId: 110, title: "Newton's Laws",             description: "The three laws.",      orderIndex: 1 },
  // Grammar Essentials (120)
  { id: 1200, chapterId: 120, title: "Tenses",                    description: "Past, present, future.", orderIndex: 0 },
  // Trigonometry (200)
  { id: 2000, chapterId: 200, title: "Trigonometric Ratios",      description: "Sin, cos, tan.",       orderIndex: 0 },
  // Periodic Table (210)
  { id: 2100, chapterId: 210, title: "Groups and Periods",        description: "Layout of the table.", orderIndex: 0 },
];

// type: LECTURE | QUIZ | PDF
const contentItems = [
  // Topic 1000
  { id: 10000, topicId: 1000, title: "What is a Variable? (Video)", type: "LECTURE", orderIndex: 0 },
  { id: 10001, topicId: 1000, title: "Variables Quick Quiz",        type: "QUIZ",    orderIndex: 1 },
  // Topic 1001
  { id: 10010, topicId: 1001, title: "Solving Linear Equations",    type: "LECTURE", orderIndex: 0 },
  { id: 10011, topicId: 1001, title: "Practice Worksheet (PDF)",    type: "PDF",     orderIndex: 1 },
  // Topic 1010
  { id: 10100, topicId: 1010, title: "Lines and Angles Lecture",    type: "LECTURE", orderIndex: 0 },
  // Topic 1011
  { id: 10110, topicId: 1011, title: "Triangle Types",              type: "LECTURE", orderIndex: 0 },
  { id: 10111, topicId: 1011, title: "Triangles Quiz",              type: "QUIZ",    orderIndex: 1 },
  // Topic 1100
  { id: 11000, topicId: 1100, title: "Speed vs Velocity",           type: "LECTURE", orderIndex: 0 },
  // Topic 1101
  { id: 11010, topicId: 1101, title: "The Three Laws (Video)",      type: "LECTURE", orderIndex: 0 },
  { id: 11011, topicId: 1101, title: "Newton's Laws Notes (PDF)",   type: "PDF",     orderIndex: 1 },
  // Topic 1200
  { id: 12000, topicId: 1200, title: "Present Tense Lecture",       type: "LECTURE", orderIndex: 0 },
  { id: 12001, topicId: 1200, title: "Tenses Quiz",                 type: "QUIZ",    orderIndex: 1 },
  // Topic 2000
  { id: 20000, topicId: 2000, title: "Intro to Trig Ratios",        type: "LECTURE", orderIndex: 0 },
  // Topic 2100
  { id: 21000, topicId: 2100, title: "Reading the Periodic Table",  type: "LECTURE", orderIndex: 0 },
];

// Subtype payloads keyed by contentItemId
const lectures = {
  10000: { id: 90000, videoId: "dQw4w9WgXcQ", content: "<p>A <strong>variable</strong> is a symbol that stands for a number we don't know yet.</p>" },
  10010: { id: 90010, videoId: "kXYiU_JCYtU", content: "<p>To solve <em>2x + 3 = 7</em>, subtract 3 then divide by 2.</p>" },
  10100: { id: 90100, videoId: "",            content: "<p>A line extends forever in both directions. An angle is formed by two rays.</p>" },
  10110: { id: 90110, videoId: "",            content: "<p>Triangles are classified by sides (equilateral, isosceles, scalene) and angles.</p>" },
  11000: { id: 91000, videoId: "",            content: "<p>Speed is scalar; velocity is a vector (speed + direction).</p>" },
  11010: { id: 91010, videoId: "dQw4w9WgXcQ", content: "<p>1) Inertia 2) F = ma 3) Action-reaction.</p>" },
  12000: { id: 92000, videoId: "",            content: "<p>The present tense describes habitual or current actions.</p>" },
  20000: { id: 92100, videoId: "",            content: "<p>In a right triangle: sin = opp/hyp, cos = adj/hyp, tan = opp/adj.</p>" },
  21000: { id: 92110, videoId: "",            content: "<p>Rows are periods, columns are groups. Elements in a group share properties.</p>" },
};

const pdfs = {
  10011: { id: 80011, googleFileId: "1A2B3C_demo_worksheet_linear", pageCount: 4 },
  11011: { id: 81011, googleFileId: "1D4E5F_demo_newton_notes",     pageCount: 6 },
};

// Quizzes keyed by contentItemId; questions are nested
const quizzes = {
  10001: {
    id: 70001, title: "Variables Quick Quiz", quizType: "MCQ",
    instruction: "Choose the best answer.", timeLimit: 5, totalMarks: 2, passPercentage: 50,
    questions: [
      {
        id: 700010, questionText: "In the expression 3x + 2, what is x?", type: "MULTIPLE_CHOICE", orderIndex: 0, marks: 1,
        options: [
          { id: 7000100, optionText: "A constant", isCorrect: false },
          { id: 7000101, optionText: "A variable", isCorrect: true },
          { id: 7000102, optionText: "An operator", isCorrect: false },
        ],
        writtenAnswer: null, fillBlanks: [], tableMatchings: [],
      },
      {
        id: 700011, questionText: "What is the value of 2 + 2?", type: "MULTIPLE_CHOICE", orderIndex: 1, marks: 1,
        options: [
          { id: 7000110, optionText: "3", isCorrect: false },
          { id: 7000111, optionText: "4", isCorrect: true },
          { id: 7000112, optionText: "5", isCorrect: false },
        ],
        writtenAnswer: null, fillBlanks: [], tableMatchings: [],
      },
    ],
  },
  10111: {
    id: 70111, title: "Triangles Quiz", quizType: "MIXED",
    instruction: "Answer all parts.", timeLimit: 10, totalMarks: 3, passPercentage: 60,
    questions: [
      {
        id: 701110, questionText: "A triangle with all equal sides is ____.", type: "FILL_IN_THE_BLANK", orderIndex: 0, marks: 1,
        options: [], writtenAnswer: null,
        fillBlanks: [{ id: 7011100, blankPosition: 1, correctAnswer: "equilateral" }],
        tableMatchings: [],
      },
      {
        id: 701111, questionText: "Match the triangle to its property.", type: "MATCHING", orderIndex: 1, marks: 1,
        options: [], writtenAnswer: null, fillBlanks: [],
        tableMatchings: [
          { id: 7011110, leftItem: "Isosceles", rightItem: "Two equal sides", orderIndex: 0 },
          { id: 7011111, leftItem: "Scalene",   rightItem: "No equal sides",  orderIndex: 1 },
        ],
      },
      {
        id: 701112, questionText: "Explain the Pythagorean theorem in one sentence.", type: "WRITTEN", orderIndex: 2, marks: 1,
        options: [], fillBlanks: [], tableMatchings: [],
        writtenAnswer: { id: 7011120, sampleAnswer: "In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides." },
      },
    ],
  },
  12001: {
    id: 72001, title: "Tenses Quiz", quizType: "MCQ",
    instruction: "Pick the correct tense.", timeLimit: 5, totalMarks: 1, passPercentage: 50,
    questions: [
      {
        id: 720010, questionText: "\"She walks to school\" is in which tense?", type: "MULTIPLE_CHOICE", orderIndex: 0, marks: 1,
        options: [
          { id: 7200100, optionText: "Past", isCorrect: false },
          { id: 7200101, optionText: "Present", isCorrect: true },
          { id: 7200102, optionText: "Future", isCorrect: false },
        ],
        writtenAnswer: null, fillBlanks: [], tableMatchings: [],
      },
    ],
  },
};

// ---- Featured chapters -----------------------------------------------------
const featured = [
  { chapterId: 100, featuredAt: "2026-05-01T10:00:00" },
  { chapterId: 110, featuredAt: "2026-05-15T10:00:00" },
  { chapterId: 200, featuredAt: "2026-06-01T10:00:00" },
];

// ---- Enrollments (student access to chapters) ------------------------------
const enrollments = [
  { id: 5001, userId: 5, chapterId: 100 }, // free enrollment
  { id: 5002, userId: 5, chapterId: 110 }, // paid + verified
];

// ---- Payments --------------------------------------------------------------
const payments = [
  { id: 6001, userId: 5, chapterId: 110, senderNumber: "01711111111", transactionId: "TXN1001", amount: 600, paymentMethod: "BKASH", status: "VERIFIED", verifiedAt: "2026-06-02T09:00:00", verifiedByUserId: 1 },
  { id: 6002, userId: 5, chapterId: 101, senderNumber: "01722222222", transactionId: "TXN1002", amount: 500, paymentMethod: "NAGAD", status: "PENDING", verifiedAt: null, verifiedByUserId: null },
  { id: 6003, userId: 6, chapterId: 200, senderNumber: "01733333333", transactionId: "TXN1003", amount: 700, paymentMethod: "BKASH", status: "PENDING", verifiedAt: null, verifiedByUserId: null },
];

// ---- Progress: contentItemId completion + scores, per user -----------------
// key: `${userId}:${contentItemId}` -> { completed, score }
const progress = {
  "5:10000": { completed: true,  score: null },
  "5:10001": { completed: true,  score: 2 },
  "5:10010": { completed: false, score: null },
  "5:11000": { completed: true,  score: null },
};

// Auto-incrementing id counters for create operations
const counters = {
  user: 100, class: 100, subject: 100, chapter: 1000, topic: 100000,
  content: 1000000, sub: 9000000, quiz: 7900000, payment: 9000, enrollment: 9000, qpart: 79000000,
};

module.exports = {
  users, classes, subjects, chapters, chapterTeachers, topics, contentItems,
  lectures, pdfs, quizzes, featured, enrollments, payments, progress, counters,
};

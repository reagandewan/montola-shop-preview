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
  { id: 3, name: "Class 6",  description: "Junior secondary — sixth grade." },
  { id: 4, name: "Class 7",  description: "Junior secondary — seventh grade." },
  { id: 5, name: "Class 8",  description: "Junior secondary — JSC candidates." },
  { id: 1, name: "Class 9",  description: "Secondary level — ninth grade." },
  { id: 2, name: "Class 10", description: "Secondary level — SSC candidates." },
  { id: 6, name: "Class 11", description: "Higher secondary — eleventh grade." },
  { id: 7, name: "Class 12", description: "Higher secondary — HSC candidates." },
];

const subjects = [
  { id: 10, classId: 1, name: "Mathematics", description: "Algebra, geometry and more.", orderIndex: 0 },
  { id: 11, classId: 1, name: "Physics",     description: "Motion, force, light and energy.", orderIndex: 1 },
  { id: 12, classId: 1, name: "English",     description: "Grammar and composition.", orderIndex: 2 },
  { id: 20, classId: 2, name: "Mathematics", description: "Trigonometry, algebra, statistics.", orderIndex: 0 },
  { id: 21, classId: 2, name: "Chemistry",   description: "Atoms, periodic table, reactions.", orderIndex: 1 },
  { id: 30, classId: 3, name: "Mathematics", description: "Numbers, fractions and basic geometry.", orderIndex: 0 },
  { id: 31, classId: 3, name: "Science",     description: "Living world, matter and energy.", orderIndex: 1 },
  { id: 32, classId: 3, name: "English",     description: "Grammar, reading and writing.", orderIndex: 2 },
  { id: 40, classId: 4, name: "Mathematics", description: "Ratio, proportion and algebra basics.", orderIndex: 0 },
  { id: 41, classId: 4, name: "Science",     description: "Cells, heat and simple machines.", orderIndex: 1 },
  { id: 42, classId: 4, name: "English",     description: "Tenses, comprehension and composition.", orderIndex: 2 },
  { id: 50, classId: 5, name: "Science",     description: "Matter, force and the living world.", orderIndex: 0 },
  { id: 51, classId: 5, name: "Mathematics", description: "Algebra, geometry and mensuration.", orderIndex: 1 },
  { id: 52, classId: 5, name: "English",     description: "Grammar and writing skills.", orderIndex: 2 },
  { id: 60, classId: 6, name: "Physics",     description: "Vectors, motion and mechanics.", orderIndex: 0 },
  { id: 70, classId: 7, name: "Chemistry",   description: "Atomic structure and reactions.", orderIndex: 0 },
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
  { id: 300, subjectId: 30, title: "Fractions and Decimals",   description: "Understanding parts of a whole.",        status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0, isFree: true, createdBy: 1 },
  { id: 400, subjectId: 40, title: "Ratio and Proportion",     description: "Comparing quantities the smart way.",    status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0, isFree: true, createdBy: 1 },
  { id: 500, subjectId: 50, title: "Force and Motion (Intro)", description: "A first look at pushes and pulls.",      status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0, isFree: true, createdBy: 1 },
  { id: 600, subjectId: 60, title: "Vectors",                  description: "Magnitude and direction.",               status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0, isFree: true, createdBy: 1 },
  { id: 700, subjectId: 70, title: "Atomic Structure",         description: "Protons, neutrons and electrons.",       status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0, isFree: true, createdBy: 1 },
  // ===== Class 6 =====
  { id: 301, subjectId: 30, title: "Geometry Basics",         description: "Points, lines, angles and shapes.",      status: "PUBLISHED", orderIndex: 1, videoId: "", price: 60, isFree: false, createdBy: 1 },
  { id: 310, subjectId: 31, title: "Living Things Around Us", description: "Plants, animals and their features.",    status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0,  isFree: true,  createdBy: 2 },
  { id: 311, subjectId: 31, title: "Matter Around Us",        description: "Solids, liquids and gases.",             status: "PUBLISHED", orderIndex: 1, videoId: "", price: 70, isFree: false, createdBy: 2 },
  { id: 320, subjectId: 32, title: "Parts of Speech",         description: "Nouns, verbs, adjectives and more.",     status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0,  isFree: true,  createdBy: 2 },
  { id: 321, subjectId: 32, title: "Reading Comprehension",   description: "Understanding what you read.",            status: "PUBLISHED", orderIndex: 1, videoId: "", price: 50, isFree: false, createdBy: 2 },
  // ===== Class 7 =====
  { id: 401, subjectId: 40, title: "Integers",                description: "Positive and negative numbers.",         status: "PUBLISHED", orderIndex: 1, videoId: "", price: 65, isFree: false, createdBy: 1 },
  { id: 410, subjectId: 41, title: "The Cell",                description: "The basic unit of life.",                status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0,  isFree: true,  createdBy: 2 },
  { id: 411, subjectId: 41, title: "Heat and Temperature",    description: "How heat moves and is measured.",        status: "PUBLISHED", orderIndex: 1, videoId: "", price: 75, isFree: false, createdBy: 2 },
  { id: 420, subjectId: 42, title: "Tenses",                  description: "Past, present and future.",              status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0,  isFree: true,  createdBy: 2 },
  { id: 421, subjectId: 42, title: "Essay Writing",          description: "Structure and style of a good essay.",   status: "PUBLISHED", orderIndex: 1, videoId: "", price: 55, isFree: false, createdBy: 2 },
  // ===== Class 8 =====
  { id: 501, subjectId: 50, title: "Light and Sound",         description: "Reflection, refraction and sound waves.", status: "PUBLISHED", orderIndex: 1, videoId: "", price: 80, isFree: false, createdBy: 1 },
  { id: 510, subjectId: 51, title: "Algebra Basics",          description: "Variables and simple equations.",        status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0,  isFree: true,  createdBy: 1 },
  { id: 511, subjectId: 51, title: "Mensuration",             description: "Area and perimeter of shapes.",          status: "DRAFT",     orderIndex: 1, videoId: "", price: 85, isFree: false, createdBy: 1 },
  { id: 520, subjectId: 52, title: "Grammar Essentials",      description: "Articles, prepositions and clauses.",    status: "PUBLISHED", orderIndex: 0, videoId: "", price: 0,  isFree: true,  createdBy: 2 },
  { id: 521, subjectId: 52, title: "Letter Writing",          description: "Formal and informal letters.",           status: "PUBLISHED", orderIndex: 1, videoId: "", price: 60, isFree: false, createdBy: 2 },
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
  // JSC/HSC free chapters
  { id: 3000, chapterId: 300, title: "Introduction to Fractions", description: "What is a fraction?",    orderIndex: 0 },
  { id: 4000, chapterId: 400, title: "Understanding Ratios",      description: "Comparing two numbers.", orderIndex: 0 },
  { id: 5000, chapterId: 500, title: "What is Force?",            description: "Push and pull.",         orderIndex: 0 },
  { id: 6000, chapterId: 600, title: "Introduction to Vectors",   description: "Arrows with meaning.",    orderIndex: 0 },
  { id: 7000, chapterId: 700, title: "Inside the Atom",           description: "The building blocks.",   orderIndex: 0 },
  // Class 6/7/8 expanded chapters
  { id: 3010, chapterId: 301, title: "Angles and Shapes",        description: "Types of angles.",        orderIndex: 0 },
  { id: 3100, chapterId: 310, title: "Plants and Animals",       description: "Grouping living things.", orderIndex: 0 },
  { id: 3110, chapterId: 311, title: "States of Matter",         description: "Solid, liquid, gas.",     orderIndex: 0 },
  { id: 3200, chapterId: 320, title: "Nouns and Verbs",          description: "The building blocks.",    orderIndex: 0 },
  { id: 3210, chapterId: 321, title: "Reading a Passage",        description: "Finding the main idea.",  orderIndex: 0 },
  { id: 4010, chapterId: 401, title: "The Number Line",          description: "Positive and negative.",  orderIndex: 0 },
  { id: 4100, chapterId: 410, title: "Parts of a Cell",          description: "Nucleus, membrane…",      orderIndex: 0 },
  { id: 4110, chapterId: 411, title: "Measuring Heat",           description: "Thermometers.",           orderIndex: 0 },
  { id: 4200, chapterId: 420, title: "The Present Tense",        description: "Habitual actions.",       orderIndex: 0 },
  { id: 4210, chapterId: 421, title: "Planning an Essay",        description: "Intro, body, conclusion.", orderIndex: 0 },
  { id: 5010, chapterId: 501, title: "How Light Travels",        description: "In straight lines.",      orderIndex: 0 },
  { id: 5100, chapterId: 510, title: "Introduction to Algebra",  description: "Letters for numbers.",    orderIndex: 0 },
  { id: 5110, chapterId: 511, title: "Area of Rectangles",       description: "Length × width.",         orderIndex: 0 },
  { id: 5200, chapterId: 520, title: "Using Articles",           description: "A, an, the.",             orderIndex: 0 },
  { id: 5210, chapterId: 521, title: "Formal Letters",           description: "Layout and tone.",        orderIndex: 0 },
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
  // JSC/HSC free chapter content
  { id: 30000, topicId: 3000, title: "Fractions — video lesson",    type: "LECTURE", orderIndex: 0 },
  { id: 40000, topicId: 4000, title: "Ratios — video lesson",       type: "LECTURE", orderIndex: 0 },
  { id: 50000, topicId: 5000, title: "Force basics — video",        type: "LECTURE", orderIndex: 0 },
  { id: 60000, topicId: 6000, title: "Vectors — video",             type: "LECTURE", orderIndex: 0 },
  { id: 70000, topicId: 7000, title: "Atomic structure — video",    type: "LECTURE", orderIndex: 0 },
  // Class 6/7/8 expanded content
  { id: 30100, topicId: 3010, title: "Angles — video lesson",       type: "LECTURE", orderIndex: 0 },
  { id: 31000, topicId: 3100, title: "Living things — video",       type: "LECTURE", orderIndex: 0 },
  { id: 31100, topicId: 3110, title: "States of matter — video",    type: "LECTURE", orderIndex: 0 },
  { id: 32000, topicId: 3200, title: "Nouns & verbs — video",       type: "LECTURE", orderIndex: 0 },
  { id: 32100, topicId: 3210, title: "Reading skills — video",      type: "LECTURE", orderIndex: 0 },
  { id: 40100, topicId: 4010, title: "Integers — video",            type: "LECTURE", orderIndex: 0 },
  { id: 41000, topicId: 4100, title: "The cell — video",            type: "LECTURE", orderIndex: 0 },
  { id: 41100, topicId: 4110, title: "Heat — video",                type: "LECTURE", orderIndex: 0 },
  { id: 42000, topicId: 4200, title: "Present tense — video",       type: "LECTURE", orderIndex: 0 },
  { id: 42100, topicId: 4210, title: "Essay planning — video",      type: "LECTURE", orderIndex: 0 },
  { id: 50100, topicId: 5010, title: "How light travels — video",   type: "LECTURE", orderIndex: 0 },
  { id: 51000, topicId: 5100, title: "Intro to algebra — video",    type: "LECTURE", orderIndex: 0 },
  { id: 51100, topicId: 5110, title: "Area of rectangles — video",  type: "LECTURE", orderIndex: 0 },
  { id: 52000, topicId: 5200, title: "Articles — video",            type: "LECTURE", orderIndex: 0 },
  { id: 52100, topicId: 5210, title: "Formal letters — video",      type: "LECTURE", orderIndex: 0 },
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
  30000: { id: 93000, videoId: "dQw4w9WgXcQ", content: "<p>A <strong>fraction</strong> shows part of a whole — like 3/4 of a pizza.</p>" },
  40000: { id: 93010, videoId: "",            content: "<p>A <strong>ratio</strong> compares two quantities, e.g. 2:3.</p>" },
  50000: { id: 93020, videoId: "",            content: "<p>A <strong>force</strong> is a push or a pull that can change motion.</p>" },
  60000: { id: 93030, videoId: "",            content: "<p>A <strong>vector</strong> has both magnitude and direction.</p>" },
  70000: { id: 93040, videoId: "",            content: "<p>An atom has protons, neutrons and electrons.</p>" },
  30100: { id: 94001, videoId: "",            content: "<p>An <strong>angle</strong> is formed where two lines meet.</p>" },
  31000: { id: 94002, videoId: "",            content: "<p>Living things are grouped into plants and animals.</p>" },
  31100: { id: 94003, videoId: "",            content: "<p>Matter exists as a solid, a liquid or a gas.</p>" },
  32000: { id: 94004, videoId: "",            content: "<p>A noun names something; a verb shows action.</p>" },
  32100: { id: 94005, videoId: "",            content: "<p>Read carefully and find the main idea of the passage.</p>" },
  40100: { id: 94006, videoId: "",            content: "<p>Integers include positive numbers, negative numbers and zero.</p>" },
  41000: { id: 94007, videoId: "",            content: "<p>The <strong>cell</strong> is the basic unit of life.</p>" },
  41100: { id: 94008, videoId: "",            content: "<p>Heat flows from hot to cold; temperature is measured in °C.</p>" },
  42000: { id: 94009, videoId: "",            content: "<p>The present tense describes habitual or current actions.</p>" },
  42100: { id: 94010, videoId: "",            content: "<p>An essay has an introduction, a body and a conclusion.</p>" },
  50100: { id: 94011, videoId: "",            content: "<p>Light travels in straight lines called rays.</p>" },
  51000: { id: 94012, videoId: "",            content: "<p>Algebra uses letters to stand for unknown numbers.</p>" },
  51100: { id: 94013, videoId: "",            content: "<p>Area of a rectangle = length × width.</p>" },
  52000: { id: 94014, videoId: "",            content: "<p>Use 'a', 'an' and 'the' correctly in sentences.</p>" },
  52100: { id: 94015, videoId: "",            content: "<p>A formal letter follows a fixed layout and a polite tone.</p>" },
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
  { chapterId: 100, featuredAt: "2026-05-01T10:00:00" }, // Class 9 (SSC)
  { chapterId: 110, featuredAt: "2026-05-15T10:00:00" }, // Class 9 (SSC)
  { chapterId: 200, featuredAt: "2026-06-01T10:00:00" }, // Class 10 (SSC)
  { chapterId: 300, featuredAt: "2026-06-10T10:00:00" }, // Class 6 (JSC)
  { chapterId: 500, featuredAt: "2026-06-12T10:00:00" }, // Class 8 (JSC)
  { chapterId: 600, featuredAt: "2026-06-15T10:00:00" }, // Class 11 (HSC)
  { chapterId: 700, featuredAt: "2026-06-18T10:00:00" }, // Class 12 (HSC)
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

// ============================================================================
// Notices demo data — admin-managed announcements shown on the homepage.
// In-memory, resets on restart.
// type: INFO | IMPORTANT | URGENT  (drives the colour on the frontend)
// ============================================================================

const notices = [
  {
    id: 3001,
    title: "Admission open for the new batch",
    message: "Enrolment for the upcoming term is now open across all classes. Reserve your seat early.",
    type: "IMPORTANT",
    link: "/classes",
    active: true,
    orderIndex: 0,
  },
  {
    id: 3002,
    title: "SSC 2026 board analysis added to the shop",
    message: "Chapter-wise mark distribution and question patterns for SSC Physics are now available.",
    type: "INFO",
    link: "/shop",
    active: true,
    orderIndex: 1,
  },
  {
    id: 3003,
    title: "Live class — Newton's Laws, Friday 8:00 PM",
    message: "Join the free live session on Motion & Force this Friday. Open to all enrolled students.",
    type: "URGENT",
    link: "",
    active: true,
    orderIndex: 2,
  },
];

const counters = { notice: 3100 };

module.exports = { notices, counters };

import {
    LuLightbulb,
    LuBrain,
    LuCalendarClock,
    LuUsers,
    LuMessageSquare,
    LuTrendingUp,
} from "react-icons/lu";

// Six teaching principles shown on the homepage ("How we actually teach").
// Text is intentionally kept here (not in i18n) so it's easy to find and edit.
const principles = [
    {
        icon: <LuLightbulb size={20} />,
        title: "Start with why",
        desc: "We don’t just tell you the answer — we guide you to see why it’s the only logical conclusion. Understanding beats memorising every time.",
        tag: "Conceptual depth",
        iconClass: "bg-amber-100 text-amber-600",
        tagClass: "bg-amber-50 text-amber-700",
    },
    {
        icon: <LuBrain size={20} />,
        title: "Active recall",
        desc: "Every session ends with retrieval, not re-reading. Pulling information from memory is what makes it stick — passive review barely works.",
        tag: "Cognitive science",
        iconClass: "bg-emerald-100 text-emerald-600",
        tagClass: "bg-emerald-50 text-emerald-700",
    },
    {
        icon: <LuCalendarClock size={20} />,
        title: "Spaced repetition",
        desc: "We revisit material at calculated intervals — Day 1, Day 3, Day 7, Day 21 — so knowledge transfers into long-term memory before exams arrive.",
        tag: "Memory science",
        iconClass: "bg-teal-100 text-teal-600",
        tagClass: "bg-teal-50 text-teal-700",
    },
    {
        icon: <LuUsers size={20} />,
        title: "Personalised learning",
        desc: "No two students have the same gaps. We diagnose where each learner stands and adapt the pace, depth, and examples accordingly.",
        tag: "Adaptive teaching",
        iconClass: "bg-blue-100 text-blue-600",
        tagClass: "bg-blue-50 text-blue-700",
    },
    {
        icon: <LuMessageSquare size={20} />,
        title: "Reciprocal teaching",
        desc: "When you explain a concept to someone else, your brain reorganises it clearly. We build this into the classroom — teaching peers cements understanding.",
        tag: "Peer learning",
        iconClass: "bg-indigo-100 text-indigo-600",
        tagClass: "bg-indigo-50 text-indigo-700",
    },
    {
        icon: <LuTrendingUp size={20} />,
        title: "Visible progress",
        desc: "Students track their own performance week by week. Seeing growth builds the confidence that struggling learners often lack — and confidence compounds.",
        tag: "Growth mindset",
        iconClass: "bg-rose-100 text-rose-600",
        tagClass: "bg-rose-50 text-rose-700",
    },
];

export default function ValueProps() {
    return (
        <section className="py-24 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-5">
                        Our Approach
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
                        How we actually teach
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                        Six principles that shape every class at Montola &mdash; grounded in
                        cognitive science, built for students who need to go further.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {principles.map((p) => (
                        <div
                            key={p.title}
                            className="flex flex-col bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300"
                        >
                            <div className={`w-11 h-11 ${p.iconClass} rounded-xl flex items-center justify-center mb-5`}>
                                {p.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">{p.desc}</p>
                            <span className={`inline-block self-start mt-auto px-3 py-1 rounded-full text-xs font-medium ${p.tagClass}`}>
                                {p.tag}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

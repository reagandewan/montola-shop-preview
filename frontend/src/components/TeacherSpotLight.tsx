const teachers = [
    { name: "Mr. Rahman", subject: "Mathematics", badge: "PhD" },
    { name: "Ms. Akter", subject: "Physics", badge: "MSc" },
    { name: "Mr. Karim", subject: "English", badge: "MA" },
];

export default function TeacherSpotlight() {
    return (
        <section className="py-20 px-6 bg-white">
            <h2 className="text-3xl font-bold text-center mb-12">Teacher Spotlight</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {teachers.map((t) => (
                    <div key={t.name} className="text-center p-6 border rounded-lg shadow-sm hover:shadow-md transition">
                        <div className="h-32 w-32 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center text-4xl">
                            👩‍🏫
                        </div>
                        <h3 className="text-xl font-bold mb-1">{t.name}</h3>
                        <p className="text-gray-600 mb-2">{t.subject}</p>
                        <span className="inline-block px-3 py-1 text-sm bg-green-200 rounded-full">{t.badge}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

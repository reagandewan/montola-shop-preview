const testimonials = [
    { name: "Amina", text: "Montola School helped me score top marks in HSC!" },
    { name: "Rashid", text: "Affordable and structured learning made studying easy." },
    { name: "Sumi", text: "The teachers are friendly and very knowledgeable." },
];

export default function Testimonials() {
    return (
        <section className="py-20 px-6 bg-gray-50">
            <h2 className="text-3xl font-bold text-center mb-12">What Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {testimonials.map((t) => (
                    <div key={t.name} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <p className="text-gray-700 mb-4">&quot;{t.text}&quot;</p>
                        <p className="font-semibold text-green-600">- {t.name}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

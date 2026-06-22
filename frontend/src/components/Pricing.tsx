const plans = [
    { name: "Per Chapter", price: "৳100", features: ["Single Chapter Access"] },
    { name: "Subject Bundle", price: "৳450", features: ["Full Subject Access"] },
    { name: "Full Course Access", price: "৳1200", features: ["All Subjects & Chapters"] },
];

export default function Pricing() {
    return (
        <section className="py-20 px-6 bg-white">
            <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((p) => (
                    <div key={p.name} className="border p-6 rounded-lg shadow hover:shadow-lg transition text-center">
                        <h3 className="text-xl font-bold mb-4">{p.name}</h3>
                        <p className="text-green-600 font-semibold mb-4">{p.price}</p>
                        <ul className="mb-4">
                            {p.features.map((f) => (
                                <li key={f} className="text-gray-700">{f}</li>
                            ))}
                        </ul>
                        <button className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition">
                            Choose Plan
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

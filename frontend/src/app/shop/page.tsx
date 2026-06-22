"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuShoppingBag, LuArrowRight } from "react-icons/lu";
import { getFeaturedProducts, getBundles, getLevels } from "@/lib/shop";
import { PRODUCT_TYPE_META, TYPE_FAMILIES, formatTaka } from "@/lib/shopMeta";
import type { ShopProductCard, ShopBundle, ShopProductType, ShopLevel } from "@/types/shop";
import ProductCard from "@/components/shop/ProductCard";

// Short descriptions for each exam level shown on the "browse by class" cards.
const LEVEL_DESC: Record<string, string> = {
    JSC: "Class 6 – 8",
    SSC: "Class 9 – 10",
    HSC: "Class 11 – 12",
};

export default function ShopLandingPage() {
    const [featured, setFeatured] = useState<ShopProductCard[]>([]);
    const [bundles, setBundles] = useState<ShopBundle[]>([]);
    const [levels, setLevels] = useState<ShopLevel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getFeaturedProducts(), getBundles(), getLevels()])
            .then(([f, b, l]) => {
                setFeatured(f);
                setBundles(b);
                setLevels(l);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="overflow-x-hidden">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
                        <LuShoppingBag /> Montola shop
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl mb-4 max-w-2xl">
                        Study materials that actually help
                    </h1>
                    <p className="text-white/85 text-lg max-w-xl mb-8">
                        Notes, board analysis, solved questions, worksheets and drill sheets — by class,
                        subject and chapter.
                    </p>
                    <Link
                        href="/shop/browse"
                        className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                    >
                        Browse all products <LuArrowRight />
                    </Link>
                </div>
            </section>

            {/* Browse by class / level */}
            {levels.length > 0 && (
                <section className="py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by class</h2>
                        <p className="text-gray-500 mb-6 text-sm">Find everything for your exam level.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {levels.map((l) => (
                                <Link
                                    key={l.id}
                                    href={`/shop/browse?levelId=${l.id}`}
                                    className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition flex items-center justify-between"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{l.name}</h3>
                                        <p className="text-sm text-gray-500">{LEVEL_DESC[l.name] ?? "All materials"}</p>
                                    </div>
                                    <span className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition">
                                        <LuArrowRight />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Browse by type family */}
            <section className="py-4 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TYPE_FAMILIES.map((fam) => (
                            <div key={fam.key} className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">{fam.label}</h3>
                                <div className="flex flex-col gap-2">
                                    {fam.types.map((t) => {
                                        const meta = PRODUCT_TYPE_META[t as ShopProductType];
                                        const Icon = meta.icon;
                                        return (
                                            <Link
                                                key={t}
                                                href={`/shop/browse?type=${t}`}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.iconClass}`}>
                                                    <Icon size={16} />
                                                </span>
                                                <span className="text-sm text-gray-700">{meta.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured */}
            <section className="py-4 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
                        <Link href="/shop/browse" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                            See all →
                        </Link>
                    </div>
                    {loading ? (
                        <p className="text-gray-500">Loading products…</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {featured.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Bundles */}
            {bundles.length > 0 && (
                <section className="py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bundles</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            Save with packs. Download packs are for teachers &amp; coaching centres.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bundles.map((b) => (
                                <Link
                                    key={b.id}
                                    href={`/shop/bundles/${b.id}`}
                                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700">
                                            {b.audience === "TEACHER_COACHING" ? "Teachers & coaching" : "Bundle"}
                                        </span>
                                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                            {b.accessMode === "DOWNLOAD" ? "Downloadable" : "Online"}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{b.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-900">{formatTaka(b.price)}</span>
                                        <span className="text-xs text-gray-500">{b.productCount} items</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

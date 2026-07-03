"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuShoppingBag, LuArrowRight, LuGraduationCap, LuSearch, LuCheck } from "react-icons/lu";
import { getFeaturedProducts, getBundles, getLevels, getShopClasses } from "@/lib/shop";
import { PRODUCT_TYPE_META, TYPE_FAMILIES, formatTaka } from "@/lib/shopMeta";
import type { ShopProductCard, ShopBundle, ShopProductType, ShopLevel, ShopClass } from "@/types/shop";
import ProductCard from "@/components/shop/ProductCard";
import { useI18n } from "@/contexts/I18nProvider";

// Class-range subtitle shown on each level card.
const LEVEL_RANGE: Record<string, string> = {
    JSC: "Classes 6 – 8",
    SSC: "Classes 9 – 10",
    HSC: "Classes 11 – 12",
};

export default function ShopLandingPage() {
    const { t } = useI18n();
    const router = useRouter();
    const [featured, setFeatured] = useState<ShopProductCard[]>([]);
    const [bundles, setBundles] = useState<ShopBundle[]>([]);
    const [levels, setLevels] = useState<ShopLevel[]>([]);
    const [classes, setClasses] = useState<ShopClass[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/shop/browse?q=${encodeURIComponent(q)}` : "/shop/browse");
    };

    useEffect(() => {
        Promise.all([getFeaturedProducts(), getBundles(), getLevels(), getShopClasses()])
            .then(([f, b, l, c]) => {
                setFeatured(f);
                setBundles(b);
                setLevels(l);
                setClasses(c);
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
                        <LuShoppingBag /> {t("shopHero.badge")}
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl mb-4 max-w-3xl leading-tight">
                        {t("shopHero.title")}
                    </h1>
                    <p className="text-white/85 text-lg max-w-xl mb-8">
                        {t("shopHero.subtitle")}
                    </p>

                    {/* Search */}
                    <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
                        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4">
                            <LuSearch className="text-gray-400 shrink-0" size={20} />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t("shopHero.searchPlaceholder")}
                                className="flex-1 py-3.5 text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                            />
                        </div>
                        <button type="submit" className="bg-white text-primary-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-100 transition shrink-0">
                            {t("shopHero.search")}
                        </button>
                    </form>
                    <Link href="/shop/browse" className="inline-flex items-center gap-1 mt-3 text-sm text-white/80 hover:text-white transition">
                        {t("shopHero.browseAll")} <LuArrowRight size={14} />
                    </Link>

                    {/* Trust strip */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-white/90">
                        <span className="inline-flex items-center gap-2"><LuCheck size={16} /> {t("shopHero.trust1")}</span>
                        <span className="inline-flex items-center gap-2"><LuCheck size={16} /> {t("shopHero.trust2")}</span>
                        <span className="inline-flex items-center gap-2"><LuCheck size={16} /> {t("shopHero.trust3")}</span>
                    </div>
                </div>
            </section>

            {/* Browse by class (grouped under level) */}
            {classes.length > 0 && (
                <section className="py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by class</h2>
                        <p className="text-gray-500 mb-8 text-sm">Pick your class to see materials made just for it.</p>

                        {/* All levels as parallel, equal-height cards: JSC | SSC | HSC */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                            {levels.map((lvl) => {
                                const lvlClasses = classes.filter((c) => c.levelId === lvl.id);
                                const hasClasses = lvlClasses.length > 0;
                                return (
                                    <div key={lvl.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                                        {/* header */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                                                <LuGraduationCap size={22} />
                                            </span>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 leading-none">{lvl.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{LEVEL_RANGE[lvl.name] ?? "All materials"}</p>
                                            </div>
                                        </div>

                                        {hasClasses ? (
                                            <>
                                                <div className="space-y-2">
                                                    {lvlClasses.map((c) => (
                                                        <Link
                                                            key={c.id}
                                                            href={`/shop/browse?classId=${c.id}`}
                                                            className="group flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 hover:border-primary-300 hover:bg-primary-50/40 transition"
                                                        >
                                                            <span className="font-semibold text-gray-800 group-hover:text-primary-700">{c.name}</span>
                                                            <LuArrowRight className="text-gray-300 group-hover:text-primary-500 transition" size={16} />
                                                        </Link>
                                                    ))}
                                                </div>
                                                <Link href={`/shop/browse?levelId=${lvl.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
                                                    View all {lvl.name} <LuArrowRight size={14} />
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-500 leading-relaxed">
                                                    Everything for the whole {lvl.name} programme — notes, board analysis, solutions, worksheets and more, in one place.
                                                </p>
                                                <Link
                                                    href={`/shop/browse?levelId=${lvl.id}`}
                                                    className="mt-auto flex w-full items-center justify-center gap-2 bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition"
                                                >
                                                    Browse {lvl.name} materials <LuArrowRight size={16} />
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
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

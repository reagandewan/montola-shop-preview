"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuSearch, LuX } from "react-icons/lu";
import { getProducts, getLevels, getShopClasses } from "@/lib/shop";
import { PRODUCT_TYPE_META } from "@/lib/shopMeta";
import type { ShopProductCard, ShopLevel, ShopClass, ShopProductType, ShopFilters } from "@/types/shop";
import ProductCard from "@/components/shop/ProductCard";

const ALL_TYPES = Object.keys(PRODUCT_TYPE_META) as ShopProductType[];

function BrowseInner() {
    const params = useSearchParams();
    const initialType = (params.get("type") as ShopProductType) || undefined;
    const initialLevel = params.get("levelId") ? Number(params.get("levelId")) : undefined;
    const initialClass = params.get("classId") ? Number(params.get("classId")) : undefined;
    const initialQ = params.get("q") || "";

    const [type, setType] = useState<ShopProductType | undefined>(initialType);
    const [levelId, setLevelId] = useState<number | undefined>(initialLevel);
    const [classId, setClassId] = useState<number | undefined>(initialClass);
    const [query, setQuery] = useState(initialQ);
    const [levels, setLevels] = useState<ShopLevel[]>([]);
    const [classes, setClasses] = useState<ShopClass[]>([]);
    const [products, setProducts] = useState<ShopProductCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLevels().then(setLevels).catch(() => {});
        getShopClasses().then((cs) => {
            setClasses(cs);
            // if arriving via ?classId=, sync the level dropdown to that class's level
            if (initialClass) {
                const c = cs.find((x) => x.id === initialClass);
                if (c) setLevelId(c.levelId);
            }
        }).catch(() => {});
    }, [initialClass]);

    useEffect(() => {
        setLoading(true);
        const filters: ShopFilters = {};
        if (type) filters.type = type;
        if (classId) filters.classId = classId;
        else if (levelId) filters.levelId = levelId;
        getProducts(filters)
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [type, levelId, classId]);

    // text search filters the fetched products client-side (title + description)
    const q = query.trim().toLowerCase();
    const shown = q
        ? products.filter((p) => `${p.title} ${p.description}`.toLowerCase().includes(q))
        : products;

    // classes available for the class dropdown (narrowed to selected level)
    const classOptions = levelId ? classes.filter((c) => c.levelId === levelId) : classes;

    const selectedClass = classes.find((c) => c.id === classId);
    const selectedLevel = levels.find((l) => l.id === levelId);
    const heading = selectedClass ? selectedClass.name : selectedLevel ? `All ${selectedLevel.name}` : "All products";

    const onLevelChange = (v: string) => {
        const lv = v ? Number(v) : undefined;
        setLevelId(lv);
        // clear class if it no longer belongs to the chosen level
        if (classId && lv && !classes.some((c) => c.id === classId && c.levelId === lv)) setClassId(undefined);
        if (!lv) setClassId(undefined);
    };
    const onClassChange = (v: string) => {
        const cid = v ? Number(v) : undefined;
        setClassId(cid);
        if (cid) {
            const c = classes.find((x) => x.id === cid);
            if (c) setLevelId(c.levelId);
        }
    };

    return (
        <main className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-2 text-sm text-gray-500">
                <Link href="/shop" className="hover:text-primary-600">Shop</Link> / Browse
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse products</h1>
            <p className="text-gray-500 mb-6">{heading}</p>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 mb-6 max-w-md focus-within:border-primary-400">
                <LuSearch className="text-gray-400 shrink-0" size={18} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search notes, worksheets, class 8…"
                    className="flex-1 py-2.5 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                />
                {query && (
                    <button onClick={() => setQuery("")} aria-label="Clear search" className="text-gray-400 hover:text-gray-600 shrink-0">
                        <LuX size={16} />
                    </button>
                )}
            </div>

            {/* Type chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => setType(undefined)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition ${!type ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 text-gray-600 hover:border-primary-400"}`}
                >
                    All
                </button>
                {ALL_TYPES.map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition ${type === t ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 text-gray-600 hover:border-primary-400"}`}
                    >
                        {PRODUCT_TYPE_META[t].label}
                    </button>
                ))}
            </div>

            {/* Level + Class filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Level</span>
                    <select value={levelId ?? ""} onChange={(e) => onLevelChange(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
                        <option value="">All</option>
                        {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
                {classOptions.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Class</span>
                        <select value={classId ?? ""} onChange={(e) => onClassChange(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
                            <option value="">All</option>
                            {classOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <p className="text-gray-500">Loading products…</p>
            ) : shown.length === 0 ? (
                <p className="text-gray-500">{q ? `No products match “${query.trim()}”.` : "No products match these filters."}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {shown.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </main>
    );
}

export default function BrowsePage() {
    return (
        <Suspense fallback={<main className="max-w-6xl mx-auto px-6 py-12 text-gray-500">Loading…</main>}>
            <BrowseInner />
        </Suspense>
    );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getProducts, getLevels } from "@/lib/shop";
import { PRODUCT_TYPE_META } from "@/lib/shopMeta";
import type { ShopProductCard, ShopLevel, ShopProductType, ShopFilters } from "@/types/shop";
import ProductCard from "@/components/shop/ProductCard";

const ALL_TYPES = Object.keys(PRODUCT_TYPE_META) as ShopProductType[];

function BrowseInner() {
    const params = useSearchParams();
    const initialType = (params.get("type") as ShopProductType) || undefined;
    const initialLevel = params.get("levelId") ? Number(params.get("levelId")) : undefined;

    const [type, setType] = useState<ShopProductType | undefined>(initialType);
    const [levelId, setLevelId] = useState<number | undefined>(initialLevel);
    const [levels, setLevels] = useState<ShopLevel[]>([]);
    const [products, setProducts] = useState<ShopProductCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLevels().then(setLevels).catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        const filters: ShopFilters = {};
        if (type) filters.type = type;
        if (levelId) filters.levelId = levelId;
        getProducts(filters)
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [type, levelId]);

    return (
        <main className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-2 text-sm text-gray-500">
                <Link href="/shop" className="hover:text-primary-600">Shop</Link> / Browse
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse products</h1>

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

            {/* Level filter */}
            <div className="flex items-center gap-3 mb-8">
                <span className="text-sm text-gray-500">Level</span>
                <select
                    value={levelId ?? ""}
                    onChange={(e) => setLevelId(e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                >
                    <option value="">All</option>
                    {levels.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading products…</p>
            ) : products.length === 0 ? (
                <p className="text-gray-500">No products match these filters.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {products.map((p) => (
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

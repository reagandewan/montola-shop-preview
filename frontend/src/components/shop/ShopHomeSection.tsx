"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuShoppingBag, LuArrowRight } from "react-icons/lu";
import { getFeaturedProducts } from "@/lib/shop";
import type { ShopProductCard } from "@/types/shop";
import ProductCardComponent from "@/components/shop/ProductCard";

export default function ShopHomeSection() {
    const [products, setProducts] = useState<ShopProductCard[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getFeaturedProducts()
            .then((p) => setProducts(p.slice(0, 4)))
            .catch(() => setProducts([]))
            .finally(() => setLoaded(true));
    }, []);

    // Don't render an empty section if the shop has nothing to show
    if (loaded && products.length === 0) return null;

    return (
        <section className="py-20 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                    <div>
                        <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                            <LuShoppingBag /> Montola shop
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-2">
                            Study materials, ready to use
                        </h2>
                        <p className="text-gray-600 max-w-xl">
                            Notes, board analysis, worksheets and more — by class, subject and chapter.
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-primary-700 transition shrink-0"
                    >
                        Visit the shop <LuArrowRight />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {products.map((p) => (
                        <ProductCardComponent key={p.id} product={p} />
                    ))}
                </div>
            </div>
        </section>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LuDownload, LuUsers } from "react-icons/lu";
import { useAuth } from "@/contexts/AuthContext";
import { getBundle, getMyShopPayments } from "@/lib/shop";
import { formatTaka } from "@/lib/shopMeta";
import type { ShopBundle } from "@/types/shop";
import ProductCard from "@/components/shop/ProductCard";
import ShopCheckoutModal from "@/components/shop/ShopCheckoutModal";

export default function BundleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [bundle, setBundle] = useState<ShopBundle | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        getBundle(Number(id))
            .then(setBundle)
            .catch(() => setBundle(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!isLoggedIn || !bundle) return;
        getMyShopPayments()
            .then((ps) => setPending(ps.some((p) => p.bundleId === bundle.id && p.status === "PENDING")))
            .catch(() => {});
    }, [isLoggedIn, bundle]);

    const handleBuy = () => {
        if (!isLoggedIn) return router.push("/auth/login");
        setCheckoutOpen(true);
    };

    if (loading) return <main className="max-w-5xl mx-auto px-6 py-16 text-gray-500">Loading…</main>;
    if (!bundle) return <main className="max-w-5xl mx-auto px-6 py-16 text-gray-500">Bundle not found.</main>;

    const isDownloadPack = bundle.accessMode === "DOWNLOAD";

    return (
        <main className="max-w-5xl mx-auto px-6 py-12">
            <div className="mb-4 text-sm text-gray-500">
                <Link href="/shop" className="hover:text-primary-600">Shop</Link> / Bundle
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700">
                        <LuUsers size={13} /> {bundle.audience === "TEACHER_COACHING" ? "Teachers & coaching" : "Everyone"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {isDownloadPack ? <><LuDownload size={13} /> Downloadable</> : "Online access"}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{bundle.title}</h1>
                <p className="text-gray-600 mb-5">{bundle.description}</p>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-900">{formatTaka(bundle.price)}</span>
                    {pending ? (
                        <span className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
                            Payment submitted — pending verification.
                        </span>
                    ) : (
                        <button onClick={handleBuy} className="bg-primary-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700 transition">
                            {isLoggedIn ? "Buy bundle" : "Login to buy"}
                        </button>
                    )}
                </div>
                {isDownloadPack && (
                    <p className="text-xs text-gray-500 mt-3">
                        Downloadable files are watermarked and reserved for verified teacher / coaching accounts.
                    </p>
                )}
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4">{bundle.productCount} items in this bundle</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {bundle.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>

            <ShopCheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                title={bundle.title}
                amount={bundle.price}
                bundleId={bundle.id}
                onSuccess={() => setPending(true)}
            />
        </main>
    );
}

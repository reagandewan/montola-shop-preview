"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { LuLock, LuDownload, LuEye } from "react-icons/lu";
import { useAuth } from "@/contexts/AuthContext";
import { getProduct, getProductContent, getDownloadLink, getMyShopPayments } from "@/lib/shop";
import { PRODUCT_TYPE_META, formatTaka } from "@/lib/shopMeta";
import type { ShopProductDetail, ShopProductContent } from "@/types/shop";
import ShopCheckoutModal from "@/components/shop/ShopCheckoutModal";

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    const [product, setProduct] = useState<ShopProductDetail | null>(null);
    const [content, setContent] = useState<ShopProductContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        getProduct(Number(id))
            .then(setProduct)
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [id]);

    // detect an already-submitted (pending) payment so the user doesn't pay twice
    useEffect(() => {
        if (!isLoggedIn || !product || product.entitled) return;
        getMyShopPayments()
            .then((ps) => setPending(ps.some((p) => p.productId === product.id && p.status === "PENDING")))
            .catch(() => {});
    }, [isLoggedIn, product]);

    const handleView = async () => {
        try {
            setContent(await getProductContent(Number(id)));
        } catch {
            toast.error("You don't have access to this product yet.");
        }
    };

    const handleDownload = async () => {
        try {
            const link = await getDownloadLink(Number(id));
            toast.success(`Download ready (demo): ${link.fileId}`);
        } catch {
            toast.error("Download not permitted for this account.");
        }
    };

    const handleBuy = () => {
        if (!isLoggedIn) {
            router.push("/auth/login");
            return;
        }
        setCheckoutOpen(true);
    };

    if (loading) return <main className="max-w-4xl mx-auto px-6 py-16 text-gray-500">Loading…</main>;
    if (!product) return <main className="max-w-4xl mx-auto px-6 py-16 text-gray-500">Product not found.</main>;

    const meta = PRODUCT_TYPE_META[product.type];
    const Icon = meta.icon;
    const scope = [product.levelName, product.subjectName, product.chapterTitle].filter(Boolean).join(" · ");

    return (
        <main className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-4 text-sm text-gray-500">
                <Link href="/shop" className="hover:text-primary-600">Shop</Link> /{" "}
                <Link href="/shop/browse" className="hover:text-primary-600">Browse</Link> / {meta.label}
            </div>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${meta.iconClass}`}>
                    <Icon size={30} />
                </div>
                <div>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${meta.tagClass}`}>{meta.label}</span>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.title}</h1>
                    {scope && <p className="text-sm text-gray-500 mt-1">{scope}</p>}
                </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>

            {/* Access panel */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-8">
                {product.entitled ? (
                    <div>
                        <p className="text-sm font-medium text-primary-700 mb-4 flex items-center gap-2">
                            <LuEye /> You have access to this product.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={handleView} className="bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition">
                                View online
                            </button>
                            {product.canDownload && (
                                <button onClick={handleDownload} className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition">
                                    <LuDownload /> Download
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-gray-900">{formatTaka(product.price)}</span>
                            <span className="flex items-center gap-1.5 text-xs text-gray-500"><LuLock size={14} /> View online after purchase</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 bg-white border border-dashed border-gray-300 rounded-lg p-3">
                            {product.preview}
                        </p>
                        {pending ? (
                            <p className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                Payment submitted — waiting for an admin to verify it. You'll get access shortly.
                            </p>
                        ) : (
                            <button onClick={handleBuy} className="bg-primary-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700 transition">
                                {isLoggedIn ? "Buy now" : "Login to buy"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <ShopCheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                title={product.title}
                amount={product.price}
                productId={product.id}
                onSuccess={() => setPending(true)}
            />

            {/* Rendered content (entitled only) */}
            {content && (
                <div className="relative bg-white border border-gray-200 rounded-2xl p-6 overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06] -rotate-12 text-2xl font-bold text-gray-900 select-none">
                        {content.watermark}
                    </div>
                    <div className="relative">
                        {content.html ? (
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content.html }} />
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p className="font-medium text-gray-700 mb-1">PDF viewer (demo)</p>
                                <p className="text-sm">{content.pageCount} pages · streamed in-app, watermarked, no download.</p>
                            </div>
                        )}
                        <p className="mt-4 text-[11px] text-gray-400">{content.watermark}</p>
                    </div>
                </div>
            )}
        </main>
    );
}

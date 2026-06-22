"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAdminProducts, deleteProduct, getLevels } from "@/lib/shop";
import { getAllSubjects, getAllChapters } from "@/lib/admin";
import { PRODUCT_TYPE_META, formatTaka } from "@/lib/shopMeta";
import type { ShopProductCard, ShopLevel } from "@/types/shop";
import ShopProductForm from "@/components/admin/ShopProductForm";

interface Option { id: number; label: string }

export default function AdminShopProductsPage() {
    const [products, setProducts] = useState<ShopProductCard[]>([]);
    const [levels, setLevels] = useState<ShopLevel[]>([]);
    const [subjects, setSubjects] = useState<Option[]>([]);
    const [chapters, setChapters] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<ShopProductCard | null>(null);

    const load = () => {
        setLoading(true);
        getAdminProducts().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        getLevels().then(setLevels).catch(() => {});
        getAllSubjects().then((r) => setSubjects(r.data.map((s: any) => ({ id: s.id, label: s.className ? `${s.name} · ${s.className}` : s.name })))).catch(() => {});
        getAllChapters().then((r) => setChapters(r.data.map((c: any) => ({ id: c.id, label: c.title })))).catch(() => {});
    }, []);

    const openNew = () => { setEditing(null); setFormOpen(true); };
    const openEdit = (p: ShopProductCard) => { setEditing(p); setFormOpen(true); };

    const remove = async (p: ShopProductCard) => {
        if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
        try {
            await deleteProduct(p.id);
            toast.success("Product deleted.");
            load();
        } catch {
            toast.error("Delete failed.");
        }
    };

    const scope = (p: ShopProductCard) =>
        [p.levelName, p.subjectName, p.chapterTitle].filter(Boolean).join(" · ") || "—";

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shop products</h1>
                    <p className="text-gray-500 text-sm">{products.length} products</p>
                </div>
                <button onClick={openNew} className="bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition">
                    + New product
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading…</p>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Scope</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3 text-gray-800">
                                        {p.title}
                                        {p.featured && <span className="ml-2 text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">FEATURED</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${PRODUCT_TYPE_META[p.type].tagClass}`}>{PRODUCT_TYPE_META[p.type].label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{scope(p)}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{formatTaka(p.price)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "PUBLISHED" ? "bg-primary-50 text-primary-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <button onClick={() => openEdit(p)} className="text-primary-600 hover:underline text-xs font-semibold mr-3">Edit</button>
                                        <button onClick={() => remove(p)} className="text-rose-600 hover:underline text-xs font-semibold">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {formOpen && (
                <ShopProductForm
                    key={editing?.id ?? "new"}
                    isOpen={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSaved={load}
                    product={editing}
                    levels={levels}
                    subjects={subjects}
                    chapters={chapters}
                />
            )}
        </div>
    );
}

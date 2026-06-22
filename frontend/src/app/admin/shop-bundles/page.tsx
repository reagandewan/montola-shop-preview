"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAdminBundles, deleteBundle, getAdminProducts, getLevels } from "@/lib/shop";
import { getAllSubjects } from "@/lib/admin";
import { formatTaka } from "@/lib/shopMeta";
import type { ShopBundle, ShopLevel, ShopProductCard } from "@/types/shop";
import ShopBundleForm from "@/components/admin/ShopBundleForm";

interface Option { id: number; label: string }

export default function AdminShopBundlesPage() {
    const [bundles, setBundles] = useState<ShopBundle[]>([]);
    const [products, setProducts] = useState<ShopProductCard[]>([]);
    const [levels, setLevels] = useState<ShopLevel[]>([]);
    const [subjects, setSubjects] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<ShopBundle | null>(null);

    const load = () => {
        setLoading(true);
        getAdminBundles().then(setBundles).catch(() => setBundles([])).finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        getAdminProducts().then(setProducts).catch(() => {});
        getLevels().then(setLevels).catch(() => {});
        getAllSubjects().then((r) => setSubjects(r.data.map((s: any) => ({ id: s.id, label: s.className ? `${s.name} · ${s.className}` : s.name })))).catch(() => {});
    }, []);

    const openNew = () => { setEditing(null); setFormOpen(true); };
    const openEdit = (b: ShopBundle) => { setEditing(b); setFormOpen(true); };

    const remove = async (b: ShopBundle) => {
        if (!confirm(`Delete "${b.title}"?`)) return;
        try {
            await deleteBundle(b.id);
            toast.success("Bundle deleted.");
            load();
        } catch {
            toast.error("Delete failed.");
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shop bundles</h1>
                    <p className="text-gray-500 text-sm">{bundles.length} bundles</p>
                </div>
                <button onClick={openNew} className="bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition">
                    + New bundle
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading…</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bundles.map((b) => (
                        <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="font-bold text-gray-900">{b.title}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${b.status === "PUBLISHED" ? "bg-primary-50 text-primary-700" : "bg-gray-100 text-gray-500"}`}>{b.status}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 mb-3">{b.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs mb-3">
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{b.audience === "TEACHER_COACHING" ? "Teacher / coaching" : "General"}</span>
                                <span className={`px-2 py-0.5 rounded-full ${b.accessMode === "DOWNLOAD" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{b.accessMode === "DOWNLOAD" ? "Downloadable" : "View online"}</span>
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{b.productCount} products</span>
                                {b.levelName && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{b.levelName}</span>}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">{formatTaka(b.price)}</span>
                                <div className="text-xs font-semibold">
                                    <button onClick={() => openEdit(b)} className="text-primary-600 hover:underline mr-3">Edit</button>
                                    <button onClick={() => remove(b)} className="text-rose-600 hover:underline">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {formOpen && (
                <ShopBundleForm
                    key={editing?.id ?? "new"}
                    isOpen={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSaved={load}
                    bundle={editing}
                    levels={levels}
                    subjects={subjects}
                    products={products}
                />
            )}
        </div>
    );
}

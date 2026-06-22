"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createBundle, updateBundle } from "@/lib/shop";
import { formatTaka } from "@/lib/shopMeta";
import type { ShopBundle, ShopLevel, ShopProductCard } from "@/types/shop";

interface Option { id: number; label: string }

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    bundle?: ShopBundle | null;
    levels: ShopLevel[];
    subjects: Option[];
    products: ShopProductCard[];
}

export default function ShopBundleForm({ isOpen, onClose, onSaved, bundle, levels, subjects, products }: Props) {
    const editing = !!bundle;
    const [f, setF] = useState({
        title: bundle?.title ?? "",
        description: bundle?.description ?? "",
        audience: bundle?.audience ?? "GENERAL",
        accessMode: bundle?.accessMode ?? "ONLINE",
        levelId: bundle?.levelId ? String(bundle.levelId) : "",
        subjectId: bundle?.subjectId ? String(bundle.subjectId) : "",
        price: String(bundle?.price ?? ""),
        status: bundle?.status ?? "DRAFT",
    });
    const [productIds, setProductIds] = useState<number[]>(bundle?.products.map((p) => p.id) ?? []);
    const [loading, setLoading] = useState(false);
    const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
    const toggle = (id: number) => setProductIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!f.title.trim()) return toast.error("Title is required.");
        if (productIds.length === 0) return toast.error("Add at least one product to the bundle.");
        setLoading(true);
        const payload: any = {
            title: f.title.trim(),
            description: f.description.trim(),
            audience: f.audience,
            accessMode: f.accessMode,
            levelId: f.levelId ? Number(f.levelId) : null,
            subjectId: f.subjectId ? Number(f.subjectId) : null,
            price: Number(f.price) || 0,
            status: f.status,
            productIds,
        };
        try {
            if (editing) await updateBundle(bundle!.id, payload);
            else await createBundle(payload);
            toast.success(editing ? "Bundle updated." : "Bundle created.");
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Save failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editing ? "Edit bundle" : "New bundle"} size="lg">
            <form onSubmit={submit} className="p-1">
                <Input label="Title" value={f.title} onChange={(e) => set("title", e.target.value)} required />

                <div className="mb-4">
                    <label className="block mb-1 font-semibold text-gray-700">Description</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select label="Audience" value={f.audience} onChange={(e) => set("audience", e.target.value)}
                        options={[{ value: "GENERAL", label: "General (students)" }, { value: "TEACHER_COACHING", label: "Teacher / coaching" }]} />
                    <Select label="Access mode" value={f.accessMode} onChange={(e) => set("accessMode", e.target.value)}
                        options={[{ value: "ONLINE", label: "View online" }, { value: "DOWNLOAD", label: "Downloadable" }]} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Select label="Level" value={f.levelId} onChange={(e) => set("levelId", e.target.value)}
                        options={[{ value: "", label: "— none —" }, ...levels.map((l) => ({ value: String(l.id), label: l.name }))]} />
                    <Select label="Subject" value={f.subjectId} onChange={(e) => set("subjectId", e.target.value)}
                        options={[{ value: "", label: "— none —" }, ...subjects.map((s) => ({ value: String(s.id), label: s.label }))]} />
                    <Input label="Price (৳)" type="number" value={f.price} onChange={(e) => set("price", e.target.value)} />
                </div>

                <Select label="Status" value={f.status} onChange={(e) => set("status", e.target.value)}
                    options={[{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }]} />

                {f.accessMode === "DOWNLOAD" && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                        Downloadable bundles only grant downloads for worksheet / drill sheet / recall-card products, to teacher & coaching accounts.
                    </p>
                )}

                <div className="mb-4">
                    <label className="block mb-2 font-semibold text-gray-700">Products in this bundle ({productIds.length})</label>
                    <div className="border border-gray-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-gray-100">
                        {products.map((p) => (
                            <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                                <input type="checkbox" checked={productIds.includes(p.id)} onChange={() => toggle(p.id)} />
                                <span className="flex-1 text-gray-800">{p.title}</span>
                                <span className="text-gray-400 text-xs">{formatTaka(p.price)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>{editing ? "Save changes" : "Create bundle"}</Button>
                </div>
            </form>
        </Modal>
    );
}

"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { PRODUCT_TYPE_META } from "@/lib/shopMeta";
import { createProduct, updateProduct } from "@/lib/shop";
import type { ShopProductCard, ShopLevel } from "@/types/shop";

interface Option { id: number; label: string }

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    product?: ShopProductCard | null;
    levels: ShopLevel[];
    subjects: Option[];
    chapters: Option[];
}

const TYPE_OPTIONS = Object.entries(PRODUCT_TYPE_META).map(([value, m]) => ({ value, label: m.label }));

export default function ShopProductForm({ isOpen, onClose, onSaved, product, levels, subjects, chapters }: Props) {
    const editing = !!product;
    const [f, setF] = useState({
        title: product?.title ?? "",
        description: product?.description ?? "",
        type: product?.type ?? "NOTES",
        format: product?.format ?? "PDF",
        price: String(product?.price ?? ""),
        levelId: product?.levelId ? String(product.levelId) : "",
        subjectId: product?.subjectId ? String(product.subjectId) : "",
        chapterId: product?.chapterId ? String(product.chapterId) : "",
        status: product?.status ?? "DRAFT",
        featured: product?.featured ?? false,
        preview: product?.preview ?? "",
        html: "",
        fileId: "",
        pageCount: "",
    });
    const [loading, setLoading] = useState(false);
    const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!f.title.trim()) return toast.error("Title is required.");
        setLoading(true);

        const payload: any = {
            title: f.title.trim(),
            description: f.description.trim(),
            type: f.type,
            format: f.format,
            price: Number(f.price) || 0,
            levelId: f.levelId ? Number(f.levelId) : null,
            subjectId: f.subjectId ? Number(f.subjectId) : null,
            chapterId: f.chapterId ? Number(f.chapterId) : null,
            status: f.status,
            featured: f.featured,
            preview: f.preview.trim(),
        };
        // only send content if the admin actually entered some (avoids wiping on edit)
        if (f.format === "INTERACTIVE" && f.html.trim()) payload.content = { html: f.html };
        if (f.format === "PDF" && f.fileId.trim()) payload.content = { fileId: f.fileId.trim(), pageCount: Number(f.pageCount) || 0 };

        try {
            if (editing) await updateProduct(product!.id, payload);
            else await createProduct(payload);
            toast.success(editing ? "Product updated." : "Product created.");
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Save failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editing ? "Edit product" : "New product"} size="lg">
            <form onSubmit={submit} className="p-1">
                <Input label="Title" value={f.title} onChange={(e) => set("title", e.target.value)} required />

                <div className="mb-4">
                    <label className="block mb-1 font-semibold text-gray-700">Description</label>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={2}
                        value={f.description}
                        onChange={(e) => set("description", e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select label="Type" value={f.type} onChange={(e) => set("type", e.target.value)} options={TYPE_OPTIONS} />
                    <Select label="Format" value={f.format} onChange={(e) => set("format", e.target.value)}
                        options={[{ value: "PDF", label: "PDF" }, { value: "INTERACTIVE", label: "Interactive" }]} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Select label="Level" value={f.levelId} onChange={(e) => set("levelId", e.target.value)}
                        options={[{ value: "", label: "— none —" }, ...levels.map((l) => ({ value: String(l.id), label: l.name }))]} />
                    <Select label="Subject" value={f.subjectId} onChange={(e) => set("subjectId", e.target.value)}
                        options={[{ value: "", label: "— none —" }, ...subjects.map((s) => ({ value: String(s.id), label: s.label }))]} />
                    <Select label="Chapter" value={f.chapterId} onChange={(e) => set("chapterId", e.target.value)}
                        options={[{ value: "", label: "— none —" }, ...chapters.map((c) => ({ value: String(c.id), label: c.label }))]} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Price (৳)" type="number" value={f.price} onChange={(e) => set("price", e.target.value)} />
                    <Select label="Status" value={f.status} onChange={(e) => set("status", e.target.value)}
                        options={[{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }]} />
                </div>

                <label className="flex items-center gap-2 mb-4 text-gray-700">
                    <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />
                    Featured (show on shop home & featured row)
                </label>

                <div className="mb-4">
                    <label className="block mb-1 font-semibold text-gray-700">Preview text</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={2} value={f.preview} onChange={(e) => set("preview", e.target.value)} />
                </div>

                {f.format === "INTERACTIVE" ? (
                    <div className="mb-4">
                        <label className="block mb-1 font-semibold text-gray-700">Content (HTML)</label>
                        <textarea className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={4} placeholder={editing ? "Leave blank to keep existing content" : "<h2>…</h2>"}
                            value={f.html} onChange={(e) => set("html", e.target.value)} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="File id" placeholder={editing ? "Leave blank to keep" : "demo_file_id"} value={f.fileId} onChange={(e) => set("fileId", e.target.value)} />
                        <Input label="Page count" type="number" value={f.pageCount} onChange={(e) => set("pageCount", e.target.value)} />
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>{editing ? "Save changes" : "Create product"}</Button>
                </div>
            </form>
        </Modal>
    );
}

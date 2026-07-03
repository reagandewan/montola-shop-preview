"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { getAdminNotices, createNotice, updateNotice, deleteNotice, Notice } from "@/lib/notices";

const TYPE_STYLE: Record<string, string> = {
    INFO: "bg-blue-50 text-blue-700",
    IMPORTANT: "bg-primary-50 text-primary-700",
    URGENT: "bg-rose-50 text-rose-700",
};

function NoticeForm({ notice, onClose, onSaved }: { notice: Notice | null; onClose: () => void; onSaved: () => void }) {
    const editing = !!notice;
    const [f, setF] = useState({
        title: notice?.title ?? "",
        message: notice?.message ?? "",
        type: notice?.type ?? "INFO",
        link: notice?.link ?? "",
        active: notice?.active ?? true,
    });
    const [loading, setLoading] = useState(false);
    const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!f.title.trim()) return toast.error("Title is required.");
        setLoading(true);
        try {
            if (editing) await updateNotice(notice!.id, f);
            else await createNotice(f);
            toast.success(editing ? "Notice updated." : "Notice created.");
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Save failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen onClose={onClose} title={editing ? "Edit notice" : "New notice"} size="md">
            <form onSubmit={submit} className="p-1">
                <Input label="Title" value={f.title} onChange={(e) => set("title", e.target.value)} required />
                <div className="mb-4">
                    <label className="block mb-1 font-semibold text-gray-700">Message</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Select label="Type" value={f.type} onChange={(e) => set("type", e.target.value)}
                        options={[{ value: "INFO", label: "Info" }, { value: "IMPORTANT", label: "Important" }, { value: "URGENT", label: "Urgent" }]} />
                    <Input label="Link (optional)" placeholder="/shop or /classes" value={f.link} onChange={(e) => set("link", e.target.value)} />
                </div>
                <label className="flex items-center gap-2 mb-5 text-gray-700">
                    <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
                    Active (shown on the homepage)
                </label>
                <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>{editing ? "Save" : "Create"}</Button>
                </div>
            </form>
        </Modal>
    );
}

export default function AdminNoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Notice | null>(null);

    const load = () => {
        setLoading(true);
        getAdminNotices().then(setNotices).catch(() => setNotices([])).finally(() => setLoading(false));
    };
    useEffect(load, []);

    const toggleActive = async (n: Notice) => {
        try { await updateNotice(n.id, { active: !n.active }); load(); }
        catch { toast.error("Update failed."); }
    };
    const remove = async (n: Notice) => {
        if (!confirm(`Delete "${n.title}"?`)) return;
        try { await deleteNotice(n.id); toast.success("Notice deleted."); load(); }
        catch { toast.error("Delete failed."); }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
                    <p className="text-gray-500 text-sm">{notices.filter((n) => n.active).length} active · {notices.length} total. Active notices appear on the homepage.</p>
                </div>
                <button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition">
                    + New notice
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading…</p>
            ) : notices.length === 0 ? (
                <p className="text-gray-500">No notices yet.</p>
            ) : (
                <div className="space-y-3">
                    {notices.map((n) => (
                        <div key={n.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${TYPE_STYLE[n.type]}`}>{n.type}</span>
                                    {!n.active && <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Hidden</span>}
                                </div>
                                <p className="font-semibold text-gray-900">{n.title}</p>
                                <p className="text-sm text-gray-500 line-clamp-1">{n.message}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                                <button onClick={() => toggleActive(n)} className={n.active ? "text-gray-500 hover:underline" : "text-primary-600 hover:underline"}>
                                    {n.active ? "Hide" : "Show"}
                                </button>
                                <button onClick={() => { setEditing(n); setFormOpen(true); }} className="text-primary-600 hover:underline">Edit</button>
                                <button onClick={() => remove(n)} className="text-rose-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {formOpen && (
                <NoticeForm key={editing?.id ?? "new"} notice={editing} onClose={() => setFormOpen(false)} onSaved={load} />
            )}
        </div>
    );
}

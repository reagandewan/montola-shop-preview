"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    getAllShopPayments,
    verifyShopPayment,
    rejectShopPayment,
    AdminShopPayment,
} from "@/lib/shop";

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    VERIFIED: "bg-primary-50 text-primary-700 border-primary-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AdminShopPaymentsPage() {
    const [payments, setPayments] = useState<AdminShopPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = () => {
        setLoading(true);
        getAllShopPayments()
            .then(setPayments)
            .catch(() => setPayments([]))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const act = async (id: number, action: "verify" | "reject") => {
        setBusyId(id);
        try {
            if (action === "verify") {
                await verifyShopPayment(id);
                toast.success("Payment verified — buyer now has access.");
            } else {
                await rejectShopPayment(id);
                toast.info("Payment rejected.");
            }
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Action failed.");
        } finally {
            setBusyId(null);
        }
    };

    const pendingCount = payments.filter((p) => p.status === "PENDING").length;

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Shop orders</h1>
            <p className="text-gray-500 mb-6 text-sm">
                {pendingCount} pending · {payments.length} total. Verifying grants the buyer access.
            </p>

            {loading ? (
                <p className="text-gray-500">Loading…</p>
            ) : payments.length === 0 ? (
                <p className="text-gray-500">No shop orders yet.</p>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Buyer</th>
                                <th className="px-4 py-3 font-medium">Item</th>
                                <th className="px-4 py-3 font-medium">Amount</th>
                                <th className="px-4 py-3 font-medium">Method</th>
                                <th className="px-4 py-3 font-medium">Txn ID</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3 text-gray-800">{p.userName}</td>
                                    <td className="px-4 py-3 text-gray-800">
                                        {p.itemTitle}
                                        <span className="ml-2 text-[11px] text-gray-400">{p.bundleId ? "bundle" : "product"}</span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">৳ {p.amount}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.paymentMethod}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.transactionId}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[p.status]}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {p.status === "PENDING" ? (
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => act(p.id, "verify")}
                                                    disabled={busyId === p.id}
                                                    className="text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => act(p.id, "reject")}
                                                    disabled={busyId === p.id}
                                                    className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

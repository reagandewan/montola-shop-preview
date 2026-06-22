"use client";

import { useEffect, useState } from "react";
import { getUnverifiedPayments } from "@/lib/admin";
import { PaymentResponseDto } from "@/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import PaymentVerification from "@/components/admin/PaymentVerification";
import { toast } from "react-toastify";
import { HiArrowLeft } from "react-icons/hi";
import { useRouter } from "next/navigation";

export default function UnverifiedPaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await getUnverifiedPayments();
            setPayments(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load unverified payments");
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<PaymentResponseDto>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
        },
        {
            key: "userName",
            header: "User",
            sortable: true,
            render: (item) => (
                <span className="text-gray-800">
                    {item.userName || `User ${item.userId}`}
                </span>
            ),
        },
        {
            key: "chapterTitle",
            header: "Chapter",
            sortable: true,
            render: (item) => (
                <span className="text-gray-700">
                    {item.chapterTitle || `Chapter ${item.chapterId}`}
                </span>
            ),
        },
        {
            key: "amount",
            header: "Amount",
            sortable: true,
            render: (item) => (
                <span className="font-semibold text-gray-900">
                    ৳{item.amount || 0}
                </span>
            ),
        },
        {
            key: "paymentMethod",
            header: "Method",
            render: (item) => (
                <span className="text-gray-600">
                    {item.paymentMethod || "—"}
                </span>
            ),
        },
        {
            key: "transactionId",
            header: "Transaction ID",
            render: (item) => (
                <span className="text-gray-600 text-xs font-mono">
                    {item.transactionId || "—"}
                </span>
            ),
        },
        {
            key: "senderNumber",
            header: "Sender Number",
            render: (item) => (
                <span className="text-gray-600">
                    {item.senderNumber || "—"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            render: (item) => (
                <PaymentVerification
                    payment={item}
                    onVerified={fetchPayments}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push("/admin/payments")}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Unverified Payments
                    </h1>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    These payments are pending verification. Review and verify each payment to complete the enrollment process.
                </p>
            </div>

            <DataTable
                data={payments}
                columns={columns}
                keyExtractor={(item) => item.id}
                loading={loading}
                emptyMessage="No unverified payments found."
            />
        </div>
    );
}

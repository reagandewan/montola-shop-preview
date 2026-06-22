"use client";

import { useEffect, useState } from "react";
import { getAllPayments } from "@/lib/admin";
import { PaymentResponseDto, PaymentStatus } from "@/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import PaymentVerification from "@/components/admin/PaymentVerification";
import { toast } from "react-toastify";

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | "">("");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await getAllPayments();
            setPayments(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: PaymentStatus) => {
        const badges = {
            [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800",
            [PaymentStatus.VERIFIED]: "bg-green-100 text-green-800",
            [PaymentStatus.REJECTED]: "bg-red-100 text-red-800",
        };
        return badges[status] || badges[PaymentStatus.PENDING];
    };

    const filteredPayments = filterStatus
        ? payments.filter((p) => p.status === filterStatus)
        : payments;

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
            key: "status",
            header: "Status",
            sortable: true,
            render: (item) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                        item.status
                    )}`}
                >
                    {item.status}
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
            key: "verifiedAt",
            header: "Verified At",
            render: (item) => (
                <span className="text-gray-600 text-sm">
                    {item.verifiedAt
                        ? new Date(item.verifiedAt).toLocaleDateString()
                        : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            render: (item) => (
                <div className="flex items-center space-x-2">
                    <PaymentVerification
                        payment={item}
                        onVerified={fetchPayments}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">
                    Payment Management
                </h1>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">
                        Filter by Status:
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) =>
                            setFilterStatus(
                                e.target.value === ""
                                    ? ""
                                    : (e.target.value as PaymentStatus)
                            )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value={PaymentStatus.PENDING}>Pending</option>
                        <option value={PaymentStatus.VERIFIED}>Verified</option>
                        <option value={PaymentStatus.REJECTED}>Rejected</option>
                    </select>
                </div>
            </div>

            <DataTable
                data={filteredPayments}
                columns={columns}
                keyExtractor={(item) => item.id}
                loading={loading}
                emptyMessage="No payments found."
            />
        </div>
    );
}

"use client";

import { PaymentResponseDto, PaymentStatus } from "@/types";
import { verifyPayment, rejectPayment } from "@/lib/admin";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toast } from "react-toastify";
import { useState } from "react";

interface PaymentVerificationProps {
    payment: PaymentResponseDto;
    onVerified: () => void;
}

export default function PaymentVerification({
    payment,
    onVerified,
}: PaymentVerificationProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        if (!confirm("Are you sure you want to verify this payment?")) {
            return;
        }

        setIsVerifying(true);
        try {
            await verifyPayment(payment.id);
            toast.success("Payment verified successfully");
            setIsModalOpen(false);
            onVerified();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to verify payment");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to reject this payment?")) {
            return;
        }

        setIsVerifying(true);
        try {
            await rejectPayment(payment.id);
            toast.success("Payment rejected");
            setIsModalOpen(false);
            onVerified();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to reject payment");
        } finally {
            setIsVerifying(false);
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

    return (
        <>
            {payment.status === PaymentStatus.PENDING && (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                >
                    Verify
                </Button>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Payment Verification"
                size="md"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                Payment ID
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {payment.id}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                Status
                            </dt>
                            <dd className="mt-1">
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                                        payment.status
                                    )}`}
                                >
                                    {payment.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                User
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {payment.userName || `User ${payment.userId}`}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                Chapter
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {payment.chapterTitle || `Chapter ${payment.chapterId}`}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                Amount
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 font-semibold">
                                ৳{payment.amount || 0}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                Payment Method
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {payment.paymentMethod || "—"}
                            </dd>
                        </div>
                        {payment.transactionId && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Transaction ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {payment.transactionId}
                                </dd>
                            </div>
                        )}
                        {payment.senderNumber && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Sender Number
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {payment.senderNumber}
                                </dd>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isVerifying}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleReject}
                            isLoading={isVerifying}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleVerify}
                            isLoading={isVerifying}
                        >
                            Verify Payment
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

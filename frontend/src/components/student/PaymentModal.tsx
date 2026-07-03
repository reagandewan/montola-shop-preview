"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { PaymentRequestDto } from "@/types";
import { toast } from "react-toastify";
import { useI18n } from "@/contexts/I18nProvider";
import schoolInfo from "@/config/schoolInfo.json";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    chapterId: number;
    chapterTitle: string;
    amount: number;
    onSubmit: (data: PaymentRequestDto) => Promise<void>;
}

export default function PaymentModal({
    isOpen,
    onClose,
    chapterId,
    chapterTitle,
    amount,
    onSubmit,
}: PaymentModalProps) {
    const { t } = useI18n();
    const [formData, setFormData] = useState<Omit<PaymentRequestDto, "chapterId" | "amount">>({
        transactionId: "",
        senderNumber: "",
        paymentMethod: "BKASH",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.senderNumber) newErrors.senderNumber = t("paymentModal.errorSenderRequired");
        if (!formData.transactionId) newErrors.transactionId = t("paymentModal.errorTxnRequired");

        // Simple BD phone number validation
        if (formData.senderNumber && !/^(01)[3-9][0-9]{8}$/.test(formData.senderNumber)) {
            newErrors.senderNumber = t("paymentModal.errorInvalidFormat");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit({
                chapterId,
                amount,
                ...formData,
            });
            // Success state handling is left to the parent's onSubmit implementation
        } catch (err: any) {
            console.error("Payment submission failed:", err);
            toast.error(err.response?.data?.message || t("chapterPublic.paymentFailed"));
        } finally {
            setLoading(false);
        }
    };

    const paymentMethods = [
        { value: "BKASH", label: "bKash" },
        // { value: "NAGAD", label: "Nagad" }, // TODO: Add this later on
        // { value: "ROCKET", label: "Rocket" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t("paymentModal.title")} size="md">
            <div className="space-y-6 p-1">
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                    <p className="text-sm text-primary-700 font-medium mb-1">{t("paymentModal.chapterHeader")}</p>
                    <p className="text-lg font-bold text-primary-900">{chapterTitle}</p>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t("paymentModal.totalAmount")}</span>
                        <span className="text-xl font-bold text-primary-600">৳ {amount}</span>
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-2">
                    <p className="text-xs font-bold text-yellow-800 uppercase tracking-widest">{t("paymentModal.howToPayTitle")}</p>
                    <p className="text-sm text-yellow-900"
                        dangerouslySetInnerHTML={{ __html: t("paymentModal.howToPayStep1", { amount, number: schoolInfo.paymentNumbers.bkashMerchant }) }}
                    />
                    <p className="text-sm text-yellow-900"
                        dangerouslySetInnerHTML={{ __html: t("paymentModal.howToPayStep2") }}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label={t("paymentModal.paymentMethod")}
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        options={paymentMethods}
                        required
                    />

                    <Input
                        label={t("paymentModal.senderNumber")}
                        placeholder={t("paymentModal.senderNumberPlaceholder")}
                        value={formData.senderNumber}
                        onChange={(e) => setFormData({ ...formData, senderNumber: e.target.value })}
                        error={errors.senderNumber}
                        required
                    />

                    <Input
                        label={t("paymentModal.transactionId")}
                        placeholder={t("paymentModal.transactionIdPlaceholder")}
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                        error={errors.transactionId}
                        required
                    />

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            {t("paymentModal.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            isLoading={loading}
                        >
                            {t("paymentModal.submit")}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";
import { useI18n } from "@/contexts/I18nProvider";
import schoolInfo from "@/config/schoolInfo.json";
import { submitShopPayment } from "@/lib/shop";

interface ShopCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    amount: number;
    productId?: number;
    bundleId?: number;
    onSuccess: () => void;
}

export default function ShopCheckoutModal({
    isOpen,
    onClose,
    title,
    amount,
    productId,
    bundleId,
    onSuccess,
}: ShopCheckoutModalProps) {
    const { t } = useI18n();
    const [form, setForm] = useState({ senderNumber: "", transactionId: "", paymentMethod: "BKASH" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.senderNumber) e.senderNumber = t("paymentModal.errorSenderRequired");
        else if (!/^(01)[3-9][0-9]{8}$/.test(form.senderNumber)) e.senderNumber = t("paymentModal.errorInvalidFormat");
        if (!form.transactionId) e.transactionId = t("paymentModal.errorTxnRequired");
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await submitShopPayment({ productId, bundleId, amount, ...form });
            toast.success("Payment submitted — you'll get access once an admin verifies it.");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Payment submission failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complete your purchase" size="md">
            <div className="space-y-6 p-1">
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                    <p className="text-sm text-primary-700 font-medium mb-1">You are buying</p>
                    <p className="text-lg font-bold text-primary-900">{title}</p>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t("paymentModal.totalAmount")}</span>
                        <span className="text-xl font-black text-primary-600">৳ {amount}</span>
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-2">
                    <p className="text-xs font-bold text-yellow-800 uppercase tracking-widest">{t("paymentModal.howToPayTitle")}</p>
                    <p className="text-sm text-yellow-900"
                        dangerouslySetInnerHTML={{ __html: t("paymentModal.howToPayStep1", { amount, number: schoolInfo.paymentNumbers.bkashMerchant }) }}
                    />
                    <p className="text-sm text-yellow-900" dangerouslySetInnerHTML={{ __html: t("paymentModal.howToPayStep2") }} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label={t("paymentModal.paymentMethod")}
                        value={form.paymentMethod}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        options={[{ value: "BKASH", label: "bKash" }, { value: "NAGAD", label: "Nagad" }]}
                        required
                    />
                    <Input
                        label={t("paymentModal.senderNumber")}
                        placeholder={t("paymentModal.senderNumberPlaceholder")}
                        value={form.senderNumber}
                        onChange={(e) => setForm({ ...form, senderNumber: e.target.value })}
                        error={errors.senderNumber}
                        required
                    />
                    <Input
                        label={t("paymentModal.transactionId")}
                        placeholder={t("paymentModal.transactionIdPlaceholder")}
                        value={form.transactionId}
                        onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                        error={errors.transactionId}
                        required
                    />
                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
                            {t("paymentModal.cancel")}
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>
                            {t("paymentModal.submit")}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

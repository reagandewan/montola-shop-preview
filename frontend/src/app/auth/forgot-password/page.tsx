"use client";

import { Alert } from "@/components/Alert";
import { useI18n } from "@/contexts/I18nProvider";
import { requestPasswordReset } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { t } = useI18n();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!email) {
            setError(t("form.user.email") + " is required");
            return;
        }

        setLoading(true);

        try {
            const res = await requestPasswordReset(email);

            if (res.status === 200) {
                setSuccess(true);
                toast.success(t("auth.resetLinkSentCheckEmail"));
            }

        } catch (err: any) {

            console.log("Error response:", err?.response?.data);

            const errorData = err?.response?.data;
            const status = errorData?.status;

            if (status === 409) {
                setError(t("auth.userNotFound"));

            } else {
                setError(t("messages.error"));
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg p-8 rounded-xl w-96"
            >
                <h1 className="text-2xl font-bold mb-6">{t("auth.forgotPassword")}</h1>

                {error && <Alert type="error" message={error} />}

                {success && (
                    <Alert
                        type="success"
                        message={t("auth.resetLinkSentCheckEmail")}
                    />
                )}

                {!success && (
                    <>
                        <div className="mb-4">
                            <label className="block mb-1 font-semibold">
                                {t("form.user.email")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder={t("form.user.emailPlaceholder")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-2 rounded text-white ${
                                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {loading ? t("messages.loading") : t("auth.sendResetLink")}
                        </button>
                    </>
                )}

                {/* Go back */}
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => router.push("/auth/login")}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        {t("auth.backToLogin")}
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, requestPasswordReset } from "@/lib/auth";
import { useI18n } from "@/contexts/I18nProvider";
import { Alert } from "@/components/Alert";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [linkResent, setLinkResent] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useI18n();

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
        return <Alert type="error" message={t("auth.invalidResetLink")} />;
    }

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!newPassword.match(/^(?=.*[A-Za-z])(?=.*\d).{5,}$/)) {
            newErrors.newPassword = t("auth.passwordPolicy");
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = t("auth.passwordMismatch");
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setTokenExpired(false);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email, token, newPassword);
            toast.success(t("auth.passwordResetSuccess"));

            setTimeout(() => router.push("/auth/login"), 2000);

        } catch (err: any) {
            console.error(err);
            const data = err?.response?.data;

            if (data?.status === 401) {
                // token expired
                setErrors({ general: t("auth.resetTokenExpired") });

            } else if(data?.status === 409) {
                setErrors({ general: t("auth.invalidResetLink") });

            } else {
                setErrors({ general: t("auth.resetFailed") });
            }

            setTokenExpired(true);

        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await requestPasswordReset(email);
            toast.success(t("auth.resetResent"));

            setLinkResent(true);
            setErrors({})

        } catch (err) {
            toast.error(t("auth.resetResendFailed"));

        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white shadow-lg p-8 rounded-xl w-96" onSubmit={handleSubmit}>
                <h1 className="text-2xl font-bold mb-6">{t("auth.resetPassword")}</h1>

                {errors.general && <Alert type="error" message={errors.general} />}

                {!tokenExpired ? (
                    <>
                        {/* New Password */}
                        <label className="block mb-1 font-semibold">
                            {t("form.user.newPassword")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            placeholder={t("form.user.passwordPlaceholder")}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                            required
                        />
                        {errors.newPassword && <p className="text-red-500 mb-2">{errors.newPassword}</p>}

                        {/* Confirm Password */}
                        <label className="block mb-1 font-semibold">
                            {t("form.user.confirmPassword")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            placeholder={t("form.user.confirmPasswordPlaceholder")}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                            required
                        />
                        {errors.confirmPassword && <p className="text-red-500 mb-2">{errors.confirmPassword}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-2 rounded text-white ${
                                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {loading ? t("messages.loading") : t("auth.resetPassword")}
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        {!linkResent ? (
                            <>
                                <p className="text-gray-700 text-sm text-center">{t("auth.resetTokenExpiredInfo")}</p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    className={`w-full p-2 rounded text-white ${
                                        resendLoading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {resendLoading ? t("messages.loading") : t("auth.resendReset")}
                                </button>
                            </>
                        ) : (
                            <Alert
                                type="success"
                                message={t("auth.resetLinkSentCheckEmail")}
                            />
                        )}
                    </div>
                )}

            </form>
        </div>
    );
}
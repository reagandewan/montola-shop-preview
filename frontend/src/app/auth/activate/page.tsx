"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { activateAccount, resendActivationToken } from "@/lib/auth";
import { useI18n }from "@/contexts/I18nProvider"
import { toast } from "react-toastify";
import { Alert } from "@/components/Alert";

export default function ActivatePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useI18n();

    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    const [message, setMessage] = useState(t("auth.activating"));
    const [alertType, setAlertType] = useState<"info" | "success" | "error">("info");
    const [showResend, setShowResend] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => {
        const activate = async () => {
            try {
                await activateAccount(email, token);

                setAlertType("success");
                setMessage(t("auth.activationSuccess"));
                toast.success(t("auth.activationSuccess"));

                setTimeout(() => router.push("/auth/login"), 2000);

            } catch (err: any) {
                console.log("Error response:", err?.response?.data);

                const errorData = err?.response?.data;
                const status = errorData?.status;
                const msg = errorData?.message;

                setAlertType("error");

                if (status === 400 && msg === "Verification token expired") {
                    setMessage(t("auth.activationExpired"));
                    setShowResend(true);

                } else if (status === 409 && msg === "User is already verified") {
                    setAlertType("success");
                    setMessage(t("auth.activationAlreadyDone"));
                    toast.info(t("auth.activationAlreadyDone"));

                    setTimeout(() => router.push("/auth/login"), 2000);

                } else if (status === 409 && msg === "No verification token found") {
                    setMessage(t("auth.activationFailed"));

                    setShowRegister(true);

                } else {
                    setMessage(msg || t("auth.activationFailed"));
                }

            }
        };
        activate();
    }, [email, token, router]);

    const handleResend = async () => {
        try {
            await resendActivationToken(email);
            toast.success(t("auth.resendSuccess"));
            router.push("/auth/check-email?email=" + encodeURIComponent(email));

        } catch (err) {
            setAlertType("error");
            setMessage(t("auth.resendFailed"));
            toast.error(t("auth.resendFailed"));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">

                <Alert type={alertType} message={message} />

                {showResend && (
                    <button
                        onClick={handleResend}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {t("auth.resendActivation")}
                    </button>
                )}

                {showRegister && (
                    <button
                        onClick={() => router.push("/auth/register")}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        {t("auth.goToRegister")}
                    </button>
                )}

            </div>
        </div>
    );
}
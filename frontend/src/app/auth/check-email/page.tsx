"use client";
import { useSearchParams, useRouter } from "next/navigation";
import {useI18n} from "@/contexts/I18nProvider";

export default function CheckEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useI18n();

    const email = searchParams.get("email");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">

                <h1 className="text-2xl font-bold mb-4">{t("auth.verifyEmailTitle")}</h1>

                <p className="mb-4">
                    {t("auth.verifyEmailMessage", { email })}
                </p>

                <button
                    onClick={() => router.push("/auth/login")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {t("auth.goToLogin")}
                </button>
            </div>
        </div>
    );
}

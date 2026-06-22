"use client";

import { Alert } from "@/components/Alert";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nProvider";
import { login } from "@/lib/auth";
import { getHighestPriorityRole, getRouteForRole } from "@/lib/roles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { t } = useI18n();
    const { setAuthTokens } = useAuth();

    // simple validation before submit
    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = t("form.user.email") + " is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t("form.user.email") + " is invalid";
        }

        if (!password) {
            newErrors.password = t("form.user.password") + " is required";

        } else if (!/^(?=.*[A-Za-z])(?=.*\d).{5,}$/.test(password)) {
            newErrors.password = t("auth.passwordPolicy");
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const res = await login(email, password);

            // The API returns AuthResponse with accessToken, refreshToken, email, fullName, roles
            await setAuthTokens(res.data);

            // Role-based redirect after login using centralized helpers
            const roles: string[] = Array.isArray(res.data?.roles) ? res.data.roles : [];
            const primaryRole = getHighestPriorityRole(roles);
            const targetPath = getRouteForRole(primaryRole || undefined);

            toast.success(t("auth.loginSuccess"));
            router.push(targetPath);

        } catch (err) {
            console.error(err);
            setErrors({ general: t("auth.invalidCredentials") });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg p-8 rounded-xl w-96 flex flex-col items-center"
            >
                <Link href="/">
                    <img
                        src="/montola-logo.png"
                        alt="Montola School Logo"
                        className="w-20 h-20 rounded-2xl object-cover shadow-md mb-6 hover:scale-105 transition-transform"
                    />
                </Link>
                <h1 className="text-2xl font-bold mb-6 text-gray-800 self-start">{t("auth.login")}</h1>

                {errors.general && <Alert type="error" message={errors.general} />}

                {/* email */}
                <div className="mb-4 w-full">
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

                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* password */}
                <div className="mb-4 w-full">
                    <label className="block mb-1 font-semibold">
                        {t("form.user.password")} <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="password"
                        placeholder={t("form.user.passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                    />

                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Forgot password link */}
                <div className="text-right mb-4 w-full">
                    <Link href="/auth/forgot-password" className="text-blue-600 text-sm hover:underline">
                        {t("auth.forgotPassword")}
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-2 rounded text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? t("messages.loading") : t("auth.login")}
                </button>
            </form>
        </div>
    );
}

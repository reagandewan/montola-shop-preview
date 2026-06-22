"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nProvider";
import RoleToggle from "@/components/admin/RoleToggle";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { hasRole, isLoading, user, activeRole } = useAuth();
    const { t, lang, switchLang } = useI18n();
    const router = useRouter();

    const isTeacher = () => {
        // Check if user has TEACHER role or is admin/manager with teacher role active
        return hasRole("TEACHER") || ((hasRole("ADMIN") || hasRole("MANAGER")) && activeRole === "TEACHER");
    };

    useEffect(() => {
        // Wait for auth to finish loading
        if (isLoading) return;

        // Redirect if user is not teacher (or admin/manager with teacher role active)
        if (!isTeacher()) {
            router.push("/auth/login");
        }
    }, [isLoading, router, activeRole]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t("messages.loading")}</p>
                </div>
            </div>
        );
    }

    // Don't render content if user is not authorized
    if (!isTeacher()) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Content */}
            <main className="max-w-7xl mx-auto p-4 md:p-6">
                {children}
            </main>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import RoleToggle from "@/components/admin/RoleToggle";
import { HiMenu, HiUser, HiLogout, HiChevronDown, HiViewGrid } from "react-icons/hi";
import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdminOrManager, isLoading, user, removeAuthTokens } = useAuth();
    const { t, lang, switchLang } = useI18n();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        // Wait for auth to finish loading
        if (isLoading) return;

        // Redirect if user is not admin or manager
        if (!isAdminOrManager()) {
            router.push("/auth/login");
        }
    }, [isAdminOrManager, isLoading, router]);

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
    if (!isAdminOrManager()) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar
                isMobileOpen={isMobileMenuOpen}
                onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 md:px-6 py-4">
                        {/* Mobile menu button */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden text-gray-600 hover:text-gray-800"
                            >
                                <HiMenu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{t("admin.dashboard")}</h1>
                            <Link
                                href="/admin"
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-primary-600 transition-all text-sm font-bold"
                            >
                                <HiViewGrid size={18} />
                                Dashboard
                            </Link>
                        </div>

                        <div className="flex items-center space-x-2 md:space-x-4">
                            {/* Role Toggle - only visible if user has multiple roles */}
                            <RoleToggle />

                            {/* Language Switch */}
                            <select
                                value={lang}
                                onChange={(e) => switchLang(e.target.value as "en" | "bn")}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mr-2"
                            >
                                <option value="en">EN</option>
                                <option value="bn">বাংলা</option>
                            </select>

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors border border-gray-100 pr-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white overflow-hidden relative">
                                        <div className="w-full h-full flex items-center justify-center font-black text-xs">
                                            {user ? getInitials(user.fullName) : "??"}
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 hidden lg:block">
                                        {user?.fullName.split(" ")[0]}
                                    </span>
                                    <HiChevronDown className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        {/* Backdrop to close dropdown */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />

                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-2 border-bottom border-gray-100 mb-1">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                                            </div>
                                            <Link
                                                href="/admin/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                            >
                                                <HiUser size={18} />
                                                My Profile
                                            </Link>
                                            <div className="h-px bg-gray-100 my-1" />
                                            <button
                                                onClick={() => {
                                                    removeAuthTokens();
                                                    setIsProfileOpen(false);
                                                }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <HiLogout size={18} />
                                                {t("auth.logout")}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

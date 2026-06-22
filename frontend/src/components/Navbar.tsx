"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nProvider";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HiMenu, HiX, HiChevronDown, HiUser, HiLogout, HiCreditCard } from "react-icons/hi";
import { getHighestPriorityRole } from "@/lib/roles";
import LoadingSpinner from "./LoadingSpinner";
import { useRouter } from "next/navigation";
import { getProfilePicture } from "@/lib/user";
import RoleToggle from "./admin/RoleToggle";

export default function Navbar() {
    const { isLoggedIn, removeAuthTokens, isLoading, user, activeRole } = useAuth();
    const { t, lang, switchLang } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    const fetchAvatar = async () => {
        if (!user?.id || !user.hasProfilePicture) {
            setAvatarUrl(null);
            return;
        }
        try {
            const res = await getProfilePicture(user.id);
            const blob = res.data as Blob;
            if (blob && blob.size > 0) {
                if (avatarUrl) URL.revokeObjectURL(avatarUrl);
                setAvatarUrl(URL.createObjectURL(blob));
            }
        } catch (error) {
            console.error("Navbar: Failed to fetch avatar:", error);
            setAvatarUrl(null);
        }
    };

    useEffect(() => {
        if (isLoggedIn && user?.hasProfilePicture) {
            fetchAvatar();
        } else {
            setAvatarUrl(null);
        }
        return () => {
            if (avatarUrl) URL.revokeObjectURL(avatarUrl);
        };
    }, [isLoggedIn, user?.id, user?.hasProfilePicture]);

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const roles = user?.roles || [];
    const resolvedActiveRole =
        (activeRole && roles.includes(activeRole) && activeRole) ||
        getHighestPriorityRole(roles);

    const isStudent = resolvedActiveRole === "STUDENT";
    const isTeacher = resolvedActiveRole === "TEACHER";

    const getProfileRoute = () => {
        if (isTeacher) return "/teacher/profile";
        if (isStudent) return "/student/profile";
        return "/student/profile";
    };

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const getLinkClass = (href: string, baseClass: string = "") => {
        const activeClass = "text-primary-600 font-extrabold";
        const inactiveClass = "text-gray-800";
        return `${baseClass} ${isActive(href) ? activeClass : inactiveClass} hover:text-primary-500 transition-colors`;
    };

    // Function to render auth buttons
    const renderAuthButtons = () => {
        if (isLoading) {
            return (
                <div className="px-4 py-2 bg-gray-50 text-gray-400 rounded-lg flex items-center gap-2 border border-gray-100">
                    <LoadingSpinner size="sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verifying</span>
                </div>
            );
        }

        if (isLoggedIn && user) {
            return (
                <div className="relative">
                    <button
                        onClick={toggleProfile}
                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors border border-gray-100 pr-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white overflow-hidden relative">
                            {user.hasProfilePicture && avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={user.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black">
                                    {getInitials(user.fullName)}
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-bold text-gray-700 hidden lg:block">{user.fullName.split(" ")[0]}</span>
                        <HiChevronDown className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />

                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-bottom border-gray-100 mb-1">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                </div>
                                <Link
                                    href={getProfileRoute()}
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                >
                                    <HiUser size={18} />
                                    {t("nav.myProfile")}
                                </Link>
                                {isStudent && (
                                    <Link
                                        href="/student/dashboard"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                    >
                                        <HiCreditCard size={18} />
                                        {t("nav.payments")}
                                    </Link>
                                )}
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
            );
        }

        return (
            <>
                <Link
                    href="/auth/login"
                    className="px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition"
                >
                    {t("auth.login")}
                </Link>
                <Link
                    href="/auth/register"
                    className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 transition"
                >
                    {t("auth.register")}
                </Link>
            </>
        );
    };

    // Function to render mobile auth buttons
    const renderMobileAuthButtons = () => {
        if (isLoading) {
            return (
                <div className="w-full px-4 py-3 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center gap-2 border border-gray-100">
                    <LoadingSpinner size="sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verifying Account</span>
                </div>
            );
        }

        if (isLoggedIn && user) {
            return (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 py-3 bg-gray-50 rounded-xl mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-black shrink-0 relative overflow-hidden">
                            {user.hasProfilePicture && avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={user.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                getInitials(user.fullName)
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{user.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="px-4 py-2">
                        <RoleToggle />
                    </div>
                    <Link
                        href={getProfileRoute()}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <HiUser size={20} className="text-gray-400" />
                        <span className="font-medium">{t("nav.myProfile")}</span>
                    </Link>
                    {isStudent && (
                        <Link
                            href="/student/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <HiCreditCard size={20} className="text-gray-400" />
                            <span className="font-medium">{t("nav.payments")}</span>
                        </Link>
                    )}
                    <button
                        onClick={() => {
                            removeAuthTokens();
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                    >
                        <HiLogout size={20} />
                        <span className="font-medium">{t("auth.logout")}</span>
                    </button>
                </div>
            );
        }

        return (
            <>
                <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto block px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition"
                >
                    {t("auth.login")}
                </Link>
                <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto block px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 transition"
                >
                    {t("auth.register")}
                </Link>
            </>
        );
    };

    return (
        <nav className="sticky top-0 bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <img
                        src="/montola-logo.png"
                        alt="Montola School Logo"
                        className="w-10 h-10 rounded-lg object-cover shadow-sm border border-gray-100"
                    />
                    <span className="text-2xl font-black text-primary-600 tracking-tight hidden sm:block">
                        Montola School
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex space-x-6 items-center">
                    {/* Common Public Links or Student Links */}
                    {(!isLoggedIn || isStudent) && (
                        <>
                            <Link href="/" className={getLinkClass("/")}>{t("nav.home")}</Link>
                            <Link href="/classes" className={getLinkClass("/classes")}>{t("nav.classes")}</Link>
                            <Link href="/featured-chapters" className={getLinkClass("/featured-chapters")}>{t("nav.featuredChapters")}</Link>
                            <Link href="/free-chapters" className={getLinkClass("/free-chapters")}>{t("nav.freeChapters")}</Link>
                            <Link href="/shop" className={getLinkClass("/shop")}>Shop</Link>
                        </>
                    )}

                    {/* Role-specific Links */}
                    {isLoggedIn && isStudent && (
                        <>
                            <Link href="/student/dashboard" className={getLinkClass("/student/dashboard", "font-medium")}>
                                {t("nav.myDashboard")}
                            </Link>
                        </>
                    )}

                    {isLoggedIn && isTeacher && (
                        <>
                            <Link href="/teacher" className={getLinkClass("/teacher", "font-medium")}>
                                {t("nav.myDashboard")}
                            </Link>
                            <Link href="/teacher/assigned-chapters" className={getLinkClass("/teacher/assigned-chapters", "font-medium")}>
                                {t("nav.assignedChapters")}
                            </Link>
                        </>
                    )}

                    <RoleToggle />
                    {renderAuthButtons()}

                    <select
                        value={lang}
                        onChange={(e) => switchLang(e.target.value as "en" | "bn")}
                        className="border p-1 rounded ml-4 text-xs font-bold"
                    >
                        <option value="en">EN</option>
                        <option value="bn">বাংলা</option>
                    </select>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
                    <div className="flex flex-col space-y-3">
                        {(!isLoggedIn || isStudent) && (
                            <>
                                <Link href="/" onClick={() => setIsOpen(false)} className={getLinkClass("/", "py-1")}>{t("nav.home")}</Link>
                                <Link href="/classes" onClick={() => setIsOpen(false)} className={getLinkClass("/classes", "py-1")}>{t("nav.classes")}</Link>
                                <Link href="/featured-chapters" onClick={() => setIsOpen(false)} className={getLinkClass("/featured-chapters", "py-1")}>{t("nav.featuredChapters")}</Link>
                                <Link href="/free-chapters" onClick={() => setIsOpen(false)} className={getLinkClass("/free-chapters", "py-1")}>{t("nav.freeChapters")}</Link>
                                <Link href="/shop" onClick={() => setIsOpen(false)} className={getLinkClass("/shop", "py-1")}>Shop</Link>
                            </>
                        )}

                        {isLoggedIn && isStudent && (
                            <>
                                <Link
                                    href="/student/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className={getLinkClass("/student/dashboard", "py-1 font-medium")}
                                >
                                    {t("nav.myDashboard")}
                                </Link>
                                <Link
                                    href="/student/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className={getLinkClass("/student/dashboard", "py-1 font-medium")}
                                >
                                    {t("nav.myChapters")}
                                </Link>
                            </>
                        )}

                        {isLoggedIn && isTeacher && (
                            <>
                                <Link
                                    href="/teacher"
                                    onClick={() => setIsOpen(false)}
                                    className={getLinkClass("/teacher", "py-1 font-medium")}
                                >
                                    {t("nav.myDashboard")}
                                </Link>
                                <Link
                                    href="/teacher/assigned-chapters"
                                    onClick={() => setIsOpen(false)}
                                    className={getLinkClass("/teacher/assigned-chapters", "py-1 font-medium")}
                                >
                                    {t("nav.assignedChapters")}
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                        <select
                            value={lang}
                            onChange={(e) => switchLang(e.target.value as "en" | "bn")}
                            className="w-full border p-2 rounded text-sm font-bold"
                        >
                            <option value="en">EN</option>
                            <option value="bn">বাংলা</option>
                        </select>
                        {renderMobileAuthButtons()}
                    </div>
                </div>
            )}
        </nav>
    );
}
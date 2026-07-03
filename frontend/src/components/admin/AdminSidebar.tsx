"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/contexts/I18nProvider";
import {
    HiHome,
    HiBookOpen,
    HiLibrary,
    HiDocumentText,
    HiCash,
    HiMenu,
    HiX,
    HiStar,
    HiUserGroup,
    HiShoppingCart,
    HiShoppingBag,
    HiCollection,
    HiSpeakerphone
} from "react-icons/hi";

interface NavItem {
    href: string;
    labelKey: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface AdminSidebarProps {
    isMobileOpen: boolean;
    onMobileToggle: () => void;
}

export default function AdminSidebar({ isMobileOpen, onMobileToggle }: AdminSidebarProps) {
    const pathname = usePathname();
    const { t } = useI18n();

    const navItems: NavItem[] = [
        { href: "/admin", labelKey: "admin.nav.dashboardOverview", icon: HiHome },
        { href: "/admin/users", labelKey: "admin.nav.users", icon: HiUserGroup },
        { href: "/admin/classes", labelKey: "admin.nav.classes", icon: HiBookOpen },
        { href: "/admin/subjects", labelKey: "admin.nav.subjects", icon: HiLibrary },
        { href: "/admin/chapters", labelKey: "admin.nav.chapters", icon: HiDocumentText },
        { href: "/admin/featured", labelKey: "admin.nav.featuredChapters", icon: HiStar },
        { href: "/admin/notices", labelKey: "Notices", icon: HiSpeakerphone },
        { href: "/admin/payments", labelKey: "admin.nav.purchaseVerification", icon: HiCash },
        { href: "/admin/shop-products", labelKey: "Shop products", icon: HiShoppingBag },
        { href: "/admin/shop-bundles", labelKey: "Shop bundles", icon: HiCollection },
        { href: "/admin/shop-payments", labelKey: "Shop orders", icon: HiShoppingCart },
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onMobileToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo/Brand with mobile close button */}
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between group">
                        <Link href="/admin" className="flex items-center gap-3">
                            <img
                                src="/montola-logo.png"
                                alt="Montola Logo"
                                className="w-8 h-8 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <h2 className="text-xl font-bold text-primary-600 tracking-tight">{t("admin.brand")}</h2>
                        </Link>
                        <button
                            onClick={onMobileToggle}
                            className="md:hidden text-gray-600 hover:text-gray-800"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href ||
                                (item.href !== "/admin" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => {
                                        // Close mobile menu when clicking a link
                                        if (isMobileOpen) {
                                            onMobileToggle();
                                        }
                                    }}

                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? "bg-primary-500 text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{t(item.labelKey)}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}

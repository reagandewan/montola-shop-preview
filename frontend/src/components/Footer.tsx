"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nProvider";
import { getHighestPriorityRole } from "@/lib/roles";
import schoolInfo from "@/config/schoolInfo.json";

export default function Footer() {
    const { isLoggedIn, user, activeRole } = useAuth();
    const { t } = useI18n();

    const roles = user?.roles || [];
    const resolvedActiveRole =
        (activeRole && roles.includes(activeRole) && activeRole) ||
        getHighestPriorityRole(roles);

    const isStudent = resolvedActiveRole === "STUDENT";
    const isTeacher = resolvedActiveRole === "TEACHER";

    return (
        <footer className="bg-primary-700 text-white py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-5">
                    <div className="flex items-center gap-4">
                        {/* High contrast wrapper for dark backgrounds */}
                        <div className="w-14 h-14 bg-white rounded-full p-2.5 flex items-center justify-center shadow-lg ring-1 ring-white/20 shrink-0">
                            <img
                                src="/montola-logo.png"
                                alt="Montola School Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-none">
                            Montola School
                        </h3>
                    </div>
                    <p className="font-serif italic text-lg text-primary-100/90 leading-relaxed max-w-sm border-l-2 border-primary-400/50 pl-4">
                        {t("footer.description")}
                    </p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-primary-200">
                        {t("footer.quickLinks")}
                    </h3>
                    <ul className="space-y-3">
                        {(!isLoggedIn || isStudent) && (
                            <>
                                <li><Link href="/classes" className="text-white hover:text-primary-200 transition-colors">{t("nav.classes")}</Link></li>
                                <li><Link href="/featured-chapters" className="text-white hover:text-primary-200 transition-colors">{t("nav.featuredChapters")}</Link></li>
                                <li><Link href="/free-chapters" className="text-white hover:text-primary-200 transition-colors">{t("nav.freeChapters")}</Link></li>
                            </>
                        )}

                        {isLoggedIn && isStudent && (
                            <>
                                <li><Link href="/student/dashboard" className="text-white hover:text-primary-200 transition-colors">{t("nav.myDashboard")}</Link></li>
                                <li><Link href="/student/profile" className="text-white hover:text-primary-200 transition-colors">{t("nav.myProfile")}</Link></li>
                            </>
                        )}

                        {isLoggedIn && isTeacher && (
                            <>
                                <li><Link href="/teacher" className="text-white hover:text-primary-200 transition-colors">{t("nav.myDashboard")}</Link></li>
                                <li><Link href="/teacher/assigned-chapters" className="text-white hover:text-primary-200 transition-colors">{t("nav.assignedChapters")}</Link></li>
                                <li><Link href="/teacher/profile" className="text-white hover:text-primary-200 transition-colors">{t("nav.myProfile")}</Link></li>
                            </>
                        )}
                        <li><Link href="/support" className="text-white hover:text-primary-200 transition-colors">{t("nav.support")}</Link></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-primary-200">
                        {t("footer.contact")}
                    </h3>
                    <div className="space-y-5">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-200/70">{t("footer.email")}</span>
                            <span className="text-base font-medium text-white tracking-wide">{schoolInfo.email}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-200/70">{t("footer.phone")}</span>
                            <span className="text-base font-medium text-white tracking-wide">{schoolInfo.phone}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-200/70">{t("footer.address")}</span>
                            <span className="text-base font-medium text-white tracking-wide">{schoolInfo.address}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-200/60">
                <p>© Montola School {schoolInfo.copyrightYear} – {t("footer.rights")}</p>
                <div className="flex gap-6">
                    <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}

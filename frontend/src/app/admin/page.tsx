"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStatistics } from "@/lib/admin";
import { AdminStatisticsDto } from "@/types";
import { toast } from "react-toastify";
import { HiBookOpen, HiLibrary, HiDocumentText, HiClock } from "react-icons/hi";
import RoleToggle from "@/components/admin/RoleToggle";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStatisticsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getStatistics();
                setStats(res.data);
            } catch (err: any) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to load statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading statistics...</p>
                </div>
            </div>
        );
    }

    const statsCards = [
        {
            title: "Total classes",
            value: stats?.courseStats.totalClasses || 0,
            icon: HiBookOpen,
            iconClass: "bg-blue-50 text-blue-600",
            href: "/admin/classes",
        },
        {
            title: "Total subjects",
            value: stats?.courseStats.totalSubjects || 0,
            icon: HiLibrary,
            iconClass: "bg-emerald-50 text-emerald-600",
            href: "/admin/subjects",
        },
        {
            title: "Total chapters",
            value: stats?.courseStats.totalChapters || 0,
            icon: HiDocumentText,
            iconClass: "bg-purple-50 text-purple-600",
            href: "/admin/chapters",
        },
        {
            title: "Draft chapters",
            value: stats?.chapterStats.totalDraft || 0,
            icon: HiClock,
            iconClass: "bg-amber-50 text-amber-600",
            href: "/admin/chapters?status=DRAFT",
        },
        {
            title: "Published chapters",
            value: stats?.chapterStats.totalPublished || 0,
            icon: HiDocumentText,
            iconClass: "bg-primary-50 text-primary-600",
            href: "/admin/chapters?status=PUBLISHED",
        },
        {
            title: "Free chapters",
            value: stats?.chapterStats.totalFree || 0,
            icon: HiDocumentText,
            iconClass: "bg-teal-50 text-teal-600",
            href: "/admin/chapters",
        },
    ];

    const userStats = [
        { label: "Total users", value: stats?.userStats.totalUsers },
        { label: "Active users", value: stats?.userStats.activeUsers },
        { label: "Admins", value: stats?.userStats.admins },
        { label: "Managers", value: stats?.userStats.managers },
        { label: "Teachers", value: stats?.userStats.teachers },
        { label: "Students", value: stats?.userStats.students },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Dashboard overview</h1>
                <p className="text-sm text-gray-500 mt-1">A snapshot of your courses, users and content.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {statsCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            onClick={() => router.push(card.href)}
                            className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1.5">{card.title}</p>
                                    <p className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">{card.value}</p>
                                </div>
                                <div className={`${card.iconClass} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Statistics Section */}
            {stats?.userStats && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5">User statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {userStats.map((s) => (
                            <div key={s.label} className="bg-gray-50 rounded-lg px-4 py-4 text-center">
                                <p className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">{s.value ?? 0}</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Quick actions</h2>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => router.push("/admin/classes?action=create")}
                        className="px-4 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Create new class
                    </button>
                    <button
                        onClick={() => router.push("/admin/subjects?action=create")}
                        className="px-4 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Create new subject
                    </button>
                    <button
                        onClick={() => router.push("/admin/chapters?action=create")}
                        className="px-4 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Create new chapter
                    </button>
                    <button
                        onClick={() => router.push("/admin/payments/unverified")}
                        className="px-4 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Review unverified payments
                    </button>
                </div>
            </div>
        </div>
    );
}

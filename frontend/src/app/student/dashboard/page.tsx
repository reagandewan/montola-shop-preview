"use client";

import { useEffect, useState } from "react";
import { getMyChaptersProgress, getMyPayments } from "@/lib/student";
import { ChapterProgressResponseDto, PaymentResponseDto, PaymentStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { FaBookOpen, FaAward, FaClock, FaCreditCard, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";
import LoadingSpinner from "@/components/LoadingSpinner";

// Simple Icons
function CourseIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.516 50.552 50.552 0 00-2.658.813m-15.482 0A50.553 50.553 0 0112 13.489a50.551 50.551 0 0112-1.586m-22.5 5.152l6.75-6.75a4.5 4.5 0 016.368 6.366l-9 9h9a2.25 2.25 0 002.25-2.25v-9.37l6.75-6.75" />
        </svg>
    )
}

import { getChapterCoverImage } from "@/lib/admin";

function ChapterImage({ item }: { item: ChapterProgressResponseDto }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const res = await getChapterCoverImage(item.chapterId);
                const blob = res.data as Blob;
                if (blob && blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    setImageUrl(url);
                }
            } catch (error) {
                console.error("Failed to fetch chapter image:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();

        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [item.chapterId]);

    if (loading) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    if (!imageUrl) {
        return <ChapterPlaceholder title={item.chapterTitle} />;
    }

    return (
        <Image
            src={imageUrl}
            alt={item.chapterTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
        />
    );
}

import { useI18n } from "@/contexts/I18nProvider";

export default function StudentDashboard() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { t } = useI18n();
    const [progressData, setProgressData] = useState<ChapterProgressResponseDto[]>([]);
    const [paymentsData, setPaymentsData] = useState<PaymentResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [progress, payments] = await Promise.all([
                    getMyChaptersProgress(),
                    getMyPayments()
                ]);
                setProgressData(progress);
                setPaymentsData(payments);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        } else if (!isAuthLoading) {
            setLoading(false);
        }
    }, [user, isAuthLoading]);

    if (loading || isAuthLoading) {
        return (
            <div className="min-h-screen pt-24">
                <LoadingSpinner label={t("student.dashboard.preparingOverview")} size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <p className="text-xl mb-4">{t("student.dashboard.pleaseLogin")}</p>
                <Link href="/auth/login" className="text-primary-600 underline">{t("student.dashboard.login")}</Link>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">{t("student.dashboard.welcome", { name: user.fullName?.split(" ")[0] })}</h1>
                    <p className="text-gray-600 mt-2">{t("student.dashboard.subtitle")}</p>
                </header>

                {progressData.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-dashed border-gray-300">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CourseIcon className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t("student.dashboard.notEnrolledTitle")}</h3>
                        <p className="text-gray-500 mb-6">{t("student.dashboard.notEnrolledSubtitle")}</p>
                        <Link
                            href="/"
                            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                        >
                            {t("student.dashboard.browseCourses")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {progressData.map((item) => (
                            <Link
                                key={item.chapterId}
                                href={`/student/chapters/${item.chapterId}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 block group"
                            >
                                <div className="aspect-video relative overflow-hidden bg-gray-100">
                                    <ChapterImage item={item} />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                    <div className="absolute top-3 right-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 ${item.completed ? 'bg-green-500 text-white' : 'bg-primary-600 text-white'}`}>
                                            {item.completed ? <FaAward /> : <FaClock />}
                                            {item.completed ? t("student.dashboard.completed") : t("student.dashboard.inProgress")}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition line-clamp-1">{item.chapterTitle}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                                            {item.progressPercentage === 100 ? t("student.dashboard.finished") : t("student.dashboard.continueLearning")}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500 font-medium">{t("student.dashboard.yourProgress")}</span>
                                            <span className="font-bold text-primary-600">{Math.round(item.progressPercentage)}%</span>
                                        </div>

                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-primary-600 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${item.progressPercentage}%` }}
                                            />
                                        </div>

                                        <div className="pt-2 flex items-center justify-end">
                                            <span className="text-sm font-bold text-primary-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                {item.completed ? t("student.dashboard.review") : t("student.dashboard.resume")} &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Payments Section */}
                <section className="mt-16">
                    <header className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{t("student.dashboard.recentPayments")}</h2>
                            <p className="text-gray-500 mt-1">{t("student.dashboard.paymentSubtitle")}</p>
                        </div>
                        <Link href="/student/profile" className="text-primary-600 font-bold hover:underline flex items-center gap-1">
                            {t("student.dashboard.manageAccount")} <FaCreditCard />
                        </Link>
                    </header>

                    {paymentsData.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center border border-gray-100 italic text-gray-400">
                            {t("student.dashboard.noPaymentHistory")}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("student.dashboard.chapter")}</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("student.dashboard.amount")}</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("student.dashboard.transactionId")}</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("student.dashboard.status")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {paymentsData.slice(0, 5).map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{payment.chapterTitle}</td>
                                                <td className="px-6 py-4 font-bold text-primary-600">৳{payment.amount}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{payment.transactionId}</td>
                                                <td className="px-6 py-4 text-sm font-bold">
                                                    <span className={`flex items-center gap-1.5 ${payment.status === PaymentStatus.VERIFIED ? 'text-green-600' :
                                                        payment.status === PaymentStatus.REJECTED ? 'text-red-600' : 'text-orange-500'
                                                        }`}>
                                                        {payment.status === PaymentStatus.VERIFIED && <FaCheckCircle />}
                                                        {payment.status === PaymentStatus.REJECTED && <FaExclamationCircle />}
                                                        {payment.status === PaymentStatus.PENDING && <FaClock />}
                                                        {payment.status === PaymentStatus.VERIFIED ? t("student.dashboard.statusVerified") :
                                                            payment.status === PaymentStatus.REJECTED ? t("student.dashboard.statusRejected") :
                                                                t("student.dashboard.statusPending")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

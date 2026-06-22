"use client";

import { useEffect, useState } from "react";
import { getFeaturedChapters } from "@/lib/public";
import { getMyChaptersProgress } from "@/lib/student";
import { FeaturedChapterResponseDto } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaChevronRight, FaPlay } from "react-icons/fa";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useI18n } from "@/contexts/I18nProvider";

function ChapterImage({ chapter }: { chapter: FeaturedChapterResponseDto }) {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return <ChapterPlaceholder title={chapter.title} subjectName={chapter.subjectName} />;
    }

    return (
        <Image
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/chapters/${chapter.chapterId || chapter.id}/cover-image`}
            alt={chapter.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
            unoptimized
        />
    );
}

export default function FeaturedChaptersPage() {
    const { t } = useI18n();
    const { isLoggedIn, user } = useAuth();
    const [chapters, setChapters] = useState<FeaturedChapterResponseDto[]>([]);
    const [enrollmentMap, setEnrollmentMap] = useState<Map<number, number>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isStudent = user?.roles?.includes("STUDENT");

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const [data, progress] = await Promise.all([
                    getFeaturedChapters(),
                    (isLoggedIn && isStudent) ? getMyChaptersProgress().catch(() => []) : Promise.resolve([])
                ]);

                setChapters(data);
                if (progress && progress.length > 0) {
                    const emap = new Map();
                    progress.forEach(p => emap.set(p.chapterId, p.progressPercentage));
                    setEnrollmentMap(emap);
                }
            } catch (err) {
                console.error("Failed to fetch featured chapters:", err);
                setError(t("featuredChapters.error"));
            } finally {
                setLoading(false);
            }
        };
        fetchChapters();
    }, [isLoggedIn, isStudent, t]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <LoadingSpinner label={t("featuredChapters.loading")} size="lg" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                        <FaStar /> {t("featuredChapters.badge")}
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{t("featuredChapters.title")}</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t("featuredChapters.subtitle")}
                    </p>
                </header>

                {error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center max-w-md mx-auto border border-red-100">
                        {error}
                    </div>
                ) : chapters.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <FaStar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t("featuredChapters.noChapters")}</h3>
                        <p className="text-gray-500">{t("featuredChapters.noChaptersSub")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {chapters.map((c) => (
                            <Link
                                key={c.id}
                                href={enrollmentMap.has(c.chapterId) ? `/student/chapters/${c.chapterId}` : `/chapters/${c.chapterId}`}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                            >
                                <div className="aspect-video relative overflow-hidden bg-gray-100">
                                    <ChapterImage chapter={c} />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black tracking-widest text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded">
                                            {c.subjectName} {c.className && `[${c.className}]`}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight uppercase tracking-tight">{c.title}</h3>
                                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">{c.description}</p>

                                    {enrollmentMap.has(c.chapterId) && (
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex-grow bg-gray-100 rounded-full h-1.5 mr-3">
                                                <div
                                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${enrollmentMap.get(c.chapterId)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{Math.round(enrollmentMap.get(c.chapterId) || 0)}% {t("student.dashboard.finished")}</span>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <p className="text-2xl font-black text-primary-600">
                                            {c.free ? t("home.free.badge") : `৳${c.price}`}
                                        </p>
                                        {enrollmentMap.has(c.chapterId) ? (
                                            <span
                                                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-black text-sm tracking-tight group-hover:bg-green-700 transition shadow-lg shadow-green-100"
                                            >
                                                <FaPlay size={10} /> {t("student.dashboard.resume")}
                                            </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-black text-sm tracking-tight group-hover:bg-primary-700 transition shadow-lg shadow-primary-100"
                                            >
                                                {t("home.featured.preview")} <FaChevronRight size={12} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

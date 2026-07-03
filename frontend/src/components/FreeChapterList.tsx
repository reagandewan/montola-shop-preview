"use client";

import { useEffect, useState } from "react";
import { getFreeChapters } from "@/lib/public";
import { getMyChaptersProgress } from "@/lib/student";
import { ChapterResponseDto, ChapterProgressResponseDto } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaPlay } from "react-icons/fa";
import { useI18n } from "@/contexts/I18nProvider";

function ChapterImage({ chapter }: { chapter: ChapterResponseDto }) {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return <ChapterPlaceholder title={chapter.title} subjectName={chapter.subjectName} />;
    }

    return (
        <Image
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/chapters/${chapter.id}/cover-image`}
            alt={chapter.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            unoptimized
        />
    );
}

export default function FreeChapterList() {
    const { isLoggedIn, user } = useAuth();
    const { t } = useI18n();
    const [chapters, setChapters] = useState<ChapterResponseDto[]>([]);
    const [enrollmentMap, setEnrollmentMap] = useState<Map<number, number>>(new Map());
    const [loading, setLoading] = useState(true);

    const isStudent = user?.roles?.includes("STUDENT");

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const [data, progress] = await Promise.all([
                    getFreeChapters(),
                    (isLoggedIn && isStudent) ? getMyChaptersProgress().catch(() => []) : Promise.resolve([])
                ]);

                setChapters(data);
                if (progress && progress.length > 0) {
                    const emap = new Map();
                    progress.forEach(p => emap.set(p.chapterId, p.progressPercentage));
                    setEnrollmentMap(emap);
                }
            } catch (error) {
                console.error("Failed to fetch free chapters:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChapters();
    }, [isLoggedIn, isStudent]);

    if (loading) {
        return (
            <div className="py-24">
                <LoadingSpinner label={t("home.free.loading")} size="lg" />
            </div>
        );
    }

    if (chapters.length === 0) {
        return null; // Don't show section if no free chapters
    }

    return (
        <section className="py-16 px-6 bg-white">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-4">{t("home.free.title")}</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                    {t("home.free.subtitle")}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {chapters.map((c) => (
                    <Link
                        key={c.id}
                        href={enrollmentMap.has(c.id) ? `/student/chapters/${c.id}` : `/chapters/${c.id}`}
                        className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group border border-gray-100"
                    >
                        <div className="aspect-video relative overflow-hidden bg-gray-100 block">
                            <ChapterImage chapter={c} />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                            <div className="absolute top-3 right-3">
                                <span className="px-2 py-1 bg-green-600 text-[10px] font-bold text-white rounded shadow-sm">
                                    {t("home.free.badge")}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow text-center">
                            <h3 className="text-xl font-bold mb-1 group-hover:text-primary-600 transition line-clamp-1">{c.title}</h3>
                            <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-4">{c.subjectName}</p>
                            <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed">{c.description}</p>
                            <div className="mt-auto">
                                {enrollmentMap.has(c.id) && (
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex-grow bg-gray-100 rounded-full h-1.5 mr-3">
                                            <div
                                                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${enrollmentMap.get(c.id)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-green-600">{Math.round(enrollmentMap.get(c.id) || 0)}%</span>
                                    </div>
                                )}
                                {enrollmentMap.has(c.id) ? (
                                    <span
                                        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-bold text-xs tracking-widest group-hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-50"
                                    >
                                        <FaPlay size={10} /> {t("student.dashboard.resume")}
                                    </span>
                                ) : (
                                    <span
                                        className="block w-full py-3 px-4 border-2 border-primary-600 text-primary-600 rounded-lg font-bold text-xs tracking-widest group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:-translate-y-1"
                                    >
                                        {t("home.free.enrollNow")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

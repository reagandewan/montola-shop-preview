"use client";

import { useEffect, useState } from "react";
import { getFreeChapters } from "@/lib/public";
import { getMyChaptersProgress } from "@/lib/student";
import { ChapterResponseDto } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { FaUnlockAlt, FaChevronRight, FaPlayCircle, FaPlay } from "react-icons/fa";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useI18n } from "@/contexts/I18nProvider";

// Level structure mirrors the shop: JSC splits into Class 6/7/8; SSC & HSC are
// browsed as whole levels (their two years share subjects).
const LEVELS: { key: string; classes: number[]; split: boolean }[] = [
    { key: "JSC", classes: [6, 7, 8], split: true },
    { key: "SSC", classes: [9, 10], split: false },
    { key: "HSC", classes: [11, 12], split: false },
];

const classNum = (name?: string | null) => parseInt((name || "").replace(/\D/g, ""), 10);
const levelOf = (name?: string | null): string | null => {
    const n = classNum(name);
    if (n >= 6 && n <= 8) return "JSC";
    if (n >= 9 && n <= 10) return "SSC";
    if (n >= 11 && n <= 12) return "HSC";
    return null;
};

function ChapterImage({ chapter }: { chapter: ChapterResponseDto }) {
    const [imageError, setImageError] = useState(false);
    if (imageError) return <ChapterPlaceholder title={chapter.title} subjectName={chapter.subjectName} />;
    return (
        <Image
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/chapters/${chapter.id}/cover-image`}
            alt={chapter.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
            unoptimized
        />
    );
}

function ChapterCard({ c, progress, t }: { c: ChapterResponseDto; progress?: number; t: (k: string) => string }) {
    const enrolled = progress !== undefined;
    return (
        <Link
            href={enrolled ? `/student/chapters/${c.id}` : `/chapters/${c.id}`}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
        >
            <div className="aspect-video relative overflow-hidden bg-gray-100">
                <ChapterImage chapter={c} />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                        {t("freeChapters.freeAccess")}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                        {c.subjectName} {c.className && `[${c.className}]`}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors leading-tight tracking-tight">{c.title}</h3>
                <p className="text-gray-600 mb-5 line-clamp-2 text-sm leading-relaxed">{c.description}</p>

                {enrolled && (
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex-grow bg-gray-100 rounded-full h-1.5 mr-3">
                            <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{Math.round(progress || 0)}% {t("student.dashboard.finished")}</span>
                    </div>
                )}

                <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        <FaPlayCircle className="text-primary-600" />
                        {t("freeChapters.startLearning")}
                    </div>
                    {enrolled ? (
                        <span className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition">
                            <FaPlay size={10} /> {t("student.dashboard.resume")} <FaChevronRight size={12} />
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 border-2 border-primary-600 text-primary-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-600 hover:text-white transition">
                            {t("freeChapters.enrollNow")} <FaChevronRight size={12} />
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function FreeChaptersPage() {
    const { t } = useI18n();
    const { isLoggedIn, user } = useAuth();
    const [chapters, setChapters] = useState<ChapterResponseDto[]>([]);
    const [enrollmentMap, setEnrollmentMap] = useState<Map<number, number>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeLevel, setActiveLevel] = useState<string>("ALL");

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
                    const emap = new Map<number, number>();
                    progress.forEach(p => emap.set(p.chapterId, p.progressPercentage));
                    setEnrollmentMap(emap);
                }
            } catch (err) {
                console.error("Failed to fetch free chapters:", err);
                setError(t("freeChapters.error"));
            } finally {
                setLoading(false);
            }
        };
        fetchChapters();
    }, [isLoggedIn, isStudent, t]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <LoadingSpinner label={t("freeChapters.loading")} size="lg" />
            </div>
        );
    }

    const prog = (id: number) => enrollmentMap.has(id) ? enrollmentMap.get(id) : undefined;
    const visibleLevels = LEVELS.filter((l) => activeLevel === "ALL" || activeLevel === l.key);

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 text-center text-balance">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                        <FaUnlockAlt /> {t("freeChapters.badge")}
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">{t("freeChapters.title")}</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("freeChapters.pickLevel")}</p>
                </header>

                {/* Level filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    <button
                        onClick={() => setActiveLevel("ALL")}
                        className={`text-sm font-semibold px-4 py-2 rounded-full border transition ${activeLevel === "ALL" ? "bg-primary-600 text-white border-primary-600" : "bg-white border-gray-300 text-gray-600 hover:border-primary-400"}`}
                    >
                        {t("freeChapters.allLevels")}
                    </button>
                    {LEVELS.map((l) => (
                        <button
                            key={l.key}
                            onClick={() => setActiveLevel(l.key)}
                            className={`text-sm font-semibold px-4 py-2 rounded-full border transition ${activeLevel === l.key ? "bg-primary-600 text-white border-primary-600" : "bg-white border-gray-300 text-gray-600 hover:border-primary-400"}`}
                        >
                            {l.key}
                        </button>
                    ))}
                </div>

                {error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center max-w-md mx-auto border border-red-100">{error}</div>
                ) : (
                    <div className="space-y-14">
                        {visibleLevels.map((lvl) => {
                            const lvlChapters = chapters.filter((c) => levelOf(c.className) === lvl.key);
                            return (
                                <section key={lvl.key}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-sm font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full">{lvl.key}</span>
                                        <span className="h-px flex-1 bg-gray-200" />
                                    </div>

                                    {lvlChapters.length === 0 ? (
                                        <p className="text-gray-400 text-sm bg-white border border-dashed border-gray-200 rounded-xl px-6 py-8 text-center">
                                            {t("freeChapters.comingSoon")}
                                        </p>
                                    ) : lvl.split ? (
                                        // JSC: sub-group by class
                                        <div className="space-y-8">
                                            {lvl.classes.map((cn) => {
                                                const inClass = lvlChapters.filter((c) => classNum(c.className) === cn);
                                                if (inClass.length === 0) return null;
                                                return (
                                                    <div key={cn}>
                                                        <h3 className="font-bold text-gray-700 mb-4">Class {cn}</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            {inClass.map((c) => <ChapterCard key={c.id} c={c} progress={prog(c.id)} t={t} />)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        // SSC / HSC: whole level
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {lvlChapters.map((c) => <ChapterCard key={c.id} c={c} progress={prog(c.id)} t={t} />)}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

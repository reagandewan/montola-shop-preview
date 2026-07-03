"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getClassPublicStructure, getFreeChapters } from "@/lib/public";
import { ClassStructureResponseDto, ChapterResponseDto } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useI18n } from "@/contexts/I18nProvider";
import { FaBookOpen, FaChevronRight, FaPlay } from "react-icons/fa";

export default function ClassPage() {
    const { t } = useI18n();
    const params = useParams();
    const id = params?.id ? Number(params.id) : null;

    const [structure, setStructure] = useState<ClassStructureResponseDto | null>(null);
    const [freeChapters, setFreeChapters] = useState<ChapterResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchStructure = async () => {
            try {
                const data = await getClassPublicStructure(id);
                setStructure(data);
            } catch (err) {
                console.error("Failed to fetch class structure:", err);
                setError(t("classes.contentError"));
            } finally {
                setLoading(false);
            }
        };

        fetchStructure();

        // Free chapters scoped to this class (strip hidden when none)
        getFreeChapters()
            .then((all) => setFreeChapters(all.filter((c) => c.classId === id)))
            .catch(() => setFreeChapters([]));
    }, [id, t]);

    if (!id) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <LoadingSpinner label={t("classes.detailsLoading")} size="lg" />
            </div>
        );
    }

    if (error || !structure) {
        return <div className="min-h-screen pt-24 text-center text-red-500 font-bold uppercase tracking-widest">{error || t("classes.notFound")}</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-8 inline-flex items-center gap-2.5 text-sm bg-white border border-gray-200 rounded-full px-5 py-2.5 shadow-sm" aria-label="Breadcrumb">
                    <Link href="/classes" className="text-gray-500 hover:text-primary-600 transition-colors font-semibold">
                        {t("nav.classes")}
                    </Link>
                    <FaChevronRight className="text-gray-400" size={11} />
                    <span className="text-gray-900 font-bold">{structure.name}</span>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{structure.name}</h1>
                    {structure.description && (
                        <p className="text-lg text-gray-600 max-w-3xl leading-relaxed font-medium">{structure.description}</p>
                    )}
                </header>

                {/* Free chapters in this class */}
                {freeChapters.length > 0 && (
                    <section className="mb-12 bg-primary-50/60 border border-primary-100 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-primary-800 mb-4">
                            {t("classes.freeInClass")}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {freeChapters.map((ch) => (
                                <Link
                                    key={ch.id}
                                    href={`/chapters/${ch.id}`}
                                    className="group bg-white rounded-xl border border-primary-100 p-4 flex items-center justify-between gap-3 hover:shadow-md hover:border-primary-300 transition"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">{ch.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{ch.subjectName}</p>
                                    </div>
                                    <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-full px-3 py-1.5">
                                        <FaPlay size={8} /> {t("classes.startFree")}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {structure.subjects.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <FaBookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("classes.noSubjects")}</h2>
                        <p className="text-gray-500">{t("classes.noSubjectsSub")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {structure.subjects.map((subject) => {
                            const chapterCount = subject.chapters?.length || 0;

                            return (
                                <Link
                                    key={subject.id}
                                    href={`/classes/${id}/subjects/${subject.id}`}
                                    className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col min-h-56"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-5">
                                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            <FaBookOpen size={22} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">
                                            {chapterCount} {chapterCount === 1 ? t("classes.chapter") : t("classes.chapters")}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight tracking-tight">
                                        {subject.name}
                                    </h2>
                                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed font-medium flex-grow">
                                        {subject.description || t("classes.subjectFallbackDesc")}
                                    </p>

                                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-50">
                                        <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                                            {t("classes.viewChapters")}
                                        </span>
                                        <FaChevronRight className="text-primary-600 transition-transform group-hover:translate-x-1" size={14} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

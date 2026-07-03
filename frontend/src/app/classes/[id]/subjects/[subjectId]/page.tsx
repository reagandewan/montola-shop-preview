"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaBookOpen, FaChevronRight } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";
import PublicChapterGrid from "@/components/PublicChapterGrid";
import { useI18n } from "@/contexts/I18nProvider";
import { getSubjectPublicStructure } from "@/lib/public";
import { SubjectStructureResponseDto } from "@/types";

export default function SubjectPage() {
    const { t } = useI18n();
    const params = useParams();
    const classId = params?.id ? Number(params.id) : null;
    const subjectId = params?.subjectId ? Number(params.subjectId) : null;

    const [subject, setSubject] = useState<SubjectStructureResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!subjectId) return;

        const fetchSubject = async () => {
            try {
                setLoading(true);
                const data = await getSubjectPublicStructure(subjectId);
                setSubject(data);
            } catch (err) {
                console.error("Failed to fetch subject structure:", err);
                setError(t("classes.subjectContentError"));
            } finally {
                setLoading(false);
            }
        };

        fetchSubject();
    }, [subjectId, t]);

    if (!classId || !subjectId) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <LoadingSpinner label={t("classes.subjectLoading")} size="lg" />
            </div>
        );
    }

    if (error || !subject) {
        return <div className="min-h-screen pt-24 text-center text-red-500 font-bold uppercase tracking-widest">{error || t("classes.subjectNotFound")}</div>;
    }

    const parentClassId = subject.classId || classId;
    const chapters = subject.chapters || [];

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-8 inline-flex items-center gap-2.5 text-sm bg-white border border-gray-200 rounded-full px-5 py-2.5 shadow-sm" aria-label="Breadcrumb">
                    <Link href={`/classes/${parentClassId}`} className="text-gray-500 hover:text-primary-600 transition-colors font-semibold">
                        {subject.className || t("nav.classes")}
                    </Link>
                    <FaChevronRight className="text-gray-400" size={11} />
                    <span className="text-gray-900 font-bold">{subject.name}</span>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{subject.name}</h1>
                    {subject.description && (
                        <p className="text-lg text-gray-600 max-w-3xl leading-relaxed font-medium">{subject.description}</p>
                    )}
                </header>

                <div className="flex items-center gap-4 mb-6 px-2">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t("classes.chapters")}</h2>
                    <div className="flex-grow h-px bg-gray-200"></div>
                </div>

                {chapters.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <FaBookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("classes.noChapters")}</h2>
                        <p className="text-gray-500 font-medium">{t("classes.noChaptersSub")}</p>
                    </div>
                ) : (
                    <PublicChapterGrid chapters={chapters} />
                )}
            </div>
        </main>
    );
}

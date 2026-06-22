"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChapterProgress } from "@/lib/student";
import { ChapterProgressResponseDto } from "@/types";
import { FaPlayCircle } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

import { useI18n } from "@/contexts/I18nProvider";

export default function ChapterStudentPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useI18n();
    const chapterId = params?.id ? Number(params.id) : null;

    const [progress, setProgress] = useState<ChapterProgressResponseDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!chapterId) return;
        const fetchProgress = async () => {
            try {
                const data = await getChapterProgress(chapterId);
                setProgress(data);
            } catch (error) {
                console.error("Failed to fetch chapter progress", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [chapterId]);

    // Simple handler to start/resume
    // Ideally we find the first uncompleted item from detailed progress, but for now we can just show a button
    // or let them use the sidebar.

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner label={t("student.dashboard.preparingOverview")} />
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{progress?.chapterTitle || t("student.dashboard.courseOverview")}</h1>

            <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">{t("student.dashboard.yourProgress")}</span>
                    <span className="font-medium text-gray-900">{Math.round(progress?.progressPercentage || 0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                        className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress?.progressPercentage || 0}%` }}
                    />
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">{t("student.dashboard.readyToLearn")}</h2>
                <p className="text-blue-700 mb-4">{t("student.dashboard.selectTopic")}</p>
                {/* <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" />
                    Resume Learning
                 </button> */}
            </div>
        </div>
    );
}

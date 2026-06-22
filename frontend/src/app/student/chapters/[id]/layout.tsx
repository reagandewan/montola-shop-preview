"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { useParams } from "next/navigation";
import { getChapterProgress, getChapterDetailedProgress } from "@/lib/student";
import { ChapterStructureResponseDto, ChapterProgressResponseDto } from "@/types";
import CourseSidebar from "@/components/CourseSidebar";
import api from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

type ProgressContextType = {
    detailedProgress: Record<string, boolean>;
    overallProgress: ChapterProgressResponseDto | null;
    refreshProgress: () => Promise<void>;
    structure: ChapterStructureResponseDto | null;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) throw new Error("useProgress must be used within a ProgressProvider");
    return context;
};

import { useI18n } from "@/contexts/I18nProvider";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const { t } = useI18n();
    const chapterId = params?.id ? Number(params.id) : null;

    const [structure, setStructure] = useState<ChapterStructureResponseDto | null>(null);
    const [detailedProgress, setDetailedProgress] = useState<Record<string, boolean>>({});
    const [overallProgress, setOverallProgress] = useState<ChapterProgressResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const refreshProgress = useCallback(async () => {
        if (!chapterId) return;
        try {
            const [detailed, overall] = await Promise.all([
                getChapterDetailedProgress(chapterId),
                getChapterProgress(chapterId)
            ]);
            setDetailedProgress(detailed || {});
            setOverallProgress(overall);
        } catch (error) {
            console.error("Failed to refresh progress:", error);
        }
    }, [chapterId]);

    useEffect(() => {
        if (!chapterId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [structRes] = await Promise.all([
                    api.get<ChapterStructureResponseDto>(`/v1/chapters/${chapterId}/structure`),
                    refreshProgress()
                ]);
                setStructure(structRes.data);
            } catch (error) {
                console.error("Failed to load course data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chapterId, refreshProgress]);

    // Close sidebar on small screens when content changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [params?.contentId]);

    if (!chapterId) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <LoadingSpinner label={t("student.dashboard.loadingCourseMaterial")} size="lg" />
            </div>
        );
    }

    if (!structure) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50">
                {t("student.dashboard.courseContentNotFound")}
            </div>
        );
    }

    return (
        <ProgressContext.Provider value={{ detailedProgress, overallProgress, refreshProgress, structure }}>
            <div className="flex min-h-screen bg-gray-50 pt-16 relative overflow-x-hidden">
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <CourseSidebar
                    structure={structure}
                    detailedProgress={detailedProgress}
                    overallProgress={overallProgress}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <div className="flex-1 min-w-0">
                    <main className="p-4 md:p-8 max-w-5xl mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ProgressContext.Provider>
    );
}


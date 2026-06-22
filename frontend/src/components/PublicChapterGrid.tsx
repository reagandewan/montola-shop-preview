"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChapterStructureResponseDto } from "@/types";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nProvider";
import { getMyChaptersProgress } from "@/lib/student";

function ChapterCardImage({ chapterId, title }: { chapterId: number; title: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return <ChapterPlaceholder title={title} className="!p-4" />;
    }

    return (
        <Image
            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/v1/chapters/${chapterId}/cover-image`}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            unoptimized
        />
    );
}

interface Props {
    chapters: ChapterStructureResponseDto[];
    /** Optional pre-fetched enrollment map (chapterId → progressPercentage).
     *  If provided, the component skips its own getMyChaptersProgress() call.
     *  Parent pages should fetch this once and pass it down to avoid redundant API calls. */
    enrollmentMap?: Map<number, number>;
}

export default function PublicChapterGrid({ chapters, enrollmentMap: externalEnrollmentMap }: Props) {
    const { isLoggedIn, user } = useAuth();
    const { t } = useI18n();
    const [internalEnrollmentMap, setInternalEnrollmentMap] = useState<Map<number, number>>(new Map());

    const isStudent = user?.roles?.includes("STUDENT");

    // Only fetch progress internally if no enrollmentMap was passed from parent
    useEffect(() => {
        if (externalEnrollmentMap) return; // Parent already provided the data
        if (isLoggedIn && isStudent) {
            getMyChaptersProgress()
                .then((progress) => {
                    const emap = new Map<number, number>();
                    progress?.forEach((p) => emap.set(p.chapterId, p.progressPercentage));
                    setInternalEnrollmentMap(emap);
                })
                .catch((err) => console.error("Failed to fetch enrollment status:", err));
        }
    }, [isLoggedIn, isStudent, externalEnrollmentMap]);

    const enrollmentMap = externalEnrollmentMap ?? internalEnrollmentMap;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
                <Link
                    key={chapter.id}
                    href={enrollmentMap.has(chapter.id) ? `/student/chapters/${chapter.id}` : `/chapters/${chapter.id}`}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                    <div className="aspect-video relative rounded-xl overflow-hidden mb-4 bg-gray-50 border border-gray-50">
                        <ChapterCardImage chapterId={chapter.id} title={chapter.title} />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </div>

                    <div className="flex-grow flex flex-col">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition tracking-tight mb-2 leading-tight">
                            {chapter.title}
                        </h4>

                        <div className="mt-auto">
                            {enrollmentMap.has(chapter.id) ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                                            {Math.round(enrollmentMap.get(chapter.id) || 0)}% COMPLETED
                                        </span>
                                        <span className="text-[10px] font-black text-white bg-green-600 px-2 py-1 rounded uppercase tracking-tighter shadow-sm">
                                            {t("student.dashboard.resume")}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${enrollmentMap.get(chapter.id)}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                                        {t("chapterPublic.preview")}
                                    </span>
                                    <span className="text-primary-600 transform group-hover:translate-x-1 transition-transform">
                                        &rarr;
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

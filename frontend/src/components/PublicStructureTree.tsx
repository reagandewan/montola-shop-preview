"use client";

import { ClassStructureResponseDto } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ChapterPlaceholder from "./ChapterPlaceholder";
import { useAuth } from "@/contexts/AuthContext";
import { getMyChaptersProgress } from "@/lib/student";
import { useI18n } from "@/contexts/I18nProvider";

function ChapterImageIcon({ chapterId, title }: { chapterId: number, title: string }) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-300">
            {!imageError ? (
                <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/chapters/${chapterId}/cover-image`}
                    alt={title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    unoptimized
                />
            ) : (
                <ChapterPlaceholder
                    title={title}
                    className="!p-0.5"
                    variant="thumbnail"
                />
            )}
        </div>
    );
}

interface Props {
    structure: ClassStructureResponseDto;
}

function ChapterCardImage({ chapterId, title }: { chapterId: number, title: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return <ChapterPlaceholder title={title} className="!p-4" />;
    }

    return (
        <Image
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/chapters/${chapterId}/cover-image`}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            unoptimized
        />
    );
}

interface Props {
    structure: ClassStructureResponseDto;
}

export default function PublicStructureTree({ structure }: Props) {
    const { isLoggedIn, user } = useAuth();
    const { t } = useI18n();
    const [enrollmentMap, setEnrollmentMap] = useState<Map<number, number>>(new Map());

    const isStudent = user?.roles?.includes("STUDENT");

    useEffect(() => {
        if (isLoggedIn && isStudent) {
            getMyChaptersProgress()
                .then(progress => {
                    if (progress && progress.length > 0) {
                        const emap = new Map();
                        progress.forEach(p => emap.set(p.chapterId, p.progressPercentage));
                        setEnrollmentMap(emap);
                    }
                })
                .catch(err => console.error("Failed to fetch enrollment status:", err));
        }
    }, [isLoggedIn, isStudent]);

    return (
        <div className="space-y-12">
            {structure.subjects.map((subject) => (
                <div key={subject.id}>
                    <div className="flex items-center gap-4 mb-6 px-2">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{subject.name}</h3>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>
                    
                    {subject.chapters.length === 0 ? (
                        <div className="p-8 text-gray-400 text-center italic bg-white rounded-2xl border border-gray-100 shadow-sm">{t("classes.noChapters")}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subject.chapters.map((chapter) => (
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
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-primary-600 transform group-hover:translate-x-1 transition-transform">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { getAllClasses } from "@/lib/public";
import { ClassResponseDto } from "@/types";
import Link from "next/link";
import { FaGraduationCap, FaChevronRight } from "react-icons/fa";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useI18n } from "@/contexts/I18nProvider";

export default function ClassesPage() {
    const { t } = useI18n();
    const [classes, setClasses] = useState<ClassResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await getAllClasses();
                setClasses(data);
            } catch (err) {
                console.error("Failed to fetch classes:", err);
                setError(t("classes.error"));
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [t]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <LoadingSpinner label={t("classes.loading")} size="lg" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        {t("classes.title")}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t("classes.subtitle")}
                    </p>
                </header>

                {error ? (
                    <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl text-center max-w-md mx-auto">
                        {error}
                    </div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <FaGraduationCap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t("classes.noClasses")}</h3>
                        <p className="text-gray-500">{t("classes.noClassesSub")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {classes.map((cls) => (
                            <Link
                                key={cls.id}
                                href={`/classes/${cls.id}`}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                            >
                                <div className="aspect-video relative overflow-hidden bg-gray-100">
                                    <ChapterPlaceholder title={cls.name} type="class" />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight uppercase tracking-tight">
                                        {cls.name}
                                    </h2>

                                    <p className="text-gray-600 line-clamp-3 mb-6 flex-grow leading-relaxed font-medium text-sm">
                                        {cls.description || t("classes.fallbackDesc")}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all duration-300">
                                            {t("classes.exploreSubjects")} <FaChevronRight size={12} />
                                        </div>
                                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            <FaGraduationCap size={18} />
                                        </div>
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

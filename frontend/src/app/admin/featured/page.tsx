"use client";

import { useEffect, useState } from "react";
import {
    getFeaturedChapters,
    getAllChapters,
    addFeaturedChapter,
    removeFeaturedChapter,
} from "@/lib/admin";
import {
    FeaturedChapterResponseDto,
    ChapterResponseDto,
    ChapterStatus,
} from "@/types";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiPlus, HiTrash, HiStar } from "react-icons/hi";

export default function FeaturedChaptersPage() {
    const [featuredChapters, setFeaturedChapters] = useState<
        FeaturedChapterResponseDto[]
    >([]);
    const [availableChapters, setAvailableChapters] = useState<
        ChapterResponseDto[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [featuredRes, allChaptersRes] = await Promise.all([
                getFeaturedChapters(),
                getAllChapters(),
            ]);

            const featured = featuredRes.data;
            const all = allChaptersRes.data;

            setFeaturedChapters(featured);

            // Filter available: Must be PUBLISHED and NOT already featured
            const featuredIds = new Set(featured.map((fc) => fc.chapterId));
            const available = all.filter(
                (c) =>
                    c.status === ChapterStatus.PUBLISHED && !featuredIds.has(c.id)
            );

            setAvailableChapters(available);
        } catch (error: any) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load chapters");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (chapter: ChapterResponseDto) => {
        setActionLoading(chapter.id);
        try {
            await addFeaturedChapter(chapter.id);
            toast.success("Chapter added to featured list");
            await fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Failed to add featured chapter"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (chapter: FeaturedChapterResponseDto) => {
        if (
            !confirm(
                `Are you sure you want to remove "${chapter.title}" from featured?`
            )
        )
            return;

        setActionLoading(chapter.chapterId);
        try {
            await removeFeaturedChapter(chapter.chapterId);
            toast.success("Chapter removed from featured list");
            await fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                "Failed to remove featured chapter"
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <HiStar className="w-8 h-8 text-yellow-500 mr-2" />
                Featured Chapters Management
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Featured List */}
                <div className="bg-white rounded-lg shadow p-6 border border-yellow-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <HiStar className="w-5 h-5 text-yellow-500 mr-2" />
                        Featured Chapters ({featuredChapters.length})
                    </h2>

                    {featuredChapters.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            No chapters featured yet. Add some from the right.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {featuredChapters.map((chapter) => (
                                <div
                                    key={chapter.id}
                                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-100 rounded-lg hover:bg-yellow-100 transition-colors"
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {chapter.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">
                                            {chapter.description}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleRemove(chapter)}
                                        isLoading={actionLoading === chapter.chapterId}
                                        className="shrink-0"
                                    >
                                        <HiTrash className="w-4 h-4 mr-1" />
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Available List */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <HiPlus className="w-5 h-5 text-primary-500 mr-2" />
                        Available to Feature ({availableChapters.length})
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Only PUBLISHED chapters are shown here.
                    </p>

                    {availableChapters.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            No available chapters to feature.
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {availableChapters.map((chapter) => (
                                <div
                                    key={chapter.id}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {chapter.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {chapter.subjectName || `Subject ${chapter.subjectId}`}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAdd(chapter)}
                                        isLoading={actionLoading === chapter.id}
                                        className="shrink-0"
                                    >
                                        <HiPlus className="w-4 h-4 mr-1" />
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

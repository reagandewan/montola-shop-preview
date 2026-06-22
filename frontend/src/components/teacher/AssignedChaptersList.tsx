"use client";

import { useRouter } from "next/navigation";
import { ChapterResponseDto, ChapterStatus } from "@/types";
import { HiBookOpen, HiArrowRight } from "react-icons/hi";

interface AssignedChaptersListProps {
    chapters: ChapterResponseDto[];
    loading?: boolean;
}

export default function AssignedChaptersList({
    chapters,
    loading = false,
}: AssignedChaptersListProps) {
    const router = useRouter();

    const getStatusBadge = (status: ChapterStatus) => {
        const badges = {
            [ChapterStatus.DRAFT]: "bg-yellow-100 text-yellow-800",
            [ChapterStatus.PUBLISHED]: "bg-green-100 text-green-800",
            [ChapterStatus.ARCHIVED]: "bg-gray-100 text-gray-800",
        };
        return badges[status] || badges[ChapterStatus.DRAFT];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chapters...</p>
                </div>
            </div>
        );
    }

    if (chapters.length === 0) {
        return (
            <div className="text-center py-12">
                <HiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No assigned chapters yet.</p>
                <p className="text-gray-500 text-sm mt-2">
                    Chapters will appear here once they are assigned to you.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
                <div
                    key={chapter.id}
                    onClick={() => router.push(`/teacher/chapters/${chapter.id}`)}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex-1">
                            {chapter.title}
                        </h3>
                        <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                                chapter.status
                            )}`}
                        >
                            {chapter.status}
                        </span>
                    </div>

                    {chapter.subjectName && (
                        <p className="text-sm text-gray-600 mb-2">
                            Subject: <span className="font-medium">{chapter.subjectName}</span>
                        </p>
                    )}

                    {chapter.description && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                            {chapter.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            {chapter.free ? (
                                <span className="text-green-600 font-medium">Free</span>
                            ) : (
                                <span>৳{chapter.price || 0}</span>
                            )}
                        </div>
                        <div className="flex items-center text-primary-600 hover:text-primary-700">
                            <span className="text-sm font-medium mr-1">View Details</span>
                            <HiArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

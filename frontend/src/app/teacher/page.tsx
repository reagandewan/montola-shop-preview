"use client";

import { useEffect, useState } from "react";
import { getAssignedChapters } from "@/lib/teacher";
import { ChapterResponseDto } from "@/types";
import { toast } from "react-toastify";
import AssignedChaptersList from "@/components/teacher/AssignedChaptersList";

export default function TeacherDashboardPage() {
    const [chapters, setChapters] = useState<ChapterResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignedChapters();
    }, []);

    const fetchAssignedChapters = async () => {
        try {
            setLoading(true);
            const res = await getAssignedChapters();
            setChapters(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load assigned chapters");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h1>
                <p className="text-gray-600">
                    Manage your assigned chapters and create content for your students.
                </p>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Chapters</h2>
                <AssignedChaptersList chapters={chapters} loading={loading} />
            </div>
        </div>
    );
}

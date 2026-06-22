"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    getClassById,
    getClassStructure,
    updateClass,
} from "@/lib/admin";
import {
    ClassResponseDto,
    ClassStructureResponseDto,
    ClassRequestDto,
} from "@/types";
import ClassForm from "@/components/admin/ClassForm";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiArrowLeft, HiPencil } from "react-icons/hi";

export default function ClassDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [classData, setClassData] = useState<ClassResponseDto | null>(null);
    const [structure, setStructure] = useState<ClassStructureResponseDto | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchClassData();
        fetchStructure();
    }, [id]);

    const fetchClassData = async () => {
        try {
            const res = await getClassById(id);
            setClassData(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load class");
            router.push("/admin/classes");
        } finally {
            setLoading(false);
        }
    };

    const fetchStructure = async () => {
        try {
            const res = await getClassStructure(id);
            setStructure(res.data);
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleSubmit = async (data: ClassRequestDto) => {
        setIsSubmitting(true);
        try {
            await updateClass(id, data);
            toast.success("Class updated successfully");
            setIsEditing(false);
            fetchClassData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update class");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading class details...</p>
                </div>
            </div>
        );
    }

    if (!classData) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push("/admin/classes")}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {classData.name}
                    </h1>
                </div>
                {!isEditing && (
                    <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                    >
                        <HiPencil className="w-5 h-5 inline-block mr-1" />
                        Edit Class
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <ClassForm
                        initialData={classData}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsEditing(false)}
                        isLoading={isSubmitting}
                    />
                </div>
            ) : (
                <>
                    {/* Class Details */}
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Class Details
                        </h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {classData.id}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {classData.name}
                                </dd>
                            </div>
                            {classData.description && (
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Description
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {classData.description}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Class Structure */}
                    {structure && (
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Class Structure
                            </h2>
                            {structure.subjects.length === 0 ? (
                                <p className="text-gray-600">
                                    No subjects in this class yet.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {structure.subjects.map((subject) => (
                                        <div
                                            key={subject.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <h3 className="font-semibold text-gray-800 mb-2">
                                                {subject.name}
                                            </h3>
                                            {subject.chapters.length === 0 ? (
                                                <p className="text-sm text-gray-600">
                                                    No chapters in this subject.
                                                </p>
                                            ) : (
                                                <ul className="list-disc list-inside space-y-1 ml-4">
                                                    {subject.chapters.map(
                                                        (chapter) => (
                                                            <li
                                                                key={chapter.id}
                                                                className="text-sm text-gray-700"
                                                            >
                                                                {chapter.title}
                                                                <span
                                                                    className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                                        chapter.status ===
                                                                        "PUBLISHED"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : chapter.status ===
                                                                              "DRAFT"
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : "bg-gray-100 text-gray-800"
                                                                    }`}
                                                                >
                                                                    {chapter.status}
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

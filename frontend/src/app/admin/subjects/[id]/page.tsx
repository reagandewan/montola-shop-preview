"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    getSubjectById,
    getSubjectStructure,
    updateSubject,
} from "@/lib/admin";
import {
    SubjectResponseDto,
    SubjectStructureResponseDto,
    SubjectRequestDto,
} from "@/types";
import SubjectForm from "@/components/admin/SubjectForm";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiArrowLeft, HiPencil } from "react-icons/hi";

export default function SubjectDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [subjectData, setSubjectData] = useState<SubjectResponseDto | null>(
        null
    );
    const [structure, setStructure] = useState<SubjectStructureResponseDto | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSubjectData();
        fetchStructure();
    }, [id]);

    const fetchSubjectData = async () => {
        try {
            const res = await getSubjectById(id);
            setSubjectData(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load subject");
            router.push("/admin/subjects");
        } finally {
            setLoading(false);
        }
    };

    const fetchStructure = async () => {
        try {
            const res = await getSubjectStructure(id);
            setStructure(res.data);
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleSubmit = async (data: SubjectRequestDto) => {
        setIsSubmitting(true);
        try {
            await updateSubject(id, data);
            toast.success("Subject updated successfully");
            setIsEditing(false);
            fetchSubjectData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update subject");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading subject details...</p>
                </div>
            </div>
        );
    }

    if (!subjectData) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push("/admin/subjects")}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {subjectData.name}
                    </h1>
                </div>
                {!isEditing && (
                    <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                    >
                        <HiPencil className="w-5 h-5 inline-block mr-1" />
                        Edit Subject
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <SubjectForm
                        initialData={subjectData}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsEditing(false)}
                        isLoading={isSubmitting}
                    />
                </div>
            ) : (
                <>
                    {/* Subject Details */}
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Subject Details
                        </h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {subjectData.id}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {subjectData.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Class ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {subjectData.classId}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Order Index
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {subjectData.orderIndex || 0}
                                </dd>
                            </div>
                            {subjectData.description && (
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Description
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {subjectData.description}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Subject Structure */}
                    {structure && (
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Subject Structure
                            </h2>
                            {structure.chapters.length === 0 ? (
                                <p className="text-gray-600">
                                    No chapters in this subject yet.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {structure.chapters.map((chapter) => (
                                        <div
                                            key={chapter.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-800">
                                                    {chapter.title}
                                                </h3>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${
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
                                            </div>
                                            {chapter.topics && chapter.topics.length > 0 && (
                                                <div className="ml-4 mt-2">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                                        Topics:
                                                    </p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {chapter.topics.map((topic) => (
                                                            <li
                                                                key={topic.id}
                                                                className="text-sm text-gray-600"
                                                            >
                                                                {topic.title}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
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

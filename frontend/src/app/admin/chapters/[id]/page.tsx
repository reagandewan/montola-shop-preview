"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    getChapterById,
    getChapterStructure,
    updateChapter,
    updateChapterStatus,
    toggleChapterFreeStatus,
    uploadChapterCoverImage,
    getChapterCoverImage,
} from "@/lib/admin";
import {
    ChapterResponseDto,
    ChapterStructureResponseDto,
    ChapterRequestDto,
    ChapterStatus,
} from "@/types";
import ChapterForm from "@/components/admin/ChapterForm";
import StatusToggle from "@/components/admin/StatusToggle";
import TeacherAssignment from "@/components/admin/TeacherAssignment";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiArrowLeft, HiPencil, HiCloudUpload, HiExternalLink } from "react-icons/hi";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";

export default function ChapterDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [chapterData, setChapterData] = useState<ChapterResponseDto | null>(
        null
    );
    const [structure, setStructure] = useState<ChapterStructureResponseDto | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "status" | "teachers" | "image" | "structure">("details");
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [coverImageLoading, setCoverImageLoading] = useState(false);
    const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);

    useEffect(() => {
        fetchChapterData();
        fetchStructure();
    }, [id]);

    useEffect(() => {
        // Only fetch when user navigates to the image tab
        if (activeTab === "image") {
            fetchCoverImage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, id]);

    useEffect(() => {
        // cleanup object URL on unmount / change
        return () => {
            if (coverImageUrl) URL.revokeObjectURL(coverImageUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coverImageUrl]);

    const fetchChapterData = async () => {
        try {
            const res = await getChapterById(id);
            setChapterData(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load chapter");
            router.push("/admin/chapters");
        } finally {
            setLoading(false);
        }
    };

    const fetchStructure = async () => {
        try {
            const res = await getChapterStructure(id);
            setStructure(res.data);
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleSubmit = async (data: ChapterRequestDto) => {
        setIsSubmitting(true);
        try {
            await updateChapter(id, data);
            toast.success("Chapter updated successfully");
            setIsEditing(false);
            fetchChapterData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update chapter");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (status: ChapterStatus) => {
        await updateChapterStatus(id, status);
        toast.success("Status updated successfully");
        fetchChapterData();
    };

    const handleFreeStatusToggle = async (isFree: boolean) => {
        try {
            await toggleChapterFreeStatus(id, isFree);
            toast.success("Free status updated successfully");
            fetchChapterData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update free status");
        }
    };

    const fetchCoverImage = async () => {
        setCoverImageLoading(true);
        try {
            const res = await getChapterCoverImage(id);
            const blob = res.data as Blob;
            if (!blob || blob.size === 0) {
                setCoverImageUrl(null);
                return;
            }
            if (coverImageUrl) URL.revokeObjectURL(coverImageUrl);
            setCoverImageUrl(URL.createObjectURL(blob));
        } catch (err) {
            // If the backend returns 404/no image, keep it silent
            setCoverImageUrl(null);
        } finally {
            setCoverImageLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadChapterCoverImage(id, file);
            toast.success("Cover image uploaded successfully");
            setLastUploadedFileName(file.name);
            await fetchCoverImage();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to upload image");
        } finally {
            // allow selecting same file again
            e.target.value = "";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chapter details...</p>
                </div>
            </div>
        );
    }

    if (!chapterData) {
        return null;
    }

    const tabs = [
        { id: "details", label: "Details" },
        { id: "status", label: "Status" },
        { id: "teachers", label: "Teachers" },
        { id: "image", label: "Cover Image" },
        { id: "structure", label: "Content" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push("/admin/chapters")}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {chapterData.title}
                    </h1>
                </div>
                {activeTab === "details" && !isEditing && (
                    <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                    >
                        <HiPencil className="w-5 h-5 inline-block mr-1" />
                        Edit Details
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setIsEditing(false);
                            }}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                {activeTab === "details" && (
                    <>
                        {isEditing ? (
                            <ChapterForm
                                initialData={chapterData}
                                onSubmit={handleSubmit}
                                onCancel={() => setIsEditing(false)}
                                isLoading={isSubmitting}
                            />
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    Chapter Details
                                </h2>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            ID
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {chapterData.id}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Title
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {chapterData.title}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Subject ID
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {chapterData.subjectId}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Order Index
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {chapterData.orderIndex || 0}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Price
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {chapterData.free ? (
                                                <span className="text-green-600 font-medium">Free</span>
                                            ) : (
                                                `৳${chapterData.price || 0}`
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Status
                                        </dt>
                                        <dd className="mt-1">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${chapterData.status === "PUBLISHED"
                                                    ? "bg-green-100 text-green-800"
                                                    : chapterData.status === "DRAFT"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {chapterData.status}
                                            </span>
                                        </dd>
                                    </div>
                                    {chapterData.videoId && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Video ID
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {chapterData.videoId}
                                            </dd>
                                        </div>
                                    )}
                                    {chapterData.description && (
                                        <div className="md:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500">
                                                Description
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {chapterData.description}
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-700">
                                                Free Status:
                                            </span>
                                            {chapterData.free ? (
                                                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                                                    Free
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                                                    Paid
                                                </span>
                                            )}

                                            {chapterData.free ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFreeStatusToggle(false)}
                                                >
                                                    Make Paid
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleFreeStatusToggle(true)}
                                                >
                                                    Make Free
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "status" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Status Management
                        </h2>
                        <StatusToggle
                            currentStatus={chapterData.status}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                )}

                {activeTab === "teachers" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Teacher Assignment
                        </h2>
                        <TeacherAssignment
                            chapterId={id}
                            assignedTeachers={chapterData.teachers || []}
                            onUpdate={fetchChapterData}
                        />
                    </div>
                )}

                {activeTab === "image" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Cover Image Upload
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800">Current Cover</h3>
                                    <button
                                        type="button"
                                        onClick={fetchCoverImage}
                                        className="text-sm text-primary-600 hover:underline"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {coverImageLoading ? (
                                    <div className="flex items-center justify-center aspect-video bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                    </div>
                                ) : coverImageUrl ? (
                                    <div className="space-y-3">
                                        <div className="aspect-video relative overflow-hidden rounded-lg border border-gray-200">
                                            <img
                                                src={coverImageUrl}
                                                alt="Chapter cover"
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        </div>
                                        <a
                                            href={coverImageUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center text-sm text-primary-600 hover:underline"
                                        >
                                            Open full size <HiExternalLink className="ml-1 w-4 h-4" />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative">
                                        <ChapterPlaceholder
                                            title={chapterData.title}
                                            subjectName={chapterData.subjectName}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <HiCloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">
                                    Upload a cover image for this chapter
                                </p>
                                {lastUploadedFileName && (
                                    <p className="text-sm text-gray-500 mb-4">
                                        Last uploaded: <span className="font-medium">{lastUploadedFileName}</span>
                                    </p>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="cover-image-upload"
                                />
                                <label
                                    htmlFor="cover-image-upload"
                                    className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
                                >
                                    Choose Image
                                </label>

                                {/* Upload Guidelines */}
                                <div className="mt-6 text-left bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Image Guidelines</p>
                                    <ul className="text-xs text-gray-500 space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary-500 font-bold mt-0.5">•</span>
                                            <span><span className="font-semibold text-gray-600">Recommended size:</span> 1280 × 720 px (16:9 ratio)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary-500 font-bold mt-0.5">•</span>
                                            <span><span className="font-semibold text-gray-600">Formats:</span> JPG, PNG, or WebP</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary-500 font-bold mt-0.5">•</span>
                                            <span><span className="font-semibold text-gray-600">Max file size:</span> 500 KB</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary-500 font-bold mt-0.5">•</span>
                                            <span>Use landscape orientation — portrait images will be cropped</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "structure" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Chapter Structure
                        </h2>
                        {!structure || structure.topics.length === 0 ? (
                            <p className="text-gray-600">
                                No topics in this chapter yet.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {structure.topics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <h3 className="font-semibold text-gray-800 mb-2">
                                            {topic.title}
                                        </h3>
                                        {topic.contentItems && topic.contentItems.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-1 ml-4">
                                                {topic.contentItems.map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="text-sm text-gray-700"
                                                    >
                                                        {item.title}
                                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                                            {item.type}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                No content items in this topic.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

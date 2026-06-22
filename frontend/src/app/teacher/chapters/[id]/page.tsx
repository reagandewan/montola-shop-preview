"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    getChapterById,
    getChapterStructure,
    updateChapter,
    uploadChapterCoverImage,
    getChapterCoverImage,
    createTopic,
    updateTopic,
    deleteTopic,
    createLecture,
    createPdf,
    createQuiz,
    getContentById,
    updateLectureByContentItem,
    updatePdfByContentItem,
    updateQuizMetadata,
    updateQuizQuestions,
    deleteLectureByContentItem,
    deletePdfByContentItem,
    deleteQuizByContentItem,
} from "@/lib/teacher";
import {
    ChapterResponseDto,
    ChapterStructureResponseDto,
    ChapterRequestDto,
    TopicRequestDto,
    ContentItemType,
    LectureRequestDto,
    GooglePdfContentRequestDto,
    QuizRequestDto,
} from "@/types";
import ChapterForm from "@/components/admin/ChapterForm";
import ChapterTreeView from "@/components/teacher/ChapterTreeView";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiArrowLeft, HiPencil, HiCloudUpload, HiExternalLink } from "react-icons/hi";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";

export default function TeacherChapterDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [chapterData, setChapterData] = useState<ChapterResponseDto | null>(null);
    const [structure, setStructure] = useState<ChapterStructureResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "image" | "structure">("details");
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [coverImageLoading, setCoverImageLoading] = useState(false);
    const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);

    useEffect(() => {
        fetchChapterData();
        fetchStructure();
    }, [id]);

    useEffect(() => {
        if (activeTab === "image") {
            fetchCoverImage();
        }
    }, [activeTab, id]);

    useEffect(() => {
        return () => {
            if (coverImageUrl) URL.revokeObjectURL(coverImageUrl);
        };
    }, [coverImageUrl]);

    const fetchChapterData = async () => {
        try {
            const res = await getChapterById(id);
            setChapterData(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load chapter");
            router.push("/teacher");
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
            e.target.value = "";
        }
    };

    const handleTopicCreate = async (data: TopicRequestDto) => {
        await createTopic(data);
        toast.success("Topic created successfully");
        await fetchStructure();
    };

    const handleTopicUpdate = async (topicId: number, data: TopicRequestDto) => {
        await updateTopic(topicId, data);
        toast.success("Topic updated successfully");
        await fetchStructure();
    };

    const handleTopicDelete = async (topicId: number) => {
        await deleteTopic(topicId);
        toast.success("Topic deleted successfully");
        await fetchStructure();
    };

    const handleContentCreate = async (type: ContentItemType, data: any) => {
        try {
            switch (type) {
                case ContentItemType.LECTURE:
                    await createLecture(data as LectureRequestDto);
                    break;
                case ContentItemType.PDF:
                    await createPdf(data as GooglePdfContentRequestDto);
                    break;
                case ContentItemType.QUIZ:
                    await createQuiz(data as QuizRequestDto);
                    break;
            }
            toast.success(`${type} created successfully`);
            await fetchStructure();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to create ${type}`);
            throw err;
        }
    };


    const handleContentUpdate = async (
        contentId: number,
        type: ContentItemType,
        data: any,
    ) => {
        try {
            if (type === ContentItemType.LECTURE) {
                await updateLectureByContentItem(
                    contentId,
                    data as LectureRequestDto,
                );
            } else if (type === ContentItemType.PDF) {
                await updatePdfByContentItem(
                    contentId,
                    data as GooglePdfContentRequestDto,
                );
            } else if (type === ContentItemType.QUIZ) {
                const quizData = data as QuizRequestDto;
                // Fetch the content first to get the Quiz ID
                const currentContent = await getContentById(contentId);
                const quizId = currentContent.data.id;

                await updateQuizMetadata(quizId, quizData);
                if (quizData.questions) {
                    await updateQuizQuestions(
                        quizId,
                        quizData.questions,
                    );
                }
            }
            toast.success(`${type} updated successfully`);
            await fetchStructure();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to update ${type}`);
            throw err;
        }
    };

    const handleContentDelete = async (
        contentId: number,
        type: ContentItemType,
    ) => {
        try {
            if (type === ContentItemType.LECTURE) {
                await deleteLectureByContentItem(contentId);
            } else if (type === ContentItemType.PDF) {
                await deletePdfByContentItem(contentId);
            } else if (type === ContentItemType.QUIZ) {
                await deleteQuizByContentItem(contentId);
            }
            toast.success(`${type} deleted successfully`);
            await fetchStructure();
        } catch (err: any) {
            console.error(err);
            toast.error(
                err.response?.data?.message || `Failed to delete ${type}`,
            );
        }
    };

    const getContentData = async (contentId: number) => {
        try {
            const res = await getContentById(contentId);
            return res.data;
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load content data");
            throw err;
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
        { id: "image", label: "Cover Image" },
        { id: "structure", label: "Content" },
    ];

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            PUBLISHED: "bg-green-100 text-green-800",
            DRAFT: "bg-yellow-100 text-yellow-800",
            ARCHIVED: "bg-gray-100 text-gray-800",
        };
        return badges[status] || badges.DRAFT;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push("/teacher")}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">{chapterData.title}</h1>
                </div>
                {activeTab === "details" && !isEditing && (
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
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
                                hideStatus={true}
                            />
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    Chapter Details
                                </h2>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{chapterData.id}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Title</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{chapterData.title}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Subject ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {chapterData.subjectId}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Order Index</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {chapterData.orderIndex || 0}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Price</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {chapterData.free ? (
                                                <span className="text-green-600 font-medium">Free</span>
                                            ) : (
                                                `৳${chapterData.price || 0}`
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                                                    chapterData.status
                                                )}`}
                                            >
                                                {chapterData.status}
                                            </span>
                                        </dd>
                                    </div>
                                    {chapterData.videoId && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Video ID</dt>
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
                            </div>
                        )}
                    </>
                )}

                {activeTab === "image" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Cover Image Upload</h2>
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
                                        Last uploaded:{" "}
                                        <span className="font-medium">{lastUploadedFileName}</span>
                                    </p>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
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
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "structure" && structure && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Chapter Structure</h2>
                        <ChapterTreeView
                            structure={structure}
                            onTopicCreate={handleTopicCreate}
                            onTopicUpdate={handleTopicUpdate}
                            onTopicDelete={handleTopicDelete}
                            onContentCreate={handleContentCreate}
                            onContentUpdate={handleContentUpdate}
                            onContentDelete={handleContentDelete}
                            getContentData={getContentData}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

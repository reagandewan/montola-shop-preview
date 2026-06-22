"use client";

import { useState } from "react";
import {
    ChapterStructureResponseDto,
    TopicStructureResponseDto,
    TopicResponseDto,
    ContentItemStructureResponseDto,
    ContentItemType,
} from "@/types";
import { getTopicById } from "@/lib/teacher";
import { HiChevronDown, HiChevronRight, HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TopicForm from "./TopicForm";
import ContentForm from "./ContentForm";
import Button from "@/components/ui/Button";

interface ChapterTreeViewProps {
    structure: ChapterStructureResponseDto;
    onTopicCreate: (data: any) => Promise<void>;
    onTopicUpdate: (id: number, data: any) => Promise<void>;
    onTopicDelete: (id: number) => Promise<void>;
    onContentCreate: (type: ContentItemType, data: any) => Promise<void>;
    onContentUpdate?: (id: number, type: ContentItemType, data: any) => Promise<void>;
    onContentDelete: (id: number, type: ContentItemType) => Promise<void>;
    getContentData?: (id: number) => Promise<any>;
}

export default function ChapterTreeView({
    structure,
    onTopicCreate,
    onTopicUpdate,
    onTopicDelete,
    onContentCreate,
    onContentUpdate,
    onContentDelete,
    getContentData,
}: ChapterTreeViewProps) {
    const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<TopicResponseDto | null>(null);
    const [isLoadingTopic, setIsLoadingTopic] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [selectedContentType, setSelectedContentType] = useState<ContentItemType | null>(null);
    const [editingContent, setEditingContent] = useState<ContentItemStructureResponseDto | null>(null);
    const [contentData, setContentData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    const toggleTopic = (topicId: number) => {
        const newExpanded = new Set(expandedTopics);
        if (newExpanded.has(topicId)) {
            newExpanded.delete(topicId);
        } else {
            newExpanded.add(topicId);
        }
        setExpandedTopics(newExpanded);
    };

    const handleAddTopic = () => {
        setEditingTopic(null);
        setIsTopicModalOpen(true);
    };

    const handleEditTopic = async (topic: TopicStructureResponseDto) => {
        setIsLoadingTopic(true);
        try {
            const res = await getTopicById(topic.id);
            setEditingTopic(res.data);
            setIsTopicModalOpen(true);
        } catch (err) {
            console.error("Failed to load topic:", err);
        } finally {
            setIsLoadingTopic(false);
        }
    };

    const handleDeleteTopic = async (topicId: number) => {
        if (confirm("Are you sure you want to delete this topic? This will also delete all content in this topic.")) {
            await onTopicDelete(topicId);
        }
    };

    const handleAddContent = (topicId: number) => {
        setSelectedTopicId(topicId);
        setEditingContent(null);
        setContentData(null);
        setIsContentModalOpen(true);
    };

    const handleEditContent = async (content: ContentItemStructureResponseDto) => {
        setEditingContent(content);
        setSelectedTopicId(null); // Will be set from content data
        setIsLoadingContent(true);
        try {
            if (getContentData) {
                const data = await getContentData(content.id);
                setContentData(data);
                setSelectedContentType(content.type);
            } else {
                setSelectedContentType(content.type);
            }
            setIsContentModalOpen(true);
        } catch (err) {
            console.error("Failed to load content data:", err);
        } finally {
            setIsLoadingContent(false);
        }
    };

    const handleDeleteContent = async (content: ContentItemStructureResponseDto) => {
        if (confirm("Are you sure you want to delete this content?")) {
            await onContentDelete(content.id, content.type);
        }
    };

    const handleTopicSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingTopic) {
                await onTopicUpdate(editingTopic.id, data);
            } else {
                await onTopicCreate(data);
            }
            setIsTopicModalOpen(false);
            setEditingTopic(null);
        } catch (err) {
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContentSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingContent && selectedContentType && onContentUpdate) {
                await onContentUpdate(editingContent.id, selectedContentType, data);
            } else if (selectedTopicId && selectedContentType) {
                await onContentCreate(selectedContentType, data);
            }
            setIsContentModalOpen(false);
            setEditingContent(null);
            setSelectedTopicId(null);
            setSelectedContentType(null);
            setContentData(null);
        } catch (err) {
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const getContentTypeBadge = (type: ContentItemType) => {
        const badges = {
            [ContentItemType.LECTURE]: "bg-blue-100 text-blue-800",
            [ContentItemType.QUIZ]: "bg-purple-100 text-purple-800",
            [ContentItemType.PDF]: "bg-red-100 text-red-800",
            [ContentItemType.ASSIGNMENT]: "bg-green-100 text-green-800",
        };
        return badges[type] || "bg-gray-100 text-gray-800";
    };

    const contentTypeOptions = [
        { value: ContentItemType.LECTURE, label: "Lecture" },
        { value: ContentItemType.PDF, label: "PDF" },
        { value: ContentItemType.QUIZ, label: "Quiz" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Chapter Structure</h3>
                <Button variant="primary" size="sm" onClick={handleAddTopic}>
                    <HiPlus className="w-4 h-4 inline-block mr-1" />
                    Add Topic
                </Button>
            </div>

            {structure.topics && structure.topics.length > 0 ? (
                <div className="space-y-2">
                    {structure.topics.map((topic) => (
                        <div key={topic.id} className="border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                <div className="flex items-center space-x-2 flex-1">
                                    <button
                                        onClick={() => toggleTopic(topic.id)}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        {expandedTopics.has(topic.id) ? (
                                            <HiChevronDown className="w-5 h-5" />
                                        ) : (
                                            <HiChevronRight className="w-5 h-5" />
                                        )}
                                    </button>
                                    <h4 className="font-semibold text-gray-800">{topic.title}</h4>
                                    <span className="text-sm text-gray-500">
                                        ({topic.contentItems?.length || 0} items)
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleAddContent(topic.id)}
                                        className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                        title="Add Content"
                                    >
                                        <HiPlus className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleEditTopic(topic)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit Topic"
                                    >
                                        <HiPencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTopic(topic.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Topic"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {expandedTopics.has(topic.id) && topic.contentItems && topic.contentItems.length > 0 && (
                                <div className="p-4 space-y-2">
                                    {topic.contentItems.map((content) => (
                                        <div
                                            key={content.id}
                                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded"
                                        >
                                            <div className="flex items-center space-x-3 flex-1">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${getContentTypeBadge(
                                                        content.type
                                                    )}`}
                                                >
                                                    {content.type}
                                                </span>
                                                <span className="text-gray-800">{content.title}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditContent(content)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit Content"
                                                >
                                                    <HiPencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContent(content)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Content"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>No topics yet. Click &quot;Add Topic&quot; to get started.</p>
                </div>
            )}

            {/* Topic Modal */}
            <Modal
                isOpen={isTopicModalOpen}
                onClose={() => {
                    setIsTopicModalOpen(false);
                    setEditingTopic(null);
                }}
                title={editingTopic ? "Edit Topic" : "Add Topic"}
                size="lg"
            >
                <TopicForm
                    chapterId={structure.id}
                    initialData={editingTopic || undefined}
                    onSubmit={handleTopicSubmit}
                    onCancel={() => {
                        setIsTopicModalOpen(false);
                        setEditingTopic(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Content Modal */}
            <Modal
                isOpen={isContentModalOpen}
                onClose={() => {
                    setIsContentModalOpen(false);
                    setEditingContent(null);
                    setSelectedTopicId(null);
                    setSelectedContentType(null);
                    setContentData(null);
                }}
                title={
                    editingContent
                        ? `Edit ${editingContent.type}`
                        : selectedContentType
                            ? `Add ${selectedContentType}`
                            : "Add Content"
                }
                size="lg"
            >
                {isLoadingContent ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                ) : !selectedContentType && !editingContent ? (
                    <div className="space-y-4">
                        <Select
                            label="Content Type"
                            required
                            value=""
                            onChange={(e) => {
                                setSelectedContentType(e.target.value as ContentItemType);
                                setSelectedTopicId(selectedTopicId || null);
                            }}
                            options={contentTypeOptions}
                            placeholder="Select content type"
                        />
                    </div>
                ) : selectedContentType ? (
                    <ContentForm
                        contentType={selectedContentType}
                        topicId={selectedTopicId || contentData?.topicId || 0}
                        initialData={contentData}
                        onSubmit={handleContentSubmit}
                        onCancel={() => {
                            setIsContentModalOpen(false);
                            setEditingContent(null);
                            setSelectedTopicId(null);
                            setSelectedContentType(null);
                            setContentData(null);
                        }}
                        isLoading={isSubmitting}
                    />
                ) : null}
            </Modal>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { ChapterRequestDto, ChapterResponseDto, ChapterStatus } from "@/types";
import { getAllSubjects } from "@/lib/admin";
import { SubjectResponseDto } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

interface ChapterFormProps {
    initialData?: ChapterResponseDto;
    onSubmit: (data: ChapterRequestDto) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    hideStatus?: boolean;
}

export default function ChapterForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    hideStatus = false,
}: ChapterFormProps) {
    const isEditing = !!initialData;

    const [formData, setFormData] = useState<ChapterRequestDto>({
        subjectId: initialData?.subjectId || 0,
        title: initialData?.title || "",
        description: initialData?.description || "",
        status: initialData?.status || ChapterStatus.DRAFT,
        orderIndex: initialData?.orderIndex || 0,
        videoId: initialData?.videoId || "",
        price: initialData?.price || 0,
        free: initialData?.free || false,
    });
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(!isEditing);
    const [errors, setErrors] = useState<{ title?: string; subjectId?: string }>({});

    useEffect(() => {
        if (!isEditing) fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await getAllSubjects();
            setSubjects(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load subjects");
        } finally {
            setLoadingSubjects(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: { title?: string; subjectId?: string } = {};

        if (!isEditing && (!formData.subjectId || formData.subjectId === 0)) {
            newErrors.subjectId = "Please select a subject";
        }

        if (!formData.title || formData.title.trim().length === 0) {
            newErrors.title = "Chapter title is required";
        } else if (formData.title.length > 200) {
            newErrors.title = "Chapter title must be less than 200 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await onSubmit(formData);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to save chapter");
        }
    };

    const statusOptions = [
        { value: ChapterStatus.DRAFT, label: "Draft" },
        { value: ChapterStatus.PUBLISHED, label: "Published" },
        { value: ChapterStatus.ARCHIVED, label: "Archived" },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {isEditing ? (
                <div>
                    <label className="block mb-1 font-semibold text-gray-700 text-sm">Subject</label>
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm">
                        {initialData?.subjectName || `Subject #${initialData?.subjectId}`}
                        <span className="text-xs text-gray-400 ml-2">(cannot be changed)</span>
                    </p>
                </div>
            ) : (
                <Select
                    label="Subject"
                    required
                    value={formData.subjectId}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            subjectId: Number(e.target.value),
                        })
                    }
                    options={subjects.map((subject) => ({
                        value: subject.id,
                        label: `${subject.name} ${subject.className ? `(${subject.className})` : ""}`,
                    }))}
                    error={errors.subjectId}
                    placeholder="Select a subject"
                    disabled={loadingSubjects}
                />
            )}

            <Input
                label="Chapter Title"
                required
                value={formData.title}
                onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                }
                error={errors.title}
                maxLength={200}
                placeholder="Enter chapter title"
            />

            <div>
                <label className="block mb-1 font-semibold text-gray-700">
                    Description
                </label>
                <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter chapter description (optional)"
                />
            </div>

            {!hideStatus && (
                <Select
                    label="Status"
                    value={formData.status || ChapterStatus.DRAFT}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            status: e.target.value as ChapterStatus,
                        })
                    }
                    options={statusOptions}
                />
            )}

            <Input
                label="Order Index"
                type="number"
                value={formData.orderIndex?.toString() || "0"}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        orderIndex: Number(e.target.value) || 0,
                    })
                }
                min={0}
                placeholder="Order index (optional)"
            />

            <Input
                label="Video ID"
                type="text"
                value={formData.videoId || ""}
                onChange={(e) =>
                    setFormData({ ...formData, videoId: e.target.value })
                }
                placeholder="Enter video ID (optional)"
                maxLength={50}
            />

            <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="free"
                        checked={formData.free || false}
                        onChange={(e) =>
                            setFormData({ ...formData, free: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="free" className="ml-2 text-sm font-medium text-gray-700">
                        Free Chapter
                    </label>
                </div>
            </div>

            {!formData.free && (
                <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price?.toString() || "0"}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            price: Number(e.target.value) || 0,
                        })
                    }
                    placeholder="Enter price (optional)"
                />
            )}

            <div className="flex justify-end space-x-3 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {initialData ? "Update Chapter" : "Create Chapter"}
                </Button>
            </div>
        </form>
    );
}

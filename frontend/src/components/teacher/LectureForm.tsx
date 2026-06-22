"use client";

import { useState, useEffect } from "react";
import { LectureRequestDto } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

interface LectureFormProps {
    topicId: number;
    initialData?: any; // Content response from API
    onSubmit: (data: LectureRequestDto) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function LectureForm({
    topicId,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: LectureFormProps) {
    const [formData, setFormData] = useState<LectureRequestDto>({
        topicId: topicId,
        title: initialData?.title || "",
        videoId: initialData?.videoId || "",
        content: initialData?.content || "",
        orderIndex: initialData?.orderIndex || 0,
    });
    const [errors, setErrors] = useState<{ title?: string; videoId?: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                topicId: topicId,
                title: initialData.title || "",
                videoId: initialData.videoId || "",
                content: initialData.content || "",
                orderIndex: initialData.orderIndex || 0,
            });
        }
    }, [initialData, topicId]);

    const validate = (): boolean => {
        const newErrors: { title?: string; videoId?: string } = {};

        if (!formData.title || formData.title.trim().length === 0) {
            newErrors.title = "Lecture title is required";
        } else if (formData.title.length > 200) {
            newErrors.title = "Lecture title must be less than 200 characters";
        }

        if (formData.videoId && formData.videoId.length > 50) {
            newErrors.videoId = "Video ID must be less than 50 characters";
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
            toast.error(err.response?.data?.message || "Failed to save lecture");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Lecture Title"
                required
                value={formData.title}
                onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                }
                error={errors.title}
                maxLength={200}
                placeholder="Enter lecture title"
            />

            <Input
                label="Video ID"
                value={formData.videoId || ""}
                onChange={(e) =>
                    setFormData({ ...formData, videoId: e.target.value })
                }
                error={errors.videoId}
                maxLength={50}
                placeholder="Enter video ID (optional)"
            />

            <div>
                <label className="block mb-1 font-semibold text-gray-700">
                    Content
                </label>
                <textarea
                    value={formData.content || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={6}
                    placeholder="Enter lecture content (optional)"
                />
            </div>

            <Input
                label="Order Index"
                type="number"
                required
                value={formData.orderIndex.toString()}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        orderIndex: parseInt(e.target.value) || 0,
                    })
                }
                placeholder="Order index"
            />

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
                    {initialData ? "Update Lecture" : "Create Lecture"}
                </Button>
            </div>
        </form>
    );
}

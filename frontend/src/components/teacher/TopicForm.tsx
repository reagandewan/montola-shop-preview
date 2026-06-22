"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TopicRequestDto, TopicResponseDto } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface TopicFormProps {
    chapterId: number;
    initialData?: TopicResponseDto;
    onSubmit: (data: TopicRequestDto) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function TopicForm({
    chapterId,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: TopicFormProps) {
    const [formData, setFormData] = useState<TopicRequestDto>({
        chapterId: (initialData as TopicResponseDto)?.chapterId ?? chapterId,
        title: initialData?.title || "",
        description: initialData?.description || "",
        orderIndex: initialData?.orderIndex ?? 0,
    });
    const [errors, setErrors] = useState<{ title?: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                // Use chapterId from initialData only if present (TopicResponseDto);
                // when editing from tree, initialData is TopicStructureResponseDto which has no chapterId
                chapterId: (initialData as TopicResponseDto).chapterId ?? chapterId,
                title: initialData.title,
                description: (initialData as TopicResponseDto).description || "",
                orderIndex: initialData.orderIndex ?? 0,
            });
        }
    }, [initialData, chapterId]);

    const validate = (): boolean => {
        const newErrors: { title?: string } = {};

        if (!formData.title || formData.title.trim().length === 0) {
            newErrors.title = "Topic title is required";
        } else if (formData.title.length > 200) {
            newErrors.title = "Topic title must be less than 200 characters";
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
            toast.error(err.response?.data?.message || "Failed to save topic");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Topic Title"
                required
                value={formData.title}
                onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                }
                error={errors.title}
                maxLength={200}
                placeholder="Enter topic title"
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
                    placeholder="Enter topic description (optional)"
                />
            </div>

            <Input
                label="Order Index"
                type="number"
                value={formData.orderIndex?.toString() || "0"}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        orderIndex: parseInt(e.target.value) || 0,
                    })
                }
                placeholder="Order index (optional)"
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
                    {initialData ? "Update Topic" : "Create Topic"}
                </Button>
            </div>
        </form>
    );
}

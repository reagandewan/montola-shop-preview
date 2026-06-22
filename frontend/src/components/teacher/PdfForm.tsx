"use client";

import { useState, useEffect } from "react";
import { GooglePdfContentRequestDto } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

interface PdfFormProps {
    topicId: number;
    initialData?: any; // Content response from API
    onSubmit: (data: GooglePdfContentRequestDto) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function PdfForm({
    topicId,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: PdfFormProps) {
    const [formData, setFormData] = useState<GooglePdfContentRequestDto>({
        topicId: topicId,
        title: initialData?.title || "",
        googleFileId: initialData?.googleFileId || "",
        pageCount: initialData?.pageCount || undefined,
        orderIndex: initialData?.orderIndex || 0,
    });
    const [errors, setErrors] = useState<{ title?: string; googleFileId?: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                topicId: topicId,
                title: initialData.title || "",
                googleFileId: initialData.googleFileId || "",
                pageCount: initialData.pageCount || undefined,
                orderIndex: initialData.orderIndex || 0,
            });
        }
    }, [initialData, topicId]);

    const validate = (): boolean => {
        const newErrors: { title?: string; googleFileId?: string } = {};

        if (!formData.title || formData.title.trim().length === 0) {
            newErrors.title = "PDF title is required";
        } else if (formData.title.length > 255) {
            newErrors.title = "PDF title must be less than 255 characters";
        }

        if (!formData.googleFileId || formData.googleFileId.trim().length === 0) {
            newErrors.googleFileId = "Google File ID is required";
        } else if (formData.googleFileId.length > 200) {
            newErrors.googleFileId = "Google File ID must be less than 200 characters";
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
            toast.error(err.response?.data?.message || "Failed to save PDF");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="PDF Title"
                required
                value={formData.title}
                onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                }
                error={errors.title}
                maxLength={255}
                placeholder="Enter PDF title"
            />

            <Input
                label="Google File ID"
                required
                value={formData.googleFileId}
                onChange={(e) =>
                    setFormData({ ...formData, googleFileId: e.target.value })
                }
                error={errors.googleFileId}
                maxLength={200}
                placeholder="Enter Google Drive file ID"
            />

            <Input
                label="Page Count"
                type="number"
                value={formData.pageCount?.toString() || ""}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        pageCount: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                }
                placeholder="Number of pages (optional)"
            />

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
                    {initialData ? "Update PDF" : "Create PDF"}
                </Button>
            </div>
        </form>
    );
}

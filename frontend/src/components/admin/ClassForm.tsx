"use client";

import { useState, useEffect } from "react";
import { ClassRequestDto, ClassResponseDto } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

interface ClassFormProps {
    initialData?: ClassResponseDto;
    onSubmit: (data: ClassRequestDto) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ClassForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: ClassFormProps) {
    const [formData, setFormData] = useState<ClassRequestDto>({
        name: initialData?.name || "",
        description: initialData?.description || "",
    });
    const [errors, setErrors] = useState<{ name?: string }>({});

    const validate = (): boolean => {
        const newErrors: { name?: string } = {};

        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.name = "Class name is required";
        } else if (formData.name.length > 100) {
            newErrors.name = "Class name must be less than 100 characters";
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
            toast.error(err.response?.data?.message || "Failed to save class");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Class Name"
                required
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                error={errors.name}
                maxLength={100}
                placeholder="Enter class name (e.g., Class 6, Class 7)"
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
                    placeholder="Enter class description (optional)"
                />
            </div>

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
                    {initialData ? "Update Class" : "Create Class"}
                </Button>
            </div>
        </form>
    );
}

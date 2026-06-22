"use client";

import { useState, useEffect } from "react";
import { SubjectRequestDto, SubjectResponseDto } from "@/types";
import { getAllClasses } from "@/lib/admin";
import { ClassResponseDto } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

interface SubjectFormProps {
    initialData?: SubjectResponseDto;
    onSubmit: (data: SubjectRequestDto) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function SubjectForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: SubjectFormProps) {
    const isEditing = !!initialData;

    const [formData, setFormData] = useState<SubjectRequestDto>({
        classId: initialData?.classId || 0,
        name: initialData?.name || "",
        description: initialData?.description || "",
        orderIndex: initialData?.orderIndex || 0,
    });
    const [classes, setClasses] = useState<ClassResponseDto[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(!isEditing);
    const [errors, setErrors] = useState<{ name?: string; classId?: string }>({});

    useEffect(() => {
        if (!isEditing) fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await getAllClasses();
            setClasses(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load classes");
        } finally {
            setLoadingClasses(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: { name?: string; classId?: string } = {};

        if (!isEditing && (!formData.classId || formData.classId === 0)) {
            newErrors.classId = "Please select a class";
        }

        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.name = "Subject name is required";
        } else if (formData.name.length > 100) {
            newErrors.name = "Subject name must be less than 100 characters";
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
            toast.error(err.response?.data?.message || "Failed to save subject");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {isEditing ? (
                <div>
                    <label className="block mb-1 font-semibold text-gray-700 text-sm">Class</label>
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm">
                        {initialData?.className || `Class #${initialData?.classId}`}
                        <span className="text-xs text-gray-400 ml-2">(cannot be changed)</span>
                    </p>
                </div>
            ) : (
                <Select
                    label="Class"
                    required
                    value={formData.classId}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            classId: Number(e.target.value),
                        })
                    }
                    options={classes.map((cls) => ({
                        value: cls.id,
                        label: cls.name,
                    }))}
                    error={errors.classId}
                    placeholder="Select a class"
                    disabled={loadingClasses}
                />
            )}

            <Input
                label="Subject Name"
                required
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                error={errors.name}
                maxLength={100}
                placeholder="Enter subject name (e.g., Mathematics, Physics)"
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
                    placeholder="Enter subject description (optional)"
                />
            </div>

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
                    {initialData ? "Update Subject" : "Create Subject"}
                </Button>
            </div>
        </form>
    );
}

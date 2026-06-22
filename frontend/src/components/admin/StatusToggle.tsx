"use client";

import { useState } from "react";
import { ChapterStatus } from "@/types";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

interface StatusToggleProps {
    currentStatus: ChapterStatus;
    onStatusChange: (status: ChapterStatus) => Promise<void>;
    isLoading?: boolean;
}

export default function StatusToggle({
    currentStatus,
    onStatusChange,
    isLoading = false,
}: StatusToggleProps) {
    const [localLoading, setLocalLoading] = useState(false);

    const statusOptions: { value: ChapterStatus; label: string; color: string }[] =
        [
            {
                value: ChapterStatus.DRAFT,
                label: "Draft",
                color: "bg-yellow-100 text-yellow-800",
            },
            {
                value: ChapterStatus.PUBLISHED,
                label: "Published",
                color: "bg-green-100 text-green-800",
            },
            {
                value: ChapterStatus.ARCHIVED,
                label: "Archived",
                color: "bg-gray-100 text-gray-800",
            },
        ];

    const current = statusOptions.find((s) => s.value === currentStatus) ?? statusOptions[0];
    const otherOptions = statusOptions.filter((s) => s.value !== currentStatus);

    const handleStatusChange = async (newStatus: ChapterStatus) => {
        if (newStatus === currentStatus) return;

        setLocalLoading(true);
        try {
            await onStatusChange(newStatus);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${current.color}`}>
                    {current.label}
                </span>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Status
                </label>
                <div className="flex flex-wrap gap-2">
                    {otherOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleStatusChange(option.value)}
                            disabled={isLoading || localLoading}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 ${
                                isLoading || localLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            Set {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

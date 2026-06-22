"use client";

import { useEffect, useState } from "react";
import {
    getTeachersByRole,
    assignTeacherToChapter,
    unassignTeacherFromChapter,
} from "@/lib/admin";
import { TeacherDto, UserRole } from "@/types";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";
import { HiX, HiPlus } from "react-icons/hi";

interface TeacherAssignmentProps {
    chapterId: number;
    assignedTeachers: TeacherDto[];
    onUpdate: () => void;
}

export default function TeacherAssignment({
    chapterId,
    assignedTeachers,
    onUpdate,
}: TeacherAssignmentProps) {
    const [availableTeachers, setAvailableTeachers] = useState<TeacherDto[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | "">("");
    const [loading, setLoading] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const res = await getTeachersByRole(UserRole.TEACHER);
            setAvailableTeachers(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load teachers");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedTeacherId) {
            toast.error("Please select a teacher");
            return;
        }

        setIsAssigning(true);
        try {
            await assignTeacherToChapter(chapterId, selectedTeacherId as number);
            toast.success("Teacher assigned successfully");
            setSelectedTeacherId("");
            onUpdate();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to assign teacher");
        } finally {
            setIsAssigning(false);
        }
    };

    const handleUnassign = async (teacherId: number) => {
        if (!confirm("Are you sure you want to unassign this teacher?")) {
            return;
        }

        try {
            await unassignTeacherFromChapter(chapterId, teacherId);
            toast.success("Teacher unassigned successfully");
            onUpdate();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to unassign teacher");
        }
    };

    // Filter out already assigned teachers
    const unassignedTeachers = availableTeachers.filter(
        (teacher) => !assignedTeachers.some((assigned) => assigned.id === teacher.id)
    );

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Assigned Teachers
                </h3>
                {assignedTeachers.length === 0 ? (
                    <p className="text-gray-600 text-sm">
                        No teachers assigned to this chapter yet.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {assignedTeachers.map((teacher) => (
                            <div
                                key={teacher.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {teacher.fullName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {teacher.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleUnassign(teacher.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Unassign teacher"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Assign New Teacher
                </h3>
                {unassignedTeachers.length === 0 ? (
                    <p className="text-gray-600 text-sm">
                        All available teachers are already assigned to this chapter.
                    </p>
                ) : (
                    <div className="flex items-end space-x-3">
                        <div className="flex-1">
                            <Select
                                label="Select Teacher"
                                value={selectedTeacherId}
                                onChange={(e) =>
                                    setSelectedTeacherId(
                                        e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                    )
                                }
                                options={unassignedTeachers.map((teacher) => ({
                                    value: teacher.id,
                                    label: `${teacher.fullName} (${teacher.email})`,
                                }))}
                                placeholder="Choose a teacher"
                                disabled={loading}
                            />
                        </div>
                        <Button
                            onClick={handleAssign}
                            isLoading={isAssigning}
                            disabled={!selectedTeacherId}
                        >
                            <HiPlus className="w-5 h-5 inline-block mr-1" />
                            Assign
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

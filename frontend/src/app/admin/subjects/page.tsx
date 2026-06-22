"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
} from "@/lib/admin";
import { SubjectResponseDto, SubjectRequestDto } from "@/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import SubjectForm from "@/components/admin/SubjectForm";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiPlus, HiPencil, HiTrash, HiEye } from "react-icons/hi";

export default function SubjectsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<SubjectResponseDto[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | "">("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<SubjectResponseDto | null>(
        null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSubjects();
        
        // Check if we need to open modal for create
        if (searchParams.get("action") === "create") {
            setIsModalOpen(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (selectedClassId === "") {
            setFilteredSubjects(subjects);
            return;
        }

        // Defensive: backend might return classId as string/null depending on serialization
        setFilteredSubjects(
            subjects.filter((s) => Number((s as any).classId) === selectedClassId)
        );
    }, [selectedClassId, subjects]);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await getAllSubjects();
            setSubjects(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };


    const handleCreate = () => {
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const handleEdit = (subject: SubjectResponseDto) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteSubject(id);
            toast.success("Subject deleted successfully");
            fetchSubjects();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to delete subject");
        }
    };

    const handleSubmit = async (data: SubjectRequestDto) => {
        setIsSubmitting(true);
        try {
            if (editingSubject) {
                await updateSubject(editingSubject.id, data);
                toast.success("Subject updated successfully");
            } else {
                await createSubject(data);
                toast.success("Subject created successfully");
            }
            setIsModalOpen(false);
            setEditingSubject(null);
            fetchSubjects();
        } catch (err: any) {
            throw err; // Let form handle the error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubject(null);
        router.replace("/admin/subjects", undefined);
    };

    // Get class name - use className directly from API response
    const getClassName = (subject: SubjectResponseDto) => {
        return subject.className || `Class ${subject.classId}`;
    };

    // Get unique classes from subjects data (using enriched className field)
    const getUniqueClasses = () => {
        const classMap = new Map<number, { id: number; name: string }>();
        subjects.forEach((subject) => {
            if (subject.classId && subject.className) {
                classMap.set(subject.classId, {
                    id: subject.classId,
                    name: subject.className,
                });
            }
        });
        return Array.from(classMap.values());
    };

    const columns: Column<SubjectResponseDto>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
        },
        {
            key: "name",
            header: "Name",
            sortable: true,
        },
        {
            key: "classId",
            header: "Class",
            sortable: true,
            render: (item) => (
                <span className="text-gray-700">{getClassName(item)}</span>
            ),
        },
        {
            key: "orderIndex",
            header: "Order",
            sortable: true,
            render: (item) => (
                <span className="text-gray-600">{item.orderIndex || 0}</span>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (item) => (
                <span className="text-gray-600">
                    {item.description || "—"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            render: (item) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/subjects/${item.id}`);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                    >
                        <HiEye className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                        }}
                        className="p-1 text-primary-500 hover:bg-primary-50 rounded transition-colors"
                        title="Edit"
                    >
                        <HiPencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <HiTrash className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Subject Management</h1>
                <Button onClick={handleCreate} variant="primary">
                    <HiPlus className="w-5 h-5 inline-block mr-1" />
                    Create New Subject
                </Button>
            </div>

            {/* Filter by Class */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">
                        Filter by Class:
                    </label>
                    <select
                        value={selectedClassId}
                        onChange={(e) =>
                            setSelectedClassId(
                                e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                            )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">All Classes</option>
                        {getUniqueClasses().map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <DataTable
                data={filteredSubjects}
                columns={columns}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => router.push(`/admin/subjects/${item.id}`)}
                loading={loading}
                emptyMessage="No subjects found. Create your first subject to get started."
            />

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingSubject ? "Edit Subject" : "Create New Subject"}
                size="md"
            >
                <SubjectForm
                    initialData={editingSubject || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    isLoading={isSubmitting}
                />
            </Modal>
        </div>
    );
}

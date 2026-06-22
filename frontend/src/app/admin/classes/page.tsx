"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass,
} from "@/lib/admin";
import { ClassResponseDto, ClassRequestDto } from "@/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ClassForm from "@/components/admin/ClassForm";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiPlus, HiPencil, HiTrash, HiEye } from "react-icons/hi";

export default function ClassesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [classes, setClasses] = useState<ClassResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassResponseDto | null>(
        null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchClasses();
        
        // Check if we need to open modal for create
        if (searchParams.get("action") === "create") {
            setIsModalOpen(true);
        }
    }, [searchParams]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await getAllClasses();
            setClasses(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load classes");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingClass(null);
        setIsModalOpen(true);
    };

    const handleEdit = (classItem: ClassResponseDto) => {
        setEditingClass(classItem);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteClass(id);
            toast.success("Class deleted successfully");
            fetchClasses();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to delete class");
        }
    };

    const handleSubmit = async (data: ClassRequestDto) => {
        setIsSubmitting(true);
        try {
            if (editingClass) {
                await updateClass(editingClass.id, data);
                toast.success("Class updated successfully");
            } else {
                await createClass(data);
                toast.success("Class created successfully");
            }
            setIsModalOpen(false);
            setEditingClass(null);
            fetchClasses();
        } catch (err: any) {
            throw err; // Let form handle the error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClass(null);
        router.replace("/admin/classes", undefined);
    };

    const columns: Column<ClassResponseDto>[] = [
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
                            router.push(`/admin/classes/${item.id}`);
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
                <h1 className="text-3xl font-bold text-gray-800">Class Management</h1>
                <Button onClick={handleCreate} variant="primary">
                    <HiPlus className="w-5 h-5 inline-block mr-1" />
                    Create New Class
                </Button>
            </div>

            <DataTable
                data={classes}
                columns={columns}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => router.push(`/admin/classes/${item.id}`)}
                loading={loading}
                emptyMessage="No classes found. Create your first class to get started."
            />

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingClass ? "Edit Class" : "Create New Class"}
                size="md"
            >
                <ClassForm
                    initialData={editingClass || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    isLoading={isSubmitting}
                />
            </Modal>
        </div>
    );
}

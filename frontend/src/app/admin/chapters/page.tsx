"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    getAllChapters,
    getAllSubjects,
    createChapter,
    updateChapter,
    deleteChapter,
} from "@/lib/admin";
import { ChapterResponseDto, ChapterRequestDto, ChapterStatus, SubjectResponseDto } from "@/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ChapterForm from "@/components/admin/ChapterForm";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiPlus, HiPencil, HiTrash, HiEye } from "react-icons/hi";

export default function ChaptersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [chapters, setChapters] = useState<ChapterResponseDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [filteredChapters, setFilteredChapters] = useState<ChapterResponseDto[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<ChapterResponseDto | null>(
        null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchChapters();

        // Check if we need to open modal for create
        if (searchParams.get("action") === "create") {
            setIsModalOpen(true);
        }

        // Check for status filter in URL
        const statusParam = searchParams.get("status");
        if (statusParam) {
            setSelectedStatus(statusParam);
        }
    }, [searchParams]);

    useEffect(() => {
        let filtered = chapters;

        if (selectedStatus) {
            filtered = filtered.filter((c) => c.status === selectedStatus);
        }

        if (selectedSubjectId) {
            filtered = filtered.filter((c) => c.subjectId === selectedSubjectId);
        }

        setFilteredChapters(filtered);
    }, [chapters, selectedStatus, selectedSubjectId]);

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const [chaptersRes, subjectsRes] = await Promise.all([
                getAllChapters(),
                getAllSubjects()
            ]);
            setChapters(chaptersRes.data);
            setSubjects(subjectsRes.data);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to load chapters");
        } finally {
            setLoading(false);
        }
    };


    const handleCreate = () => {
        setEditingChapter(null);
        setIsModalOpen(true);
    };

    const handleEdit = (chapter: ChapterResponseDto) => {
        setEditingChapter(chapter);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this chapter? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteChapter(id);
            toast.success("Chapter deleted successfully");
            fetchChapters();
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete chapter");
        }
    };

    const handleSubmit = async (data: ChapterRequestDto) => {
        setIsSubmitting(true);
        try {
            if (editingChapter) {
                await updateChapter(editingChapter.id, data);
                toast.success("Chapter updated successfully");
            } else {
                await createChapter(data);
                toast.success("Chapter created successfully");
            }
            setIsModalOpen(false);
            setEditingChapter(null);
            fetchChapters();
        } catch (err) {
            throw err; // Let form handle the error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingChapter(null);
        router.replace("/admin/chapters", undefined);
    };

    const getStatusBadge = (status: ChapterStatus) => {
        const badges = {
            [ChapterStatus.DRAFT]: "bg-yellow-100 text-yellow-800",
            [ChapterStatus.PUBLISHED]: "bg-green-100 text-green-800",
            [ChapterStatus.ARCHIVED]: "bg-gray-100 text-gray-800",
        };
        return badges[status] || badges[ChapterStatus.DRAFT];
    };

    // Get subject name with class context
    const getSubjectDisplayName = (chapter: ChapterResponseDto) => {
        const subject = subjects.find(s => s.id === chapter.subjectId);
        if (subject) {
            return `${subject.name}[${subject.className || '?'}]`;
        }

        const subjectName = chapter.subjectName || `Subject ${chapter.subjectId}`;
        const className = chapter.className ? `[${chapter.className}]` : "";
        return `${subjectName}${className}`;
    };

    // Get available subjects for filter
    const getFilterSubjects = () => {
        // Only show subjects that have at least one chapter
        const subjectIdsWithChapters = new Set(chapters.map(c => c.subjectId));

        return subjects
            .filter(s => subjectIdsWithChapters.has(s.id))
            .map(s => ({
                id: s.id,
                name: `${s.name}[${s.className || '?'}]`
            }));
    };

    const columns: Column<ChapterResponseDto>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
        },
        {
            key: "title",
            header: "Title",
            sortable: true,
        },
        {
            key: "subjectId",
            header: "Subject",
            sortable: true,
            render: (item) => (
                <span className="text-gray-700">{getSubjectDisplayName(item)}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (item) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                        item.status
                    )}`}
                >
                    {item.status}
                </span>
            ),
        },
        {
            key: "price",
            header: "Price",
            sortable: true,
            render: (item) => (
                <span className="text-gray-600">
                    {item.free ? (
                        <span className="text-green-600 font-medium">Free</span>
                    ) : (
                        `৳${item.price || 0}`
                    )}
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
                            router.push(`/admin/chapters/${item.id}`);
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
                <h1 className="text-3xl font-bold text-gray-800">Chapter Management</h1>
                <Button onClick={handleCreate} variant="primary">
                    <HiPlus className="w-5 h-5 inline-block mr-1" />
                    Create New Chapter
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status:
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value={ChapterStatus.DRAFT}>Draft</option>
                            <option value={ChapterStatus.PUBLISHED}>Published</option>
                            <option value={ChapterStatus.ARCHIVED}>Archived</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Subject:
                        </label>
                        <select
                            value={selectedSubjectId}
                            onChange={(e) =>
                                setSelectedSubjectId(
                                    e.target.value === ""
                                        ? ""
                                        : Number(e.target.value)
                                )
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">All Subjects</option>
                            {getFilterSubjects().map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <DataTable
                data={filteredChapters}
                columns={columns}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => router.push(`/admin/chapters/${item.id}`)}
                loading={loading}
                emptyMessage="No chapters found. Create your first chapter to get started."
            />

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingChapter ? "Edit Chapter" : "Create New Chapter"}
                size="lg"
            >
                <ChapterForm
                    initialData={editingChapter || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    isLoading={isSubmitting}
                />
            </Modal>
        </div>
    );
}

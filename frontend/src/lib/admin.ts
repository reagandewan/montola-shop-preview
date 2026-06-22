import api from "./api";
import {
    ClassRequestDto,
    ClassResponseDto,
    ClassStructureResponseDto,
    SubjectRequestDto,
    SubjectResponseDto,
    SubjectStructureResponseDto,
    ChapterRequestDto,
    ChapterResponseDto,
    ChapterStructureResponseDto,
    FeaturedChapterResponseDto,
    TeacherDto,
    PaymentResponseDto,
    AdminStatisticsDto,
    ChapterStatus,
    UserRole,
} from "@/types";

// ==================== Admin Statistics ====================

export const getStatistics = () =>
    api.get<AdminStatisticsDto>("/v1/admin/statistics");

// ==================== Class Management ====================

export const getAllClasses = () =>
    api.get<ClassResponseDto[]>("/v1/classes");

export const getClassById = (id: number) =>
    api.get<ClassResponseDto>(`/v1/classes/${id}`);

export const createClass = (data: ClassRequestDto) =>
    api.post<ClassResponseDto>("/v1/classes", data);

export const updateClass = (id: number, data: ClassRequestDto) =>
    api.put<ClassResponseDto>(`/v1/classes/${id}`, data);

export const deleteClass = (id: number) =>
    api.delete(`/v1/classes/${id}`);

export const getClassStructure = (id: number) =>
    api.get<ClassStructureResponseDto>(`/v1/classes/${id}/structure`);

// ==================== Subject Management ====================

export const getAllSubjects = () =>
    api.get<SubjectResponseDto[]>("/v1/subjects");

export const getSubjectById = (id: number) =>
    api.get<SubjectResponseDto>(`/v1/subjects/${id}`);

export const createSubject = (data: SubjectRequestDto) =>
    api.post<SubjectResponseDto>("/v1/subjects", data);

export const updateSubject = (id: number, data: SubjectRequestDto) =>
    api.put<SubjectResponseDto>(`/v1/subjects/${id}`, data);

export const deleteSubject = (id: number) =>
    api.delete(`/v1/subjects/${id}`);

export const getSubjectStructure = (id: number) =>
    api.get<SubjectStructureResponseDto>(`/v1/subjects/${id}/structure`);

// ==================== Chapter Management ====================

export const getAllChapters = () =>
    api.get<ChapterResponseDto[]>("/v1/chapters");

export const getChapterById = (id: number) =>
    api.get<ChapterResponseDto>(`/v1/chapters/${id}`);

export const createChapter = (data: ChapterRequestDto) =>
    api.post<ChapterResponseDto>("/v1/chapters", data);

export const updateChapter = (id: number, data: ChapterRequestDto) =>
    api.put<ChapterResponseDto>(`/v1/chapters/${id}`, data);

export const deleteChapter = (id: number) =>
    api.delete(`/v1/chapters/${id}`);

export const getChaptersByStatus = (status: ChapterStatus) =>
    api.get<ChapterResponseDto[]>(`/v1/chapters/status/${status}`);

export const getChapterStructure = (id: number) =>
    api.get<ChapterStructureResponseDto>(`/v1/chapters/${id}/structure`);

export const updateChapterStatus = (id: number, status: ChapterStatus) =>
    api.patch<ChapterResponseDto>(`/v1/chapters/${id}/status`, null, {
        params: { status },
    });

export const toggleChapterFreeStatus = (id: number, isFree: boolean) =>
    api.patch<ChapterResponseDto>(`/v1/chapters/${id}/free-status`, null, {
        params: { isFree },
    });

export const uploadChapterCoverImage = (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/v1/chapters/${id}/cover-image`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const getChapterCoverImage = (id: number) =>
    api.get(`/v1/chapters/${id}/cover-image`, {
        responseType: "blob",
    });

// ==================== Featured Chapters Management ====================

export const getFeaturedChapters = () =>
    api.get<FeaturedChapterResponseDto[]>("/v1/featured-chapters");

export const addFeaturedChapter = (chapterId: number) =>
    api.post(`/v1/featured-chapters/${chapterId}`);

export const removeFeaturedChapter = (chapterId: number) =>
    api.delete(`/v1/featured-chapters/${chapterId}`);

// ==================== Teacher & User Management ====================

export const getAllUsers = () => api.get<any[]>("/users");

export const adminRegister = (data: { email: string; fullName: string; phone?: string; password?: string; roles: string[] }) =>
    api.post("/auth/admin/register", data);

export const getTeachersByRole = (role: UserRole = UserRole.TEACHER) =>
    api.get<TeacherDto[]>(`/users/role/${role}`);

export const assignTeacherToChapter = (chapterId: number, teacherId: number) =>
    api.post(`/v1/chapters/${chapterId}/assign-teacher`, null, {
        params: { teacherId },
    });

export const unassignTeacherFromChapter = (
    chapterId: number,
    teacherId: number
) =>
    api.delete(`/v1/chapters/${chapterId}/teachers/${teacherId}`);

// ==================== Payment Management ====================

export const getAllPayments = () =>
    api.get<PaymentResponseDto[]>("/v1/payments");

export const getUnverifiedPayments = () =>
    api.get<PaymentResponseDto[]>("/v1/payments/unverified");

export const verifyPayment = (paymentId: number) =>
    api.put<PaymentResponseDto>(`/v1/payments/${paymentId}/verify`);

export const rejectPayment = (paymentId: number) =>
    api.put<PaymentResponseDto>(`/v1/payments/${paymentId}/reject`);

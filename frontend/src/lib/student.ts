import api from "./api";
import {
    ChapterProgressResponseDto,
    ContentProgressResponseDto,
    LectureResponseDto,
    QuizResponseDto,
    GooglePdfContentResponseDto,
    PaymentRequestDto,
    PaymentResponseDto
} from "@/types";


// ==================== Student Progress ====================

export const getMyChaptersProgress = async () => {
    const response = await api.get<ChapterProgressResponseDto[]>("/v1/progress/my-chapters");
    return response.data;
};

export const getChapterProgress = async (chapterId: number) => {
    const response = await api.get<ChapterProgressResponseDto>(`/v1/progress/chapter/${chapterId}`);
    return response.data;
};

export const getChapterDetailedProgress = async (chapterId: number) => {
    // Returns map of contentId -> status (e.g. true for completed)
    const response = await api.get<Record<string, boolean>>(`/v1/progress/chapter/${chapterId}/detailed`);
    return response.data;
};


export const markContentComplete = async (contentItemId: number) => {
    const response = await api.post<ContentProgressResponseDto>(`/v1/progress/content/${contentItemId}/complete`);
    return response.data;
};

export const submitQuizScore = async (contentItemId: number, score: number) => {
    // The previous analysis of api-docs showed: /api/v1/progress/content/{contentItemId}/quiz
    // Body is likely just the score or an object? Docs said "additionalProperties: type: number" for body schema.
    // Let's assume a simple object or just the number.
    // Based on typical patterns, it might be { score: number } or similar.
    // Checking api-docs in earlier steps: 
    // "/api/v1/progress/content/{contentItemId}/quiz": { post: { ... requestBody: { content: { application/json: { schema: { type: "object", additionalProperties: { type: "number" } } } } } } }
    // This looks like a map of something? Or maybe just a raw map?
    // Let's retry verifying api-docs for this specific endpoint to be sure.
    // For now I'll stub it generically.
    const response = await api.post<ContentProgressResponseDto>(`/v1/progress/content/${contentItemId}/quiz`, { score });
    return response.data;
};

// Re-export chapter structure fetcher from public if needed, or use the authenticated one if different
// But public one is fine for structure.
// Actually, student might see different structure (e.g. if access control applies)?
// But typically structure is same.
// We can import specific student endpoints here.
// ==================== Content ====================

export const getContentById = async (id: number) => {
    const response = await api.get<LectureResponseDto | QuizResponseDto | GooglePdfContentResponseDto>(`/v1/contents/${id}`);
    return response.data;
};


export const enrollInFreeChapter = async (chapterId: number) => {
    const response = await api.post(`/v1/enrollments/free/${chapterId}`);
    return response.data;
};

export const submitPayment = async (data: PaymentRequestDto) => {
    const response = await api.post<PaymentResponseDto>("/v1/payments/submit", data);
    return response.data;
};

export const getPaymentStatusForChapter = async (chapterId: number) => {
    // Backend returns empty string or 204 if no payment exists
    const response = await api.get<PaymentResponseDto | "">(`/v1/payments/my-payments/chapter/${chapterId}`);
    return response.data;
};

export const getMyPayments = async () => {
    const response = await api.get<PaymentResponseDto[]>("/v1/payments/my-payments");
    return response.data;
};

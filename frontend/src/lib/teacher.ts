import api from "./api";
import {
    ChapterResponseDto,
    ChapterRequestDto,
    ChapterStructureResponseDto,
    ChapterStatisticsDto,
    TopicRequestDto,
    TopicResponseDto,
    LectureRequestDto,
    GooglePdfContentRequestDto,
    QuizRequestDto,
    QuizQuestionRequestDto,
    StudentChapterProgressDto,
} from "@/types";

// ==================== Teacher Chapter Management ====================

export const getAssignedChapters = () =>
    api.get<ChapterResponseDto[]>("/v1/teachers/assigned-chapters");

export const getChapterStatistics = (chapterId: number) =>
    api.get<ChapterStatisticsDto>(`/v1/teachers/chapters/${chapterId}/statistics`);

// Reuse chapter endpoints from admin
export {
    getChapterById,
    updateChapter,
    getChapterCoverImage,
    uploadChapterCoverImage,
    getChapterStructure,
} from "./admin";

// ==================== Topic Management ====================

export const createTopic = (data: TopicRequestDto) =>
    api.post<TopicResponseDto>("/v1/topics", data);

export const getTopicById = (id: number) =>
    api.get<TopicResponseDto>(`/v1/topics/${id}`);

export const updateTopic = (id: number, data: TopicRequestDto) =>
    api.put<TopicResponseDto>(`/v1/topics/${id}`, data);

export const deleteTopic = (id: number) =>
    api.delete(`/v1/topics/${id}`);

// ==================== Content Management ====================

// Create
export const createLecture = (data: LectureRequestDto) =>
    api.post("/v1/contents/lecture", data);

export const createPdf = (data: GooglePdfContentRequestDto) =>
    api.post("/v1/contents/pdf", data);

export const createQuiz = (data: QuizRequestDto) =>
    api.post("/v1/contents/quiz", data);

// Read
export const getContentById = (id: number) =>
    api.get(`/v1/contents/${id}`);

// Update by content item (Lecture / PDF / Quiz)
export const updateLectureByContentItem = (
    contentItemId: number,
    data: LectureRequestDto,
) =>
    api.put(`/v1/contents/lecture/content-item/${contentItemId}`, data);

export const updatePdfByContentItem = (
    contentItemId: number,
    data: GooglePdfContentRequestDto,
) =>
    api.put(`/v1/contents/pdf/content-item/${contentItemId}`, data);

// New Quiz Endpoints
export const updateQuizMetadata = (
    quizId: number,
    data: QuizRequestDto,
) =>
    api.put(`/v1/contents/quiz/${quizId}`, data);

export const updateQuizQuestions = (
    quizId: number,
    questions: QuizQuestionRequestDto[],
) =>
    api.put(
        `/v1/contents/quiz/${quizId}/questions`,
        questions,
    );

// Delete by content item (soft delete)
export const deleteLectureByContentItem = (contentItemId: number) =>
    api.delete(`/v1/contents/lecture/content-item/${contentItemId}`);

export const deletePdfByContentItem = (contentItemId: number) =>
    api.delete(`/v1/contents/pdf/content-item/${contentItemId}`);

export const deleteQuizByContentItem = (contentItemId: number) =>
    api.delete(`/v1/contents/quiz/content-item/${contentItemId}`);

// ==================== Student Progress ====================

export const getStudentsProgress = (chapterId: number) =>
    api.get<StudentChapterProgressDto[]>(
        `/v1/progress/admin/chapter/${chapterId}/students-progress`,
    );

import api from "./api";
import {
    FeaturedChapterResponseDto,
    ChapterResponseDto,
    ClassResponseDto,
    ClassStructureResponseDto,
    SubjectStructureResponseDto
} from "@/types";

export const getFeaturedChapters = async () => {
    const response = await api.get<FeaturedChapterResponseDto[]>("/v1/featured-chapters");
    return response.data;
};

export const getFreeChapters = async () => {
    const response = await api.get<ChapterResponseDto[]>("/v1/chapters/public/free");
    return response.data;
};

export const getAllClasses = async () => {
    const response = await api.get<ClassResponseDto[]>("/v1/classes");
    return response.data;
};

export const getClassPublicStructure = async (id: number) => {
    const response = await api.get<ClassStructureResponseDto>(`/v1/classes/${id}/public-structure`);
    return response.data;
};

export const getSubjectPublicStructure = async (id: number) => {
    const response = await api.get<SubjectStructureResponseDto>(`/v1/subjects/${id}/public-structure`);
    return response.data;
};

export const getChapterPublicStructure = async (id: number) => {
    const response = await api.get<any>(`/v1/chapters/${id}/public-structure`);
    return response.data;
};

export const getChapterPublicDetails = async (id: number) => {
    const response = await api.get<ChapterResponseDto>(`/v1/chapters/${id}/public`);
    return response.data;
};

export const enrollInChapter = async (chapterId: number) => {
    //TODO: Mock API call for now
    console.log(`Enrolling in chapter ${chapterId} (Mock)`);
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

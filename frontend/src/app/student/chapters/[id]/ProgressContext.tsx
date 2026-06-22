"use client";

import { createContext, useContext } from "react";
import { ChapterStructureResponseDto, ChapterProgressResponseDto } from "@/types";

export type ProgressContextType = {
    detailedProgress: Record<string, boolean>;
    overallProgress: ChapterProgressResponseDto | null;
    refreshProgress: () => Promise<void>;
    structure: ChapterStructureResponseDto | null;
};

export const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) throw new Error("useProgress must be used within a ProgressProvider");
    return context;
};

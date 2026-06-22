"use client";

import { ContentItemType } from "@/types";
import LectureForm from "./LectureForm";
import PdfForm from "./PdfForm";
import QuizForm from "./QuizForm";

interface ContentFormProps {
    contentType: ContentItemType;
    topicId: number;
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ContentForm({
    contentType,
    topicId,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: ContentFormProps) {
    switch (contentType) {
        case ContentItemType.LECTURE:
            return (
                <LectureForm
                    topicId={topicId}
                    initialData={initialData}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    isLoading={isLoading}
                />
            );

        case ContentItemType.PDF:
            return (
                <PdfForm
                    topicId={topicId}
                    initialData={initialData}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    isLoading={isLoading}
                />
            );

        case ContentItemType.QUIZ:
            return (
                <QuizForm
                    topicId={topicId}
                    initialData={initialData}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    isLoading={isLoading}
                />
            );

        default:
            return (
                <div className="p-4 text-center text-gray-500">
                    Unsupported content type: {contentType}
                </div>
            );
    }
}

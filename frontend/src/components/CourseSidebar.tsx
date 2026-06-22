"use client";

import { ChapterStructureResponseDto, ChapterProgressResponseDto } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FaCheckCircle, FaRegCircle, FaPlayCircle, FaFileAlt, FaQuestionCircle } from "react-icons/fa";
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiMenu, FiX } from "react-icons/fi";

interface Props {
    structure: ChapterStructureResponseDto;
    detailedProgress: Record<string, boolean>;
    overallProgress: ChapterProgressResponseDto | null;
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (val: boolean) => void;
}

function StatusIcon({ completed }: { completed: boolean }) {
    if (completed) {
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <FaRegCircle className="w-4 h-4 text-gray-300" />;
}

function ContentIcon({ type }: { type: string }) {
    switch (type) {
        case "LECTURE": return <FaPlayCircle className="w-4 h-4" />;
        case "PDF": return <FaFileAlt className="w-4 h-4" />;
        case "QUIZ": return <FaQuestionCircle className="w-4 h-4" />;
        default: return <FaRegCircle className="w-4 h-4" />;
    }
}

import { useI18n } from "@/contexts/I18nProvider";

export default function CourseSidebar({
    structure,
    detailedProgress,
    overallProgress,
    isCollapsed,
    setIsCollapsed,
    isSidebarOpen,
    setIsSidebarOpen
}: Props) {
    const params = useParams();
    const { t } = useI18n();
    const currentContentId = params?.contentId ? Number(params.contentId) : null;
    const chapterId = params?.id;

    // Local state for collapsible topics
    const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});

    // Initialize expanded topics (expand topic containing current content)
    useEffect(() => {
        if (currentContentId && structure.topics) {
            const activeTopic = structure.topics.find(t =>
                t.contentItems.some(i => i.id === currentContentId)
            );
            if (activeTopic) {
                setExpandedTopics(prev => ({ ...prev, [activeTopic.id]: true }));
            }
        }
    }, [currentContentId, structure.topics]);

    const toggleTopic = (topicId: number) => {
        setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    return (
        <>
            {/* Mobile Toggle Button (Floating) */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 md:hidden hover:bg-primary-700 transition-all active:scale-95"
            >
                <FiMenu size={24} />
            </button>

            <aside
                className={`fixed md:sticky top-16 left-0 h-[calc(100vh-64px)] bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out transform 
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                ${isCollapsed ? "w-20" : "w-80"}`}
            >
                {/* Header / Collapse Toggle */}
                <div className={`p-5 border-b border-gray-100 flex items-center justify-between ${isCollapsed ? 'flex-col gap-4' : ''}`}>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <Link href="/student/dashboard" className="text-[10px] font-black text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-1 transition-colors tracking-widest uppercase">
                                <FiChevronLeft /> {t("student.sidebar.dashboard")}
                            </Link>
                            <h2 className="font-bold text-gray-900 leading-tight truncate" title={structure.title}>{structure.title}</h2>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {/* Desktop Collapse Toggle */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar (Only when expanded) */}
                {!isCollapsed && (
                    <div className="p-5 border-b border-gray-50 bg-gray-50/30">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 tracking-widest uppercase">
                                <span>{t("student.sidebar.chapterProgress")}</span>
                                <span className="text-primary-600">
                                    {(overallProgress?.progressPercentage ?? 0).toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-primary-500 h-full transition-all duration-700 ease-out"
                                    style={{ width: `${overallProgress?.progressPercentage || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebar Content */}
                <div className="overflow-y-auto h-[calc(100%-140px)] custom-scrollbar">
                    {structure.topics.map((topic) => {
                        const isExpanded = expandedTopics[topic.id];
                        const totalItems = topic.contentItems.length;
                        const completedItems = topic.contentItems.filter(item => detailedProgress[item.id]).length;
                        const isFullyComplete = completedItems === totalItems;

                        return (
                            <div key={topic.id} className="border-b border-gray-50 last:border-0">
                                <button
                                    onClick={() => toggleTopic(topic.id)}
                                    className={`w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group
                                    ${isExpanded ? 'bg-gray-50/50' : ''}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {isCollapsed ? (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0
                                            ${isFullyComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {completedItems}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col min-w-0">
                                                <span className={`text-xs font-bold transition-colors truncate
                                                ${isFullyComplete ? 'text-green-600' : 'text-gray-900 group-hover:text-primary-600'}`}>
                                                    {topic.title}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {completedItems}/{totalItems} {t("student.sidebar.lessons")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="text-gray-400 group-hover:text-primary-500">
                                            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                                        </div>
                                    )}
                                </button>

                                {/* Lessons List */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out
                                ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {topic.contentItems.map((item) => {
                                        const isActive = currentContentId === item.id;
                                        const isCompleted = !!detailedProgress[item.id];

                                        return (
                                            <Link
                                                key={item.id}
                                                href={`/student/chapters/${chapterId}/content/${item.id}`}
                                                className={`flex items-center gap-3 px-5 py-3 transition-all border-l-4 relative group
                                                ${isActive
                                                        ? "bg-primary-50 border-primary-500 text-primary-700 font-bold"
                                                        : "border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                                                    }`}
                                            >
                                                {isCollapsed ? (
                                                    <div className="mx-auto" title={item.title}>
                                                        <StatusIcon completed={isCompleted} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex-shrink-0">
                                                            <StatusIcon completed={isCompleted} />
                                                        </div>
                                                        <div className="flex-grow text-sm truncate">
                                                            {item.title}
                                                        </div>
                                                        <div className={`flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-gray-300'}`}>
                                                            <ContentIcon type={item.type} />
                                                        </div>
                                                    </>
                                                )}

                                                {/* Tooltip for collapsed state */}
                                                {isCollapsed && (
                                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                        {item.title}
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}


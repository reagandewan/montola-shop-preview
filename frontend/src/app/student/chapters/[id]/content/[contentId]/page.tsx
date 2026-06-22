"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getContentById, markContentComplete, submitQuizScore } from "@/lib/student";
import {
    LectureResponseDto,
    QuizResponseDto,
    GooglePdfContentResponseDto,
    QuizQuestionResponseDto,
    QuizQuestionType
} from "@/types";
import { useProgress } from "../../layout";
import {

    FiCheckCircle,
    FiXCircle,
    FiChevronRight,
    FiFileText,
    FiPlay,
    FiHelpCircle,
    FiAlertCircle
} from "react-icons/fi";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/LoadingSpinner";


import { useI18n } from "@/contexts/I18nProvider";

export default function ContentPlayerPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useI18n();
    const contentId = params?.contentId ? Number(params.contentId) : null;
    const chapterId = params?.id ? Number(params.id) : null;

    const { detailedProgress, refreshProgress, structure } = useProgress();
    const isCompleted = contentId ? !!detailedProgress[contentId] : false;


    const [content, setContent] = useState<LectureResponseDto | QuizResponseDto | GooglePdfContentResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Quiz State
    const [quizAnswers, setQuizAnswers] = useState<Record<number, any>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    const fetchContent = useCallback(async () => {
        if (!contentId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getContentById(contentId);
            setContent(data);
        } catch (err) {
            console.error("Failed to fetch content", err);
            const errorResponse = err as { response?: { status?: number; data?: { message?: string } } };
            if (errorResponse.response?.status === 403) {
                setError(errorResponse.response.data?.message || t("student.contentPlayer.accessDenied"));
            } else if (errorResponse.response?.status === 404) {
                setError(t("student.contentPlayer.contentNotFound"));
            } else {
                setError(t("messages.error"));
            }
        } finally {
            setLoading(false);
        }
    }, [contentId, t]);

    useEffect(() => {
        fetchContent();
        // Reset quiz state when content changes
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
    }, [fetchContent]);

    const handleMarkComplete = async () => {
        if (!contentId) return;
        try {
            await markContentComplete(contentId);
            toast.success(t("student.contentPlayer.markedComplete"));
            refreshProgress();
        } catch (e) {
            console.error(e);
            const errorResponse = e as { response?: { data?: { message?: string } } };
            toast.error(errorResponse.response?.data?.message || t("student.contentPlayer.failedMarkComplete"));
        }

    };

    const handleQuizSubmit = async () => {
        if (!content || !('questions' in content)) return;

        let totalMarks = 0;
        let earnedMarks = 0;

        content.questions.forEach((q) => {
            totalMarks += q.marks;
            const answer = quizAnswers[q.id];

            if (q.type === QuizQuestionType.MULTIPLE_CHOICE) {
                const correctOptionIds = q.options.filter(o => o.isCorrect).map(o => o.id);
                const selectedOptionIds = Array.isArray(answer) ? answer : (answer ? [answer] : []);

                const isCorrect = correctOptionIds.length === selectedOptionIds.length &&
                    correctOptionIds.every(id => selectedOptionIds.includes(id));

                if (isCorrect) earnedMarks += q.marks;
            } else if (q.type === QuizQuestionType.FILL_IN_THE_BLANK) {
                const totalBlanks = q.fillBlanks.length;
                if (totalBlanks > 0) {
                    const correctCount = q.fillBlanks.filter(fb =>
                        answer?.[fb.blankPosition]?.trim().toLowerCase() === fb.correctAnswer.trim().toLowerCase()
                    ).length;
                    earnedMarks += (correctCount / totalBlanks) * q.marks;
                }
            } else if (q.type === QuizQuestionType.MATCHING) {
                const totalMatches = q.tableMatchings.length;
                if (totalMatches > 0) {
                    const correctCount = q.tableMatchings.filter(tm =>
                        answer?.[tm.id] === tm.rightItem
                    ).length;
                    earnedMarks += (correctCount / totalMatches) * q.marks;
                }
            } else if (q.type === QuizQuestionType.WRITTEN) {
                // Written questions are auto-graded for full marks as requested
                earnedMarks += q.marks;
            }
        });

        const scorePercentage = (earnedMarks / totalMarks) * 100;
        const passPercentage = (content as QuizResponseDto).passPercentage || 0;
        const isPassed = scorePercentage >= passPercentage;

        setQuizScore(earnedMarks);
        setQuizSubmitted(true);

        if (isPassed) {
            try {
                await submitQuizScore(contentId!, earnedMarks);
                toast.success(t("student.contentPlayer.passMessage", {
                    score: earnedMarks,
                    total: totalMarks,
                    percentage: scorePercentage.toFixed(1)
                }));
                refreshProgress();
            } catch (e) {
                console.error(e);
                toast.error(t("student.contentPlayer.failedSaveResults"));
            }
        } else {
            toast.warning(t("student.contentPlayer.failMessage", {
                score: earnedMarks,
                total: totalMarks,
                percentage: scorePercentage.toFixed(1),
                passPercentage
            }));
        }
    };

    const goToNext = useCallback(() => {
        if (!structure || !contentId) return;

        // Flatten all items to find current position
        const allItems = structure.topics.flatMap(t => t.contentItems);
        const currentIndex = allItems.findIndex(i => i.id === contentId);

        if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
            const nextItem = allItems[currentIndex + 1];
            router.push(`/student/chapters/${chapterId}/content/${nextItem.id}`);
        } else {
            // Last item in chapter
            toast.success(t("student.contentPlayer.congratulations"));
            router.push(`/student/chapters/${chapterId}`);
        }
    }, [structure, contentId, chapterId, router, t]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LoadingSpinner label={t("student.contentPlayer.fetchingContent")} size="lg" />
        </div>
    );

    if (error) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-6">
                <FiAlertCircle size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("student.contentPlayer.accessDenied")}</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">{error}</p>
            <button
                onClick={() => router.back()}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                {t("student.contentPlayer.goBack")}
            </button>
        </div>
    );

    if (!content) return <div className="p-8 text-center text-gray-500">{t("student.contentPlayer.contentNotFound")}</div>;

    const isLecture = 'videoId' in content;
    const isQuiz = 'questions' in content;
    const isPdf = 'googleFileId' in content;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {isLecture && <FiPlay className="text-blue-600" size={18} />}
                            {isQuiz && <FiHelpCircle className="text-purple-600" size={18} />}
                            {isPdf && <FiFileText className="text-red-600" size={18} />}
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                {isLecture ? t("student.contentPlayer.lecture") : isQuiz ? t("student.contentPlayer.quiz") : t("student.contentPlayer.referencePdf")}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{content.title}</h1>
                    </div>

                </div>

                <div className="p-0 md:p-8">
                    {/* Render Content Based on Type */}
                    {isLecture && (
                        <div className="space-y-6">
                            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                                {content.videoId ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${content.videoId}?modestbranding=1&rel=0&showinfo=0`}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        {t("student.contentPlayer.noVideo")}
                                    </div>
                                )}
                            </div>
                            {content.content && (
                                <div className="prose prose-blue max-w-none p-6 md:p-0">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("student.contentPlayer.lectureSummary")}</h3>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {content.content}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {isPdf && (
                        <div className="space-y-6 p-6 md:p-0">
                            <div className="aspect-[4/5] md:aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                                <iframe
                                    src={`https://drive.google.com/file/d/${content.googleFileId}/preview`}
                                    className="w-full h-full border-0"
                                    allow="autoplay"
                                />
                            </div>
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded">
                                        <FiFileText size={24} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-900">{content.title}</p>
                                        <p className="text-sm text-blue-700">{content.pageCount} {t("student.contentPlayer.pages")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isQuiz && (
                        <div className="p-6 md:p-0 space-y-8">
                            {(() => {
                                const quiz = content as QuizResponseDto;
                                const totalMarks = quiz.totalMarks || 0;
                                const passPercentage = quiz.passPercentage || 0;
                                const percentage = totalMarks > 0 ? (quizScore / totalMarks) * 100 : 0;
                                const isPassed = percentage >= passPercentage;

                                return (
                                    <>
                                        {quiz.instruction && (
                                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-start gap-4">
                                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                    <FiHelpCircle size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-purple-900 uppercase tracking-tight mb-1">{t("student.contentPlayer.instructions")}</h3>
                                                    <p className="text-purple-800 text-sm">{quiz.instruction}</p>
                                                </div>
                                            </div>
                                        )}

                                        {quizSubmitted && (
                                            <div id="quiz-result" className={`p-6 rounded-xl border flex items-center gap-6 ${isPassed
                                                ? "bg-green-50 border-green-100 text-green-900"
                                                : "bg-red-50 border-red-100 text-red-900"
                                                }`}>
                                                <div className={`p-4 rounded-full ${isPassed
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-red-100 text-red-600"
                                                    }`}>
                                                    {isPassed
                                                        ? <FiCheckCircle size={32} />
                                                        : <FiXCircle size={32} />
                                                    }
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold mb-1">
                                                        {isPassed ? t("student.contentPlayer.assessmentPassed") : t("student.contentPlayer.assessmentFailed")}
                                                    </h2>
                                                    <p className="text-sm font-medium opacity-90">
                                                        {t("student.contentPlayer.totalScore")} {Number.isInteger(quizScore) ? quizScore : quizScore.toFixed(1)} / {totalMarks} ({percentage.toFixed(1)}%)
                                                        {!isPassed && ` • ${t("student.contentPlayer.required")}: ${passPercentage}%`}
                                                    </p>
                                                </div>
                                                {!isPassed && (
                                                    <button
                                                        onClick={() => {
                                                            setQuizSubmitted(false);
                                                            setQuizAnswers({});
                                                            setQuizScore(0);
                                                        }}
                                                        className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                                                    >
                                                        {t("student.contentPlayer.tryAgain")}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-12">
                                            {quiz.questions.map((q, idx) => {
                                                const isQuestionCorrect = (() => {
                                                    const answer = quizAnswers[q.id];
                                                    if (q.type === QuizQuestionType.MULTIPLE_CHOICE) {
                                                        const correctOptionIds = q.options.filter(o => o.isCorrect).map(o => o.id);
                                                        const selectedOptionIds = Array.isArray(answer) ? answer : (answer ? [answer] : []);
                                                        return correctOptionIds.length === selectedOptionIds.length &&
                                                            correctOptionIds.every(id => selectedOptionIds.includes(id));
                                                    }
                                                    if (q.type === QuizQuestionType.FILL_IN_THE_BLANK) {
                                                        return q.fillBlanks.every(fb =>
                                                            answer?.[fb.blankPosition]?.trim().toLowerCase() === fb.correctAnswer.trim().toLowerCase()
                                                        );
                                                    }
                                                    if (q.type === QuizQuestionType.MATCHING) {
                                                        return q.tableMatchings.every(tm =>
                                                            answer?.[tm.id] === tm.rightItem
                                                        );
                                                    }
                                                    return true; // Written questions are auto-passed
                                                })();

                                                return (
                                                    <div key={q.id} className="space-y-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className="relative">
                                                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                                                                    {idx + 1}
                                                                </span>
                                                                {quizSubmitted && isQuestionCorrect && (
                                                                    <div className="absolute -right-1 -bottom-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                                                        <FiCheckCircle size={12} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow">
                                                                {q.type !== QuizQuestionType.FILL_IN_THE_BLANK && (
                                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">{q.questionText}</h3>
                                                                )}
                                                                <p className="text-xs font-bold text-gray-400 uppercase">{q.marks} {t("student.contentPlayer.marks")} • {t(`student.contentPlayer.questionTypes.${q.type}`)}</p>
                                                            </div>
                                                        </div>

                                                        {/* Multiple Choice Rendering */}
                                                        {q.type === QuizQuestionType.MULTIPLE_CHOICE && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                                                                {q.options.map((opt) => {
                                                                    const isSelected = Array.isArray(quizAnswers[q.id])
                                                                        ? quizAnswers[q.id].includes(opt.id)
                                                                        : quizAnswers[q.id] === opt.id;

                                                                    const isCorrect = opt.isCorrect;

                                                                    let buttonStyles = "border-gray-100 bg-white hover:border-gray-300";
                                                                    if (quizSubmitted) {
                                                                        if (isSelected) {
                                                                            buttonStyles = isCorrect
                                                                                ? "border-green-500 bg-green-50 text-green-900"
                                                                                : "border-red-500 bg-red-50 text-red-900";
                                                                        } else if (isPassed && isCorrect) {
                                                                            // Highlight correct unselected answer only if passed
                                                                            buttonStyles = "border-green-500 bg-green-50 text-green-900 opacity-50";
                                                                        } else {
                                                                            buttonStyles = "border-gray-100 bg-white opacity-50";
                                                                        }
                                                                    } else if (isSelected) {
                                                                        buttonStyles = "border-primary-600 bg-primary-50 text-primary-900";
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={opt.id}
                                                                            disabled={quizSubmitted}
                                                                            onClick={() => {
                                                                                const current = quizAnswers[q.id];
                                                                                const isMultiple = q.options.filter(o => o.isCorrect).length > 1;

                                                                                if (isMultiple) {
                                                                                    const arr = Array.isArray(current) ? [...current] : [];
                                                                                    if (arr.includes(opt.id)) {
                                                                                        setQuizAnswers({ ...quizAnswers, [q.id]: arr.filter(id => id !== opt.id) });
                                                                                    } else {
                                                                                        setQuizAnswers({ ...quizAnswers, [q.id]: [...arr, opt.id] });
                                                                                    }
                                                                                } else {
                                                                                    setQuizAnswers({ ...quizAnswers, [q.id]: opt.id });
                                                                                }
                                                                            }}
                                                                            className={`text-left p-4 rounded-xl border-2 transition-all ${buttonStyles}`}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary-600 bg-primary-600" : "border-gray-300"
                                                                                    }`}>
                                                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                                                </div>
                                                                                <span className="font-medium">{opt.optionText}</span>
                                                                                {quizSubmitted && isSelected && isCorrect && (
                                                                                    <FiCheckCircle size={16} className="ml-auto text-green-600" />
                                                                                )}
                                                                                {quizSubmitted && isSelected && !isCorrect && (
                                                                                    <FiXCircle size={16} className="ml-auto text-red-600" />
                                                                                )}
                                                                                {quizSubmitted && isPassed && !isSelected && isCorrect && (
                                                                                    <FiCheckCircle size={16} className="ml-auto text-green-600 opacity-50" />
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {/* Table Matching Rendering */}
                                                        {q.type === QuizQuestionType.MATCHING && (
                                                            <div className="pl-12">
                                                                {/* Column Headers */}
                                                                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mb-3 px-1">
                                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item</span>
                                                                    <span></span>
                                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Match with</span>
                                                                </div>
                                                                {/* Rows */}
                                                                <div className="space-y-2">
                                                                    {q.tableMatchings.map((tm, tmIdx) => {
                                                                        const isCorrect = quizAnswers[q.id]?.[tm.id] === tm.rightItem;
                                                                        // Shuffle options deterministically based on question id
                                                                        const shuffledOptions = [...q.tableMatchings]
                                                                            .sort((a, b) => {
                                                                                const hashA = (a.id * 2654435761) >>> 0;
                                                                                const hashB = (b.id * 2654435761) >>> 0;
                                                                                return hashA - hashB;
                                                                            });

                                                                        return (
                                                                            <div
                                                                                key={tm.id}
                                                                                className={`grid grid-cols-[1fr_auto_1fr] gap-3 items-center p-3 rounded-xl transition-all ${
                                                                                    quizSubmitted
                                                                                        ? isCorrect
                                                                                            ? 'bg-green-50 border border-green-200'
                                                                                            : 'bg-red-50 border border-red-200'
                                                                                        : 'bg-gray-50 border border-gray-100 hover:border-gray-200'
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="font-medium text-gray-900 text-sm">{tm.leftItem}</span>
                                                                                </div>

                                                                                <div className="text-gray-300">
                                                                                    <FiChevronRight size={16} />
                                                                                </div>

                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="relative flex-1">
                                                                                        <select
                                                                                            disabled={quizSubmitted}
                                                                                            value={quizAnswers[q.id]?.[tm.id] || ""}
                                                                                            onChange={(e) => setQuizAnswers({
                                                                                                ...quizAnswers,
                                                                                                [q.id]: { ...(quizAnswers[q.id] || {}), [tm.id]: e.target.value }
                                                                                            })}
                                                                                            className={`w-full p-2.5 pr-8 rounded-lg border-2 bg-white text-sm font-medium transition-all cursor-pointer outline-none appearance-none ${quizSubmitted
                                                                                                ? isCorrect
                                                                                                    ? "border-green-400 text-green-800"
                                                                                                    : "border-red-400 text-red-800"
                                                                                                : quizAnswers[q.id]?.[tm.id]
                                                                                                    ? "border-primary-300 text-gray-900"
                                                                                                    : "border-gray-200 text-gray-500 focus:border-primary-400"
                                                                                            }`}
                                                                                        >
                                                                                            <option value="">{t("student.contentPlayer.selectMatch")}</option>
                                                                                            {shuffledOptions.map(item => (
                                                                                                <option key={item.id} value={item.rightItem}>{item.rightItem}</option>
                                                                                            ))}
                                                                                        </select>
                                                                                        {!quizSubmitted && (
                                                                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    {quizSubmitted && (
                                                                                        <div className="flex-shrink-0">
                                                                                            {isCorrect
                                                                                                ? <FiCheckCircle size={18} className="text-green-500" />
                                                                                                : <FiXCircle size={18} className="text-red-500" />
                                                                                            }
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {/* Show correct answers after submission if failed */}
                                                                {quizSubmitted && !isQuestionCorrect && isPassed && (
                                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                                        <p className="text-xs font-bold text-blue-700 mb-2">{t("student.contentPlayer.correctAnswers")}:</p>
                                                                        <div className="space-y-1">
                                                                            {q.tableMatchings.map((tm) => (
                                                                                <p key={tm.id} className="text-sm text-blue-800">
                                                                                    <span className="font-medium">{tm.leftItem}</span>
                                                                                    <span className="mx-2 text-blue-400">→</span>
                                                                                    <span className="font-bold">{tm.rightItem}</span>
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Fill in the Blanks Rendering */}
                                                        {q.type === QuizQuestionType.FILL_IN_THE_BLANK && (
                                                            <div className="pl-12">
                                                                <div className="text-lg text-gray-800 p-6 bg-gray-50 rounded-xl border border-gray-100" style={{ lineHeight: '2.5' }}>
                                                                    {q.questionText.split('__BLANK__').map((part, i, arr) => (
                                                                        <span key={i}>
                                                                            {part}
                                                                            {i < arr.length - 1 && (
                                                                                <span className="inline-block relative align-baseline" style={{ width: '100px' }}>
                                                                                    <input
                                                                                        type="text"
                                                                                        disabled={quizSubmitted}
                                                                                        placeholder="..."
                                                                                        value={quizAnswers[q.id]?.[i + 1] || ""}
                                                                                        onChange={(e) => setQuizAnswers({
                                                                                            ...quizAnswers,
                                                                                            [q.id]: { ...(quizAnswers[q.id] || {}), [i + 1]: e.target.value }
                                                                                        })}
                                                                                        className={`w-full px-1 py-0 border-b-2 text-center bg-transparent text-base transition-all outline-none ${quizSubmitted
                                                                                            ? quizAnswers[q.id]?.[i + 1]?.trim().toLowerCase() === q.fillBlanks.find(fb => fb.blankPosition === i + 1)?.correctAnswer.trim().toLowerCase()
                                                                                                ? "border-green-500 text-green-700 bg-green-50/30"
                                                                                                : "border-red-500 text-red-700 bg-red-50/30"
                                                                                            : "border-gray-300 focus:border-primary-500 focus:bg-white"
                                                                                            }`}
                                                                                    />
                                                                                    {quizSubmitted && isPassed &&
                                                                                        quizAnswers[q.id]?.[i + 1]?.trim().toLowerCase() !== q.fillBlanks.find(fb => fb.blankPosition === i + 1)?.correctAnswer.trim().toLowerCase() && (
                                                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded shadow-lg text-xs font-bold whitespace-nowrap z-10">
                                                                                                {t("student.contentPlayer.correct")}: {q.fillBlanks.find(fb => fb.blankPosition === i + 1)?.correctAnswer}
                                                                                            </div>
                                                                                        )}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Written Question Rendering */}
                                                        {q.type === QuizQuestionType.WRITTEN && (
                                                            <div className="pl-12 space-y-4">
                                                                <textarea
                                                                    disabled={quizSubmitted}
                                                                    rows={4}
                                                                    placeholder={t("student.contentPlayer.typeAnswer")}
                                                                    value={quizAnswers[q.id] || ""}
                                                                    onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                                                                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary-500 outline-none transition-all resize-none"
                                                                />
                                                                {quizSubmitted && q.writtenAnswer && isPassed && (
                                                                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                                                                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight mb-2">{t("student.contentPlayer.sampleAnswer")}</h4>
                                                                        <p className="text-blue-800 text-sm italic">{q.writtenAnswer.sampleAnswer}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {!quizSubmitted && (
                                            <div className="pt-8 border-t border-gray-100 flex justify-center">
                                                <button
                                                    onClick={handleQuizSubmit}
                                                    className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 active:transform active:scale-95"
                                                >
                                                    {t("student.contentPlayer.submitAssessment")}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* Footer Actions for non-quizzes or after passing submission */}
                {(() => {
                    if (!isQuiz) return true;
                    if (!quizSubmitted) return false;
                    const quiz = content as QuizResponseDto;
                    const totalMarks = quiz.totalMarks || 0;
                    const passPercentage = quiz.passPercentage || 0;
                    const percentage = totalMarks > 0 ? (quizScore / totalMarks) * 100 : 0;
                    return percentage >= passPercentage;
                })() && (
                        <div className="bg-gray-50 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                {isQuiz ? t("student.contentPlayer.quizSubmitted") : t("student.contentPlayer.finishedLesson")}
                            </div>
                            <div className="flex gap-3">
                                {!isQuiz && (
                                    <button
                                        onClick={handleMarkComplete}
                                        disabled={isCompleted}
                                        className={`px-6 py-2.5 rounded-lg transition-all font-bold text-sm flex items-center gap-2 ${isCompleted
                                            ? "bg-green-100 text-green-700 cursor-default"
                                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                            }`}
                                    >
                                        {isCompleted ? <><FiCheckCircle /> {t("student.contentPlayer.completed")}</> : t("student.contentPlayer.markComplete")}
                                    </button>
                                )}

                                <button
                                    onClick={goToNext}
                                    className="bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition font-medium flex items-center gap-2"
                                >
                                    {(() => {
                                        const allItems = structure?.topics.flatMap(t => t.contentItems) || [];
                                        const currentIndex = allItems.findIndex(i => i.id === contentId);
                                        return (currentIndex !== -1 && currentIndex < allItems.length - 1)
                                            ? t("student.contentPlayer.nextLesson")
                                            : t("student.contentPlayer.finishChapter");
                                    })()}
                                    <FiChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}


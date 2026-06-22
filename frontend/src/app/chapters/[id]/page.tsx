"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChapterPublicDetails, getChapterPublicStructure } from "@/lib/public";
import { getChapterProgress, enrollInFreeChapter, getPaymentStatusForChapter, submitPayment as submitPaymentApi } from "@/lib/student";
import { ChapterResponseDto, ChapterProgressResponseDto, PaymentResponseDto, PaymentStatus, PaymentRequestDto } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { FaPlayCircle, FaCheckCircle, FaLock, FaUsers, FaHourglassHalf, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaChevronRight, FaFilePdf, FaQuestionCircle, FaVideo } from "react-icons/fa";
import PaymentModal from "@/components/student/PaymentModal";
import ChapterPlaceholder from "@/components/ChapterPlaceholder";
import { useI18n } from "@/contexts/I18nProvider";

export default function ChapterPublicPage() {
    const { t } = useI18n();
    const params = useParams();
    const router = useRouter();
    const { isLoggedIn, user, isLoading: isAuthLoading } = useAuth();
    const id = params?.id ? Number(params.id) : null;

    const [chapter, setChapter] = useState<ChapterResponseDto | null>(null);
    const [structure, setStructure] = useState<any | null>(null);
    const [progress, setProgress] = useState<ChapterProgressResponseDto | null>(null);
    const [payment, setPayment] = useState<PaymentResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
    const [isHighlighting, setIsHighlighting] = useState(false);

    const [imageError, setImageError] = useState(false);

    const isStudent = user?.roles?.includes("STUDENT");

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [chapterData, structureData] = await Promise.all([
                    getChapterPublicDetails(id),
                    getChapterPublicStructure(id).catch(() => null)
                ]);
                
                setChapter(chapterData);
                setStructure(structureData);
                
                if (structureData?.topics) {
                    setExpandedTopics(new Set(structureData.topics.map((t: any) => t.id)));
                }
                
                setImageError(false); // Reset error state on new data

                // If logged in as student, check enrollment/progress and payment status
                if (isLoggedIn && isStudent) {
                    try {
                        const [progressData, paymentData] = await Promise.all([
                            getChapterProgress(id).catch(() => null),
                            getPaymentStatusForChapter(id).catch(() => null)
                        ]);

                        if (progressData) setProgress(progressData);
                        if (paymentData) setPayment(paymentData as PaymentResponseDto);
                    } catch (err) {
                        console.error("Failed to fetch student progress/payment:", err);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch chapter details:", err);
                toast.error(t("chapterPublic.error"));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isLoggedIn, isStudent, t]);

    const handleEnroll = async () => {
        if (!chapter) return;

        if (!isLoggedIn) {
            toast.info(t("chapterPublic.loginToEnroll"));
            router.push(`/auth/login?returnUrl=/chapters/${chapter.id}`); // Assuming login supports returnUrl
            return;
        }

        if (chapter.free) {
            setEnrolling(true);
            try {
                await enrollInFreeChapter(chapter.id);
                toast.success(t("chapterPublic.enrollSuccess"));
                // Re-fetch progress to show "Continue" button
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (error) {
                console.error("Enrollment failed:", error);
                toast.error(t("chapterPublic.enrollFailed"));
            } finally {
                setEnrolling(false);
            }
        } else {
            // Paid chapter
            if (!isLoggedIn) {
                toast.info(t("chapterPublic.loginToPurchase"));
                router.push(`/auth/login?returnUrl=/chapters/${chapter.id}`);
                return;
            }
            // Open payment modal
            setIsPaymentModalOpen(true);
        }
    };

    const handlePaymentSubmit = async (data: PaymentRequestDto) => {
        try {
            await submitPaymentApi(data);
            toast.success(t("chapterPublic.paymentSuccess"));
            // Refresh payment status
            const status = await getPaymentStatusForChapter(chapter!.id);
            if (status) setPayment(status as PaymentResponseDto);
            setIsPaymentModalOpen(false);
        } catch (error) {
            console.error("Payment submission failed:", error);
            toast.error(t("chapterPublic.paymentFailed"));
        }
    };

    const toggleTopic = (topicId: number) => {
        const next = new Set(expandedTopics);
        if (next.has(topicId)) next.delete(topicId);
        else next.add(topicId);
        setExpandedTopics(next);
    };

    const handleContentClick = () => {
        if (!isLoggedIn) {
            toast.info(t("chapterPublic.loginRequired"));
            router.push(`/auth/login?returnUrl=/chapters/${id}`);
        } else if (!progress) {
            if (chapter?.free) {
                toast.info(t("chapterPublic.enrollToAccess"));
            } else {
                toast.warning(t("chapterPublic.buyToAccess"));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsHighlighting(true);
            setTimeout(() => setIsHighlighting(false), 4000);
        } else {
            router.push(`/student/chapters/${id}`);
        }
    };

    const getContentIcon = (type: string) => {
        switch (type) {
            case "LECTURE": return <FaVideo className="text-blue-500" />;
            case "PDF": return <FaFilePdf className="text-red-500" />;
            case "QUIZ": return <FaQuestionCircle className="text-green-500" />;
            default: return <FaPlayCircle className="text-gray-400" />;
        }
    };

    if (loading || isAuthLoading) {
        return <div className="min-h-screen pt-24 text-center">{t("chapterPublic.loading")}</div>;
    }

    if (!chapter) {
        return <div className="min-h-screen pt-24 text-center text-red-500 font-bold uppercase tracking-widest">{t("chapterPublic.notFound")}</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="md:flex">
                    {/* Visual Section — vertically centered within the row */}
                    <div className="md:w-1/2 relative group flex items-center bg-gray-50">
                        {chapter.videoId ? (
                            <div className="aspect-video w-full">
                                <iframe
                                    className="w-full h-full border-0"
                                    src={`https://www.youtube.com/embed/${chapter.videoId}?modestbranding=1&rel=0`}
                                    title="Chapter Preview"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="relative aspect-video w-full overflow-hidden">
                                {!imageError ? (
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/chapters/${chapter.id}/cover-image`}
                                        alt={chapter.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={() => setImageError(true)}
                                        unoptimized
                                    />
                                ) : (
                                    <ChapterPlaceholder
                                        title={chapter.title}
                                        subjectName={chapter.subjectName}
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                            </div>
                        )}
                        {!chapter.videoId && (
                            <div className="absolute top-4 left-4 z-10">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                                    <FaPlayCircle className="text-primary-600" />
                                    {t("chapterPublic.preview")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-10 md:w-1/2 flex flex-col justify-center bg-white">
                        {/* Breadcrumb */}
                        <nav className="inline-flex flex-wrap items-center gap-2 text-xs mb-6 bg-gray-50 border border-gray-200 rounded-full px-4 py-2" aria-label="Breadcrumb">
                            {chapter.classId && (
                                <Link href={`/classes/${chapter.classId}`} className="text-gray-500 hover:text-primary-600 transition-colors font-semibold">
                                    {chapter.className || t("chapterPublic.noGeneral")}
                                </Link>
                            )}
                            {chapter.subjectId && chapter.classId && (
                                <>
                                    <FaChevronRight className="text-gray-400" size={9} />
                                    <Link href={`/classes/${chapter.classId}/subjects/${chapter.subjectId}`} className="text-gray-500 hover:text-primary-600 transition-colors font-semibold">
                                        {chapter.subjectName}
                                    </Link>
                                </>
                            )}
                            <FaChevronRight className="text-gray-400" size={9} />
                            <span className="text-gray-900 font-bold truncate max-w-[140px]">{chapter.title}</span>
                        </nav>

                        <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                            {chapter.title}
                        </h1>

                        <div className="mb-8">
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                                {[
                                    { key: 'live', icon: <FaVideo className="text-primary-500" /> },
                                    { key: 'sheets', icon: <FaFilePdf className="text-primary-500" /> },
                                    { key: 'webapp', icon: <FaCheckCircle className="text-primary-500" /> },
                                    { key: 'notice', icon: <FaCheckCircle className="text-primary-500" /> },
                                    { key: 'exams', icon: <FaCheckCircle className="text-primary-500" /> }
                                ].map((feature) => (
                                    <li key={feature.key} className="flex items-center gap-2.5 text-gray-600 font-semibold text-xs tracking-tight">
                                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                                            {feature.icon}
                                        </div>
                                        {t(`chapterPublic.features.${feature.key}`)}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">{t("chapterPublic.instructors")}</p>
                                <div className="flex flex-wrap gap-1 items-center">
                                    <FaUsers className="text-gray-400" size={14} />
                                    <p className="font-bold text-gray-800 text-sm">
                                        {chapter.teachers && chapter.teachers.length > 0
                                            ? chapter.teachers.map(t => t.fullName).join(", ")
                                            : t("chapterPublic.faculty")}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">
                                    {chapter.free ? t("chapterPublic.status") : t("chapterPublic.price")}
                                </p>
                                <p className="text-2xl font-black text-primary-600">
                                    {chapter.free ? (
                                        <span className="text-green-600">{t("home.free.badge")}</span>
                                    ) : (
                                        `৳${chapter.price || 0}`
                                    )}
                                </p>
                            </div>
                        </div>

                        {progress ? (
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-700">{t("chapterPublic.progress")}</span>
                                        <span className="text-sm font-black text-primary-600">{Math.round(progress.progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-primary-600 h-full transition-all duration-1000"
                                            style={{ width: `${progress.progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <Link
                                    href={`/student/chapters/${chapter.id}`}
                                    className="block w-full text-center py-4 bg-primary-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-primary-200 hover:bg-primary-700 transition transform hover:-translate-y-1"
                                >
                                    {t("chapterPublic.continueLearning")}
                                </Link>
                            </div>
                        ) : payment && payment.status === PaymentStatus.PENDING ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center space-y-4">
                                <FaHourglassHalf className="mx-auto text-blue-500 text-3xl" />
                                <div>
                                    <p className="text-lg font-bold text-blue-900 leading-tight">{t("chapterPublic.verificationPending")}</p>
                                    <p className="text-sm text-blue-700 mt-1">{t("chapterPublic.verificationPendingSub")}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {payment && payment.status === PaymentStatus.REJECTED && (
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-2">
                                        <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                                        <p className="text-xs font-medium text-red-700">
                                            {t("chapterPublic.rejected")}
                                        </p>
                                    </div>
                                )}
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 ${isHighlighting ? "scale-105 ring-4 ring-primary-300 shadow-primary-200" : ""
                                        } ${chapter.free
                                            ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100"
                                            : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-100"
                                        } ${enrolling ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {enrolling ? (
                                        t("chapterPublic.enrolling")
                                    ) : (
                                        <>
                                            {chapter.free ? <FaPlayCircle /> : <FaCheckCircle />}
                                            {chapter.free ? t("chapterPublic.enrollNow") : (payment && payment.status === PaymentStatus.REJECTED ? t("chapterPublic.resubmitPayment") : t("chapterPublic.buyChapter"))}
                                        </>
                                    )}
                                </button>
                                {chapter.free && !isLoggedIn && (
                                    <div className="flex items-center justify-center gap-2 text-gray-400 bg-gray-50 py-2 rounded-xl">
                                        <FaLock size={12} />
                                        <p className="text-xs font-bold uppercase tracking-widest">{t("chapterPublic.loginRequired")}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Section */}
            <div className="max-w-5xl mx-auto mt-12 px-2 md:px-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">{t("chapterPublic.whatYouWillLearn")}</h3>
                    <p className="text-gray-600 leading-relaxed text-base">
                        {chapter.description || t("chapterPublic.fallbackDescription")}
                    </p>
                </div>
            </div>

            {/* Syllabus Section */}
            {structure && (
                <div className="max-w-5xl mx-auto mt-12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Syllabus</h3>
                        <p className="text-sm text-gray-500 font-medium">{structure.topics?.length || 0} Topics • {structure.topics?.reduce((acc: number, t: any) => acc + (t.contentItems?.length || 0), 0)} Items</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {structure.topics?.map((topic: any) => (
                            <div key={topic.id} className="bg-white">
                                <button
                                    onClick={() => toggleTopic(topic.id)}
                                    className="w-full px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-primary-600 transition-colors">{topic.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{topic.contentItems?.length || 0} items</span>
                                        {expandedTopics.has(topic.id) ? <FaChevronUp className="text-gray-300" /> : <FaChevronDown className="text-gray-300" />}
                                    </div>
                                </button>
                                
                                {expandedTopics.has(topic.id) && (
                                    <div className="px-8 pb-5 space-y-2">
                                        {topic.contentItems?.map((item: any) => (
                                            <button
                                                key={item.id}
                                                onClick={handleContentClick}
                                                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-primary-100 hover:bg-primary-50/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        {getContentIcon(item.type)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-gray-700 text-sm group-hover:text-primary-600 transition-colors">{item.title}</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.type}</p>
                                                    </div>
                                                </div>
                                                <FaLock className="text-gray-200 group-hover:text-primary-200 transition-colors" size={12} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {chapter && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    chapterId={chapter.id}
                    chapterTitle={chapter.title}
                    amount={chapter.price || 0}
                    onSubmit={handlePaymentSubmit}
                />
            )}
        </main>
    );
}

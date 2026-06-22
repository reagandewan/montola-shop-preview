// Authentication types
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    email: string;
    fullName: string;
    roles: string[];
}

export interface User {
    id?: number;
    email: string;
    fullName: string;
    phone?: string;
    roles: string[];
    hasProfilePicture?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Enums
export enum ChapterStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}

export enum PaymentStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}

export enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT"
}

// Class types
export interface ClassRequestDto {
    name: string;
    description?: string;
}

export interface ClassResponseDto {
    id: number;
    name: string;
    description?: string;
}

export interface ClassStructureResponseDto {
    id: number;
    name: string;
    description?: string;
    subjects: SubjectStructureResponseDto[];
}

// Subject types
export interface SubjectRequestDto {
    classId: number;
    name: string;
    description?: string;
    orderIndex?: number;
}

export interface SubjectResponseDto {
    id: number;
    name: string;
    description?: string;
    orderIndex?: number;
    classId: number;
    className?: string;
}

export interface SubjectStructureResponseDto {
    id: number;
    name: string;
    description?: string;
    orderIndex?: number;
    classId?: number;
    className?: string;
    chapters: ChapterStructureResponseDto[];
}

// Chapter types
export interface ChapterRequestDto {
    subjectId: number;
    title: string;
    description?: string;
    status?: ChapterStatus;
    orderIndex?: number;
    videoId?: string;
    price?: number;
    free?: boolean;
}

export interface ChapterResponseDto {
    id: number;
    title: string;
    description?: string;
    status: ChapterStatus;
    orderIndex?: number;
    subjectId: number;
    subjectName?: string;
    classId?: number;
    className?: string;
    videoId?: string;
    price?: number;
    free?: boolean;
    teachers?: TeacherDto[];
}

export interface FeaturedChapterResponseDto {
    id: number;
    chapterId: number;
    title: string;
    description: string;
    subjectName: string;
    className: string;
    price: number;
    free: boolean;
    featuredAt: string;
}

export interface ChapterStructureResponseDto {
    id: number;
    title: string;
    status: ChapterStatus;
    orderIndex?: number;
    subjectId?: number;
    subjectName?: string;
    classId?: number;
    className?: string;
    topics: TopicStructureResponseDto[];
}

export interface TopicStructureResponseDto {
    id: number;
    title: string;
    orderIndex?: number;
    contentItems: ContentItemStructureResponseDto[];
}

export interface ContentItemStructureResponseDto {
    id: number;
    title: string;
    type: ContentItemType;
    orderIndex?: number;
}

export enum ContentItemType {
    LECTURE = "LECTURE",
    QUIZ = "QUIZ",
    PDF = "PDF",
    ASSIGNMENT = "ASSIGNMENT"
}

// Teacher types
export interface TeacherDto {
    id: number;
    fullName: string;
    email: string;
}

// Payment types
export interface PaymentRequestDto {
    chapterId: number;
    transactionId?: string;
    senderNumber?: string;
    amount?: number;
    paymentMethod?: string;
}

export interface PaymentResponseDto {
    id: number;
    userId: number;
    userName?: string;
    chapterId: number;
    chapterTitle?: string;
    senderNumber?: string;
    transactionId?: string;
    amount?: number;
    paymentMethod?: string;
    status: PaymentStatus;
    verifiedAt?: string;
    verifiedByUserId?: number;
    verifiedByName?: string;
}

// Admin Statistics types
export interface AdminStatisticsDto {
    userStats: UserStats;
    courseStats: CourseStats;
    chapterStats: ChapterStats;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    admins: number;
    managers: number;
    teachers: number;
    students: number;
}

export interface CourseStats {
    totalClasses: number;
    totalSubjects: number;
    totalChapters: number;
}

export interface ChapterStats {
    totalDraft: number;
    totalPublished: number;
    totalFree: number;
}

// Form state types
export interface ClassFormState {
    name: string;
    description: string;
}

export interface SubjectFormState {
    classId: number;
    name: string;
    description: string;
    orderIndex: number;
}

export interface ChapterFormState {
    subjectId: number;
    title: string;
    description: string;
    status: ChapterStatus;
    orderIndex: number;
    videoId: string;
    price: number;
    free: boolean;
}

// Topic types
export interface TopicRequestDto {
    chapterId: number;
    title: string;
    description?: string;
    orderIndex?: number;
}

export interface TopicResponseDto {
    id: number;
    title: string;
    description?: string;
    orderIndex?: number;
    chapterId: number;
}

// Content types
export interface LectureRequestDto {
    topicId: number;
    title: string;
    videoId?: string;
    content?: string;
    orderIndex: number;
}

export interface GooglePdfContentRequestDto {
    topicId: number;
    title: string;
    googleFileId: string;
    pageCount?: number;
    orderIndex: number;
}

export interface LectureResponseDto {
    id: number;
    title: string;
    videoId?: string;
    content?: string;
    topicId: number;
    topicTitle: string;
    orderIndex: number;
}

export interface GooglePdfContentResponseDto {
    id: number;
    title: string;
    googleFileId: string;
    pageCount: number;
    topicId: number;
    topicTitle: string;
    orderIndex: number;
}


export enum QuizType {
    MCQ = "MCQ",
    WRITTEN = "WRITTEN",
    FILL_BLANK = "FILL_BLANK",
    TABLE_MATCHING = "TABLE_MATCHING",
    MIXED = "MIXED"
}

export enum QuizQuestionType {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    FILL_IN_THE_BLANK = "FILL_IN_THE_BLANK",
    MATCHING = "MATCHING",
    WRITTEN = "WRITTEN"
}

export interface QuizOptionRequestDto {
    optionText: string;
    isCorrect: boolean;
}

export interface QuizFillBlankRequestDto {
    blankPosition: number;
    correctAnswer: string;
}

export interface QuizTableMatchingRequestDto {
    leftItem: string;
    rightItem: string;
    orderIndex: number;
}

export interface QuizWrittenAnswerRequestDto {
    sampleAnswer: string;
}

export interface QuizQuestionRequestDto {
    questionText: string;
    type: QuizQuestionType;
    orderIndex: number;
    marks: number;
    options?: QuizOptionRequestDto[];
    writtenAnswer?: QuizWrittenAnswerRequestDto;
    fillBlanks?: QuizFillBlankRequestDto[];
    tableMatchings?: QuizTableMatchingRequestDto[];
}

export interface QuizOptionResponseDto {
    id: number;
    optionText: string;
    isCorrect: boolean;
}

export interface QuizFillBlankResponseDto {
    id: number;
    blankPosition: number;
    correctAnswer: string;
}

export interface QuizTableMatchingResponseDto {
    id: number;
    leftItem: string;
    rightItem: string;
    orderIndex: number;
}

export interface QuizWrittenAnswerResponseDto {
    id: number;
    sampleAnswer: string;
}

export interface QuizQuestionResponseDto {
    id: number;
    questionText: string;
    type: QuizQuestionType;
    orderIndex: number;
    marks: number;
    options: QuizOptionResponseDto[];
    writtenAnswer: QuizWrittenAnswerResponseDto | null;
    fillBlanks: QuizFillBlankResponseDto[];
    tableMatchings: QuizTableMatchingResponseDto[];
}

export interface QuizResponseDto {
    id: number;
    title: string;
    quizType: QuizType;
    instruction?: string;
    timeLimit?: number;
    totalMarks?: number;
    passPercentage?: number;
    topicId: number;
    topicTitle: string;
    orderIndex: number;
    questions: QuizQuestionResponseDto[];
}

export interface QuizRequestDto {

    topicId: number;
    title: string;
    quizType: QuizType;
    instruction?: string;
    timeLimit?: number;
    totalMarks?: number;
    passPercentage?: number;
    orderIndex: number;
    questions?: QuizQuestionRequestDto[];
}

// Statistics types
export interface ChapterStatisticsDto {
    chapterId: number;
    totalEnrolledStudents: number;
}

export interface StudentChapterProgressDto {
    studentId: number;
    studentName: string;
    progressPercentage: number;
    completed: boolean;
}

export interface ChapterProgressResponseDto {
    chapterId: number;
    chapterTitle: string;
    progressPercentage: number;
    completed: boolean;
}

export interface ContentProgressResponseDto {
    contentItemId: number;
    completed: boolean;
    score?: number;
}

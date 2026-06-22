// Shop (educational products) types — mirror the demo backend's shop DTOs.

export type ShopProductType =
    | "NOTES"
    | "PDF_CHAPTER"
    | "INTERACTIVE_LEARNING"
    | "BOARD_ANALYSIS"
    | "CHAPTER_ANALYSIS"
    | "BOARD_SOLUTION"
    | "WORKSHEET"
    | "DRILLSHEET"
    | "RECALL_CARD"
    | "INTERACTIVE_TEST"
    | "BOOK";

export type ShopProductFormat = "PDF" | "INTERACTIVE";

export interface ShopLevel {
    id: number;
    name: string;
    orderIndex: number;
}

export interface ShopProductCard {
    id: number;
    title: string;
    description: string;
    type: ShopProductType;
    format: ShopProductFormat;
    price: number;
    status: string;
    featured: boolean;
    preview: string;
    downloadable: boolean;
    levelId: number | null;
    levelName: string | null;
    subjectId: number | null;
    subjectName: string | null;
    chapterId: number | null;
    chapterTitle: string | null;
}

export interface ShopProductDetail extends ShopProductCard {
    entitled: boolean;
    canDownload: boolean;
}

export interface ShopProductContent {
    id: number;
    title: string;
    type: ShopProductType;
    format: ShopProductFormat;
    watermark: string;
    html?: string;
    fileId?: string;
    pageCount?: number;
}

export interface ShopBundle {
    id: number;
    title: string;
    description: string;
    audience: "GENERAL" | "TEACHER_COACHING";
    accessMode: "ONLINE" | "DOWNLOAD";
    price: number;
    status: string;
    levelId: number | null;
    levelName: string | null;
    subjectId: number | null;
    subjectName: string | null;
    productCount: number;
    products: ShopProductCard[];
}

export interface ShopPurchase {
    kind: "PRODUCT" | "BUNDLE";
    grantedAt: string;
    [key: string]: any;
}

export interface ShopFilters {
    type?: ShopProductType;
    levelId?: number;
    subjectId?: number;
    chapterId?: number;
    format?: ShopProductFormat;
}

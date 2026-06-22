import {
    LuNotebook,
    LuFileText,
    LuBookOpen,
    LuChartBar,
    LuChartLine,
    LuListChecks,
    LuClipboardList,
    LuPencil,
    LuLayers,
    LuClipboardCheck,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import type { ShopProductType } from "@/types/shop";

// Display label, icon and tailwind colour classes for each product type.
// tagClass = small pill; iconClass = the rounded icon square.
export const PRODUCT_TYPE_META: Record<
    ShopProductType,
    { label: string; icon: IconType; iconClass: string; tagClass: string }
> = {
    NOTES: { label: "Notes", icon: LuNotebook, iconClass: "bg-amber-100 text-amber-600", tagClass: "bg-amber-50 text-amber-700" },
    PDF_CHAPTER: { label: "Chapter PDF", icon: LuFileText, iconClass: "bg-teal-100 text-teal-600", tagClass: "bg-teal-50 text-teal-700" },
    INTERACTIVE_LEARNING: { label: "Interactive", icon: LuBookOpen, iconClass: "bg-indigo-100 text-indigo-600", tagClass: "bg-indigo-50 text-indigo-700" },
    BOARD_ANALYSIS: { label: "Board analysis", icon: LuChartBar, iconClass: "bg-blue-100 text-blue-600", tagClass: "bg-blue-50 text-blue-700" },
    CHAPTER_ANALYSIS: { label: "Chapter analysis", icon: LuChartLine, iconClass: "bg-sky-100 text-sky-600", tagClass: "bg-sky-50 text-sky-700" },
    BOARD_SOLUTION: { label: "Board solution", icon: LuListChecks, iconClass: "bg-purple-100 text-purple-600", tagClass: "bg-purple-50 text-purple-700" },
    WORKSHEET: { label: "Worksheet", icon: LuClipboardList, iconClass: "bg-green-100 text-green-600", tagClass: "bg-green-50 text-green-700" },
    DRILLSHEET: { label: "Drill sheet", icon: LuPencil, iconClass: "bg-rose-100 text-rose-600", tagClass: "bg-rose-50 text-rose-700" },
    RECALL_CARD: { label: "Recall card", icon: LuLayers, iconClass: "bg-cyan-100 text-cyan-600", tagClass: "bg-cyan-50 text-cyan-700" },
    INTERACTIVE_TEST: { label: "Interactive test", icon: LuClipboardCheck, iconClass: "bg-violet-100 text-violet-600", tagClass: "bg-violet-50 text-violet-700" },
    BOOK: { label: "Book", icon: LuBookOpen, iconClass: "bg-gray-100 text-gray-600", tagClass: "bg-gray-100 text-gray-700" },
};

// The three browsable type families shown on the shop landing page.
export const TYPE_FAMILIES: { key: string; label: string; types: ShopProductType[] }[] = [
    { key: "study", label: "Study materials", types: ["NOTES", "PDF_CHAPTER", "INTERACTIVE_LEARNING", "BOOK"] },
    { key: "practice", label: "Practice", types: ["WORKSHEET", "DRILLSHEET", "RECALL_CARD", "INTERACTIVE_TEST"] },
    { key: "exam", label: "Exam prep", types: ["BOARD_ANALYSIS", "CHAPTER_ANALYSIS", "BOARD_SOLUTION"] },
];

export const formatTaka = (n: number) => `৳ ${n}`;

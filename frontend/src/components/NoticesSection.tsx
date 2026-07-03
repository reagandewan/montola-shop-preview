"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuMegaphone, LuChevronLeft, LuChevronRight, LuArrowRight } from "react-icons/lu";
import { getNotices, Notice, NoticeType } from "@/lib/notices";
import { useI18n } from "@/contexts/I18nProvider";

const STYLES: Record<NoticeType, { wrap: string; tag: string; label: string }> = {
    INFO: { wrap: "bg-blue-50 border-blue-200", tag: "bg-blue-100 text-blue-700", label: "Info" },
    IMPORTANT: { wrap: "bg-primary-50 border-primary-200", tag: "bg-primary-100 text-primary-700", label: "Important" },
    URGENT: { wrap: "bg-rose-50 border-rose-200", tag: "bg-rose-100 text-rose-700", label: "Urgent" },
};

export default function NoticesSection() {
    const { t } = useI18n();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [i, setI] = useState(0);

    useEffect(() => {
        getNotices().then(setNotices).catch(() => setNotices([]));
    }, []);

    // auto-advance every 6s (only when more than one)
    useEffect(() => {
        if (notices.length < 2) return;
        const id = setInterval(() => setI((p) => (p + 1) % notices.length), 6000);
        return () => clearInterval(id);
    }, [notices.length]);

    if (notices.length === 0) return null;

    const n = notices[i % notices.length];
    const s = STYLES[n.type] || STYLES.INFO;
    const go = (d: number) => setI((p) => (p + d + notices.length) % notices.length);

    return (
        <section className="px-6 -mt-8 relative z-10">
            <div className="max-w-5xl mx-auto">
                <div className={`rounded-2xl border shadow-sm p-5 md:p-6 flex items-start gap-4 ${s.wrap}`}>
                    <div className="hidden sm:flex w-11 h-11 shrink-0 rounded-xl bg-white/70 items-center justify-center text-gray-700">
                        <LuMegaphone size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.tag}`}>
                                {t(`notices.type.${n.type}`)}
                            </span>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t("notices.label")}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 leading-snug">{n.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                        {n.link && (
                            <Link href={n.link} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 mt-2">
                                {t("notices.viewMore")} <LuArrowRight size={14} />
                            </Link>
                        )}
                    </div>
                    {notices.length > 1 && (
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <div className="flex gap-1">
                                <button aria-label="Previous notice" onClick={() => go(-1)} className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-600">
                                    <LuChevronLeft size={16} />
                                </button>
                                <button aria-label="Next notice" onClick={() => go(1)} className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-600">
                                    <LuChevronRight size={16} />
                                </button>
                            </div>
                            <div className="flex gap-1.5">
                                {notices.map((_, idx) => (
                                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === i % notices.length ? "bg-gray-700" : "bg-gray-300"}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

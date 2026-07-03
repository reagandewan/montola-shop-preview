"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuSparkles, LuChevronLeft, LuChevronRight, LuBookOpen, LuShoppingBag } from "react-icons/lu";
import { getFeaturedChapters } from "@/lib/public";
import { getFeaturedProducts } from "@/lib/shop";
import { useI18n } from "@/contexts/I18nProvider";
import { formatTaka } from "@/lib/shopMeta";

interface NewItem {
    key: string;
    kind: "chapter" | "product";
    title: string;
    subtitle: string;
    price: number;
    free: boolean;
    href: string;
}

export default function WhatsNewSection() {
    const { t } = useI18n();
    const [items, setItems] = useState<NewItem[]>([]);
    const scroller = useRef<HTMLDivElement>(null);

    useEffect(() => {
        Promise.all([
            getFeaturedChapters().catch(() => []),
            getFeaturedProducts().catch(() => []),
        ]).then(([chapters, products]) => {
            const ch: NewItem[] = (chapters || []).map((c: any) => ({
                key: `ch-${c.chapterId ?? c.id}`,
                kind: "chapter",
                title: c.title,
                subtitle: [c.className, c.subjectName].filter(Boolean).join(" · "),
                price: c.price ?? 0,
                free: !!c.free,
                href: `/chapters/${c.chapterId ?? c.id}`,
            }));
            const pr: NewItem[] = (products || []).map((p: any) => ({
                key: `pr-${p.id}`,
                kind: "product",
                title: p.title,
                subtitle: [p.levelName, p.subjectName].filter(Boolean).join(" · "),
                price: p.price ?? 0,
                free: p.price === 0,
                href: `/shop/products/${p.id}`,
            }));
            // interleave so both content types show up early
            const merged: NewItem[] = [];
            const max = Math.max(ch.length, pr.length);
            for (let k = 0; k < max; k++) {
                if (ch[k]) merged.push(ch[k]);
                if (pr[k]) merged.push(pr[k]);
            }
            setItems(merged);
        });
    }, []);

    if (items.length === 0) return null;

    const scroll = (dir: number) => {
        scroller.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
    };

    return (
        <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-end justify-between mb-6 gap-4">
                    <div>
                        <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                            <LuSparkles size={14} /> {t("whatsNew.badge")}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{t("whatsNew.title")}</h2>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        <button aria-label="Scroll left" onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center">
                            <LuChevronLeft size={18} />
                        </button>
                        <button aria-label="Scroll right" onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center">
                            <LuChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div ref={scroller} className="flex gap-5 overflow-x-auto pb-3 snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {items.map((it) => (
                        <Link
                            key={it.key}
                            href={it.href}
                            className="snap-start shrink-0 w-64 bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                    {it.kind === "chapter" ? <LuBookOpen size={18} /> : <LuShoppingBag size={18} />}
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                                    {t("whatsNew.new")}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{it.title}</h3>
                            <p className="text-xs text-gray-500 mb-4">{it.subtitle}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">
                                    {it.kind === "chapter" ? t("whatsNew.kindChapter") : t("whatsNew.kindProduct")}
                                </span>
                                <span className="font-bold text-gray-900 text-sm">
                                    {it.free ? t("whatsNew.free") : formatTaka(it.price)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

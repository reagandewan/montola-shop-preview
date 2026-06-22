import Link from "next/link";
import { PRODUCT_TYPE_META, formatTaka } from "@/lib/shopMeta";
import type { ShopProductCard } from "@/types/shop";

export default function ProductCard({ product }: { product: ShopProductCard }) {
    const meta = PRODUCT_TYPE_META[product.type];
    const Icon = meta.icon;
    const scope = [product.levelName, product.subjectName, product.chapterTitle].filter(Boolean).join(" · ");

    return (
        <Link
            href={`/shop/products/${product.id}`}
            className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300 overflow-hidden"
        >
            <div className={`h-20 flex items-center justify-center ${meta.iconClass}`}>
                <Icon size={30} />
            </div>
            <div className="flex flex-col flex-1 p-4">
                <span className={`self-start text-[11px] font-medium px-2.5 py-0.5 rounded-full ${meta.tagClass}`}>
                    {meta.label}
                </span>
                <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1 leading-snug">{product.title}</h3>
                {scope && <p className="text-xs text-gray-500">{scope}</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="font-bold text-gray-900">{formatTaka(product.price)}</span>
                    <span className="text-xs font-medium text-primary-600">View →</span>
                </div>
            </div>
        </Link>
    );
}

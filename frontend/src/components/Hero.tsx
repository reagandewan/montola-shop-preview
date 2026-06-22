import { useI18n } from "@/contexts/I18nProvider";
import Link from "next/link";

export default function Hero() {
    const { t } = useI18n();

    return (
        <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-32 px-6 text-center">
            {/* White container for brand visibility on green background */}
            <div className="w-24 h-24 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-2xl p-4 animate-in fade-in zoom-in duration-700 ring-4 ring-white/30">
                <img
                    src="/montola-logo.png"
                    alt="Montola School Logo"
                    className="w-full h-full object-contain"
                />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight">
                {t("home.hero.title")}
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto">
                {t("home.hero.subtitle")}
            </p>
            <div className="flex justify-center space-x-4">
                <Link href="/classes" className="px-6 py-3 bg-white text-primary-500 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
                    {t("home.hero.startLearning")}
                </Link>
                <Link href="/classes" className="px-6 py-3 border border-white rounded-lg font-semibold hover:bg-white hover:text-primary-500 transition inline-block">
                    {t("home.hero.exploreClasses")}
                </Link>
            </div>
        </section>
    );
}

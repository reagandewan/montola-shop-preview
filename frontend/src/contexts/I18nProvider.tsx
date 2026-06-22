"use client";

import React, { createContext, useContext, useState } from "react";
import en from "@/locales/en/common.json";
import bn from "@/locales/bn/common.json";

type Messages = Record<string, any>;

type I18nContextType = {
    lang: "en" | "bn";
    t: (key: string, variables?: Record<string, any>) => string;
    switchLang: (lang: "en" | "bn") => void;
};

const resources: Record<"en" | "bn", Messages> = { en, bn };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {

    const [lang, setLang] = useState<"en" | "bn">("en");

    const t = (key: string, variables?: Record<string, any>): string => {
        const keys = key.split(".");
        let value: any = resources[lang];

        for (const k of keys) {
            value = value?.[k];

            if (!value)
                return key;
        }

        if (typeof value === "string" && variables) {
            Object.entries(variables).forEach(([k, v]) => {
                value = value.replace(new RegExp(`{{${k}}}`, "g"), v);
            });
        }

        return value;
    };

    const switchLang = (newLang: "en" | "bn") => setLang(newLang);

    return (
        <I18nContext.Provider value={{ lang, t, switchLang }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const ctx = useContext(I18nContext);

    if (!ctx)
        throw new Error("useI18n must be used inside I18nProvider");

    return ctx;
}
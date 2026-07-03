import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#e6f4ea",
                    100: "#c0e4c6",
                    200: "#97d7a0",
                    300: "#6fc97b",
                    400: "#4ab95c",
                    500: "#2ca83e",
                    600: "#228a33",
                    700: "#196b27",
                    800: "#0f4c1b",
                    900: "#07300f",
                },
                accent: "#ffffff",
            },
            fontFamily: {
                sans: ["var(--font-poppins)", "ui-sans-serif", "system-ui"],
                heading: ["var(--font-poppins)", "ui-sans-serif", "system-ui"],
                serif: ["var(--font-lora)", "Georgia", "serif"],
            },
        },
    },
    plugins: [],
};

export default config;

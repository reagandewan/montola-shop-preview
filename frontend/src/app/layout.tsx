// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppChrome from "@/components/AppChrome";
import NextTopLoader from "nextjs-toploader";
import { Poppins, Lora } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

// Serif used sparingly for editorial accents (hero, section headings, motto)
const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const metadata = {
  title: "Montola School",
  description: "Learning Platform",
  icons: {
    icon: "/montola-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${lora.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <NextTopLoader
          color="#2ca83e"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2ca83e,0 0 5px #2ca83e"
        />
        <AuthProvider>
          <I18nProvider>
            <AppChrome>{children}</AppChrome>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />

          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
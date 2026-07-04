import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";

const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], weight: ["300", "400", "500", "600", "700", "800", "900"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Area | نبني حضورك الرقمي",
  description: "نبني حضورك الرقمي.. من صفحة هبوط تخطف الأنظار، إلى نظام ERP يدير شركتك بالكامل.",
  keywords: ["تصميم مواقع", "ERP", "متجر إلكتروني", "صفحة هبوط", "لوحة تحكم", "تطوير ويب"],
  authors: [{ name: "Web Area" }],
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "any" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${inter.variable} antialiased bg-background text-foreground font-cairo`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

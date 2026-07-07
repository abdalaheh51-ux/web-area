import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import Script from "next/script";
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
  openGraph: {
    title: "Web Area | نبني حضورك الرقمي",
    description: "نبني حضورك الرقمي.. من صفحة هبوط تخطف الأنظار، إلى نظام ERP يدير شركتك بالكامل.",
    url: "https://web-area-a.vercel.app/",
    siteName: "Web Area",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Web Area Logo",
      },
    ],
    locale: "ar",
    type: "website",
  },
  verification: {
    google: "googlebe4495aff1425441",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-a.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon-a.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="googlebe4495aff1425441" />
        <meta name="google-site-verification" content="iGwlgHtt_QDCyLUwaLWHuC5k5TCtjjCuhvlUOCQRN3U" />
        {/* Favicons explicitly declared for crawlers */}
        <link rel="icon" href="/favicon-a.png" sizes="48x48" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Site Name Schema for Google Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Web Area",
              "alternateName": ["ويب اريا", "WebArea"],
              "url": "https://web-area-a.vercel.app/"
            })
          }}
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YP1VFPTNZP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YP1VFPTNZP');
          `}
        </Script>
      </head>
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

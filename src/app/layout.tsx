import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { siteConfig } from "@/config/site";
import { clientEnv } from "@/lib/env/client";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareProvider } from "@/features/comparison/compare-store";
import { CompareBar } from "@/features/comparison/compare-bar";
import "./globals.css";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — onafhankelijk vergelijken`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1512" },
  ],
  colorScheme: "light dark",
};

/**
 * Zet de thema-class vóór hydration zodat er geen flits van het verkeerde
 * thema optreedt. Leest een opgeslagen voorkeur of valt terug op het systeem.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.language}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <CompareProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
          <CompareBar />
        </CompareProvider>
        {clientEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <>
            <Script
              defer
              data-domain={clientEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
              src={`${clientEnv.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://plausible.io"}/js/script.tagged-events.outbound-links.js`}
            />
            <Script id="plausible-init">
              {`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { siteConfig } from "@/config/site";
import { clientEnv } from "@/lib/env/client";
import { getDaisyconMetaVerification } from "@/lib/affiliate/daisycon-verification";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareProvider } from "@/features/comparison/compare-store";
import { CompareBar } from "@/features/comparison/compare-bar";
import { CartProvider } from "@/features/checkout/cart-store";
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
    default: `${siteConfig.name}: onafhankelijk vergelijken`,
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
  const daisyconVerify = getDaisyconMetaVerification();

  return (
    <html
      lang={siteConfig.language}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {daisyconVerify && <meta name={daisyconVerify.name} content={daisyconVerify.content} />}
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <CartProvider>
          <CompareProvider>
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
            <SiteFooter />
            <CompareBar />
          </CompareProvider>
        </CartProvider>
        {(clientEnv.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID || clientEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) && (
          <>
            {clientEnv.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID ? (
              <>
                <Script
                  async
                  src={`${clientEnv.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://plausible.io"}/js/${clientEnv.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID}.js`}
                />
                <Script id="plausible-init">
                  {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
                </Script>
              </>
            ) : (
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
          </>
        )}
      </body>
    </html>
  );
}

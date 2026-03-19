import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const SITE_URL = "https://michibiki.tech";
const SITE_NAME = "みちびき 導";
const DESCRIPTION =
  "みちびきは、AIを活用して世界中の優秀な人材と企業を最適にマッチングするプラットフォームです。スキル・経験・志向をAIが分析し、最適な仕事と出会えます。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "みちびき 導 | AIが見つける、最適な仕事と人材",
    template: "%s | みちびき 導",
  },
  description: DESCRIPTION,
  keywords: [
    "AI人材マッチング",
    "求人",
    "転職",
    "リモートワーク",
    "フリーランス",
    "人材採用",
    "みちびき",
    "導",
    "Michibiki",
    "AI matching",
    "talent platform",
    "日本",
    "エンジニア採用",
    "グローバル人材",
  ],
  authors: [{ name: "みちびき" }],
  creator: "みちびき",
  publisher: "みちびき",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "みちびき 導 | AIが見つける、最適な仕事と人材",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "みちびき 導 | AIが見つける、最適な仕事と人材",
    description: DESCRIPTION,
    creator: "@michibiki_jp",
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    "google-site-verification": "", // Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&family=Yuji+Boku&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "みちびき",
              alternateName: "Michibiki",
              url: SITE_URL,
              logo: `${SITE_URL}/logo-icon.png`,
              description: DESCRIPTION,
              sameAs: [],
            }),
          }}
        />
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "みちびき 導",
              alternateName: "Michibiki",
              url: SITE_URL,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: DESCRIPTION,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
              inLanguage: "ja",
            }),
          }}
        />
      </head>
      <body className="antialiased bg-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

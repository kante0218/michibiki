import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const SITE_URL = "https://michibiki.tech";
const SITE_NAME = "みちびき 導";
const DESCRIPTION =
  "導（みちびき）は、AIを活用した面接練習・人材マッチングプラットフォームです。AI面接で実力を測定し、スキル・経験・志向をAIが分析して最適な仕事と出会えます。33分野のAI面接練習も無料で利用可能。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "導（みちびき）| AI面接練習・AI人材マッチングプラットフォーム",
    template: "%s | みちびき 導",
  },
  description: DESCRIPTION,
  keywords: [
    "導",
    "導き",
    "みちびき",
    "Michibiki",
    "AI面接",
    "AI面接練習",
    "AI面接対策",
    "AI人材マッチング",
    "AI採用",
    "AI求人",
    "求人",
    "転職",
    "就職",
    "リモートワーク",
    "フリーランス",
    "人材採用",
    "エンジニア採用",
    "グローバル人材",
    "AI matching",
    "talent platform",
    "日本",
    "面接練習",
    "模擬面接",
    "オンライン面接",
    "技術面接",
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
    title: "導（みちびき）| AI面接練習・AI人材マッチングプラットフォーム",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "導（みちびき）| AI面接練習・AI人材マッチングプラットフォーム",
    description: DESCRIPTION,
    creator: "@michibiki_jp",
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    "google-site-verification": "uhx_lVfAWGPtJYufIRKtKhYhU6omOQGZvbudi_gtrPg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Yuji+Boku&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "導（みちびき）",
              alternateName: ["みちびき", "Michibiki", "導"],
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
              name: "導（みちびき）",
              alternateName: ["みちびき", "Michibiki", "導き AI"],
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
              featureList: [
                "AI面接練習（33分野対応）",
                "AI人材マッチング",
                "ビデオ面接",
                "技術テスト（選択5問+記述5問）",
                "AIによるスキル評価",
              ],
            }),
          }}
        />
        {/* Structured Data - FAQPage for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "導（みちびき）とは何ですか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "導（みちびき）は、AIを活用した面接練習・人材マッチングプラットフォームです。33分野のAI面接練習を無料で提供し、技術テストとビデオ面接でスキルを評価します。",
                  },
                },
                {
                  "@type": "Question",
                  name: "AI面接練習はどのように行われますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "選択問題5問と記述問題5問の技術テストを受けた後、AIがビデオ面接を実施します。テスト結果をもとにAIが弱点を深掘りする質問を行い、実践的な面接練習ができます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "導（みちびき）は無料で使えますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "はい、導（みちびき）は無料でご利用いただけます。AI面接練習、求人検索、スキル評価など、すべての基本機能を無料で提供しています。",
                  },
                },
              ],
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

import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const SITE_URL = "https://michibiki.tech";
const SITE_NAME = "みちびき 導";
const DESCRIPTION =
  "導（みちびき）は、高専生・大学院生に特化したAI面接・採用マッチングプラットフォームです。22以上の専門分野に対応したAI面接で、研究力・技術力・ポテンシャルを正しく評価し、最適な企業とマッチングします。学生は完全無料。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "導（みちびき）| 高専生・大学院生の就活・採用プラットフォーム",
    template: "%s | みちびき 導",
  },
  description: DESCRIPTION,
  keywords: [
    // ブランド名
    "導", "導き", "みちびき", "Michibiki", "michibiki.tech",
    // 高専系
    "高専 就活", "高専 就職", "高専卒 採用", "高専卒 求人", "高専 エンジニア",
    "高専 インターン", "高専生 就職活動", "高専 新卒", "高専 企業",
    "高専 機械工学", "高専 電気電子", "高専 情報工学", "高専 化学",
    "国立高専", "高等専門学校 就職", "高専 キャリア",
    // 大学院系
    "大学院生 就活", "大学院生 就職", "大学院 新卒", "大学院 採用",
    "修士 就活", "修士 就職", "博士 就職", "博士 キャリア",
    "理系 就活", "理系 新卒", "理系 求人", "理系 採用",
    "研究職 求人", "研究者 就職", "院生 インターン",
    // AI面接系
    "AI面接", "AI面接 新卒", "AI採用", "AI スキル評価",
    "技術面接", "技術面接 対策", "面接 AI", "オンライン面接",
    // 就活系
    "新卒 面接", "新卒採用", "就活", "就職活動", "インターンシップ",
    "エンジニア 新卒", "メーカー 新卒", "IT企業 新卒",
    // 専門分野系
    "機械工学 就職", "電気電子 就職", "情報工学 就職",
    "化学工学 就職", "建築 就職", "生物工学 就職",
    "データサイエンス 就職", "AI エンジニア 就職",
    // English keywords
    "kosen career", "kosen student jobs", "graduate student jobs Japan",
    "AI interview", "STEM recruitment Japan", "engineering jobs Japan",
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
    title: "導（みちびき）| 高専生・大学院生の就活・採用プラットフォーム",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "導（みちびき）| 高専生・大学院生の就活・採用プラットフォーム",
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
        {/* Structured Data - WebSite (enables sitelinks search box) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "導（みちびき）",
              alternateName: ["みちびき", "Michibiki", "導", "AI面接"],
              url: SITE_URL,
              inLanguage: "ja",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
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
                "高専生・大学院生特化のAI面接（22分野対応）",
                "理系人材・企業マッチング",
                "ビデオ面接",
                "技術テスト（選択5問+記述5問）",
                "AIによる専門性・研究力評価",
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
                    text: "導（みちびき）は、高専生・大学院生に特化したAI面接・採用マッチングプラットフォームです。22以上の専門分野に対応し、研究力・技術力を正しく評価します。学生は完全無料です。",
                  },
                },
                {
                  "@type": "Question",
                  name: "AI面接はどのように行われますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "専門分野に合わせた技術テスト（選択5問+記述5問）とAIビデオ面接で構成されています。高専・大学院の学びに即した質問で、あなたの専門性を評価します。",
                  },
                },
                {
                  "@type": "Question",
                  name: "導（みちびき）は無料で使えますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "はい、学生は完全無料です。プロフィール登録、AI面接、企業マッチング、すべて無料でご利用いただけます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "高専生・大学院生以外も使えますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "現在は高専生（本科・専攻科）と大学院生（修士・博士）を主な対象としています。理系の専門知識を正しく評価するために特化したサービスです。",
                  },
                },
                {
                  "@type": "Question",
                  name: "企業がみちびきを使うメリットは何ですか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "AIが高専生・大学院生の専門性・研究力・ポテンシャルを客観的に評価し、貴社の求める人材像と自動マッチングします。理系人材の採用コスト削減とミスマッチ防止を実現します。",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased bg-white">
        <GoogleAnalytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

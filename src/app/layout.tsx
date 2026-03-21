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
    // ブランド名
    "導", "導き", "みちびき", "Michibiki", "michibiki.tech",
    // AI面接系
    "AI面接", "AI面接練習", "AI面接対策", "AI面接 無料", "AI模擬面接",
    "面接練習", "模擬面接", "面接対策", "面接練習 無料", "面接練習 オンライン",
    "オンライン面接", "オンライン面接対策", "Web面接 練習", "Web面接 対策",
    "技術面接", "技術面接 対策", "技術面接 練習", "コーディング面接",
    "面接 AI", "面接 練習 アプリ", "面接 シミュレーション", "面接 フィードバック",
    "英語面接 練習", "面接 質問 対策", "面接 準備", "面接 緊張 克服",
    // 転職・就職系
    "転職", "転職 サイト", "転職 エンジニア", "転職 IT", "転職活動",
    "就職", "就職活動", "就活", "就活 面接", "新卒 面接",
    "中途採用", "キャリアチェンジ", "キャリアアップ", "年収アップ",
    "第二新卒", "未経験 転職", "未経験 エンジニア",
    // 職種系
    "エンジニア 求人", "エンジニア 転職", "エンジニア 採用",
    "プログラマー 求人", "プログラマー 転職",
    "データサイエンティスト 求人", "データサイエンティスト 転職",
    "Webエンジニア 求人", "フロントエンド 求人", "バックエンド 求人",
    "フルスタック 求人", "インフラエンジニア 求人", "SRE 求人",
    "機械学習エンジニア 求人", "AIエンジニア 求人",
    "プロダクトマネージャー 求人", "PM 転職",
    "UXデザイナー 求人", "UIデザイナー 求人",
    "マーケティング 求人", "デジタルマーケティング 求人",
    // AI採用・マッチング系
    "AI採用", "AI求人", "AI人材マッチング", "AIマッチング",
    "AI スキル評価", "AI スキル診断", "AI 適性検査",
    "人材採用", "採用支援", "採用 効率化", "採用コスト削減",
    "スキルマッチング", "人材マッチング", "マッチング アプリ 仕事",
    // 働き方系
    "リモートワーク", "リモートワーク 求人", "在宅勤務 求人",
    "フリーランス", "フリーランス 求人", "業務委託 求人",
    "副業", "副業 エンジニア", "パラレルキャリア",
    "グローバル人材", "海外 求人", "外資系 求人", "英語 求人",
    // スキル系
    "Python 求人", "JavaScript 求人", "TypeScript 求人", "React 求人",
    "AWS 求人", "Go 求人", "Rust 求人", "Java 求人",
    "スキルアップ", "プログラミング スキル", "IT スキル 診断",
    // English keywords
    "AI interview", "AI interview practice", "AI mock interview",
    "job matching", "talent platform", "AI recruitment",
    "tech interview", "coding interview", "Japan jobs",
    "remote work Japan", "engineer jobs Japan",
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
                {
                  "@type": "Question",
                  name: "AI面接で対応している分野は何ですか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "ソフトウェアエンジニアリング、データサイエンス、プロダクトマネジメント、UXデザイン、マーケティングなど33分野に対応しています。各分野で専門的な技術テストとAI面接が受けられます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "企業がみちびきを使うメリットは何ですか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "AIが候補者のスキルを客観的に評価し、企業の求める人材像と自動マッチングします。採用コストの削減、選考時間の短縮、ミスマッチの防止が実現できます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "エンジニア転職に導（みちびき）は使えますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "はい、エンジニア転職に最適です。フロントエンド、バックエンド、フルスタック、インフラ、SRE、機械学習エンジニアなど幅広いエンジニア求人をAIマッチングで探せます。技術面接の対策もAI面接練習で行えます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "リモートワークの求人はありますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "はい、フルリモート、在宅勤務、ハイブリッドワークの求人を多数掲載しています。エンジニア、デザイナー、マーケター、PMなど幅広い職種でリモートワーク求人が見つかります。",
                  },
                },
                {
                  "@type": "Question",
                  name: "未経験からエンジニア転職はできますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "導（みちびき）では未経験からのエンジニア転職もサポートしています。AI面接で現在のスキルレベルを可視化し、ポテンシャル重視の求人とマッチングします。面接練習で自信をつけてから応募できます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "面接練習は何回でもできますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "はい、AI面接練習は回数無制限で何度でも無料で受けられます。異なる分野の面接を試したり、同じ分野で繰り返し練習してスコアを上げることもできます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "導（みちびき）と他の転職サイトの違いは何ですか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "導（みちびき）はAIが実際のスキルを評価してマッチングする点が最大の違いです。従来の転職サイトは履歴書・経歴書ベースですが、導ではAI面接で測定した実力をもとに求人を提案するため、ミスマッチが少なく、実力に見合った求人に出会えます。",
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

"use client";

import { Sidebar } from "@/components/ExploreHeader";
import Link from "next/link";

const values = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "イノベーション",
    description: "AI技術の最前線で、採用の未来を創造しています。新しいアイデアを歓迎し、失敗を恐れずチャレンジする文化です。",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: "グローバル",
    description: "東京・サンフランシスコ・バンガロールを拠点に、多国籍チームで働いています。多様な視点が私たちの強みです。",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "チームワーク",
    description: "フラットな組織で、誰もが意見を発信できます。チーム全体で成果を出し、共に成長することを大切にしています。",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: "成長",
    description: "学習支援制度やカンファレンス参加補助など、個人の成長を全面的にバックアップします。",
  },
];

const positions = [
  {
    title: "シニアフルスタックエンジニア",
    team: "プロダクト開発チーム",
    type: "正社員",
    location: "東京 / リモート",
    description: "Next.js、TypeScript、Pythonを使ったプラットフォーム開発をリードしていただきます。AIマッチングエンジンの改善やスケーラビリティの向上に取り組みます。",
    tags: ["TypeScript", "Next.js", "Python", "AWS"],
  },
  {
    title: "MLエンジニア",
    team: "AIチーム",
    type: "正社員",
    location: "東京 / リモート",
    description: "APEXスコア算出アルゴリズムの開発・改善、自然言語処理モデルの構築、AI面接システムの精度向上に携わっていただきます。",
    tags: ["Python", "PyTorch", "NLP", "MLOps"],
  },
  {
    title: "プロダクトデザイナー",
    team: "デザインチーム",
    type: "正社員",
    location: "東京",
    description: "ユーザーリサーチからUI/UXデザイン、プロトタイプ制作まで一貫して担当。求職者・企業双方にとって使いやすいプロダクト体験を設計します。",
    tags: ["Figma", "UXリサーチ", "デザインシステム"],
  },
  {
    title: "マーケティングマネージャー",
    team: "グロースチーム",
    type: "正社員",
    location: "東京",
    description: "日本市場におけるブランド戦略の立案・実行、コンテンツマーケティング、PR活動を統括。BtoB/BtoCの両面でユーザー獲得を推進します。",
    tags: ["デジタルマーケティング", "コンテンツ", "PR"],
  },
  {
    title: "カスタマーサクセス",
    team: "カスタマーチーム",
    type: "正社員 / 契約社員",
    location: "東京",
    description: "導入企業のオンボーディング支援、活用促進、課題解決を担当。データを活用した改善提案で顧客満足度向上を目指します。",
    tags: ["法人営業経験", "SaaS", "データ分析"],
  },
];

const benefits = [
  { label: "フレックスタイム制", detail: "コアタイム11:00-15:00" },
  { label: "リモートワーク", detail: "週3日までリモート可" },
  { label: "年間休日125日以上", detail: "土日祝、年末年始、夏季休暇" },
  { label: "学習支援制度", detail: "年間30万円まで書籍・講座を補助" },
  { label: "カンファレンス参加補助", detail: "国内外のカンファレンス参加費を全額負担" },
  { label: "ストックオプション", detail: "正社員全員に付与" },
  { label: "健康支援", detail: "人間ドック・ジム費用補助" },
  { label: "育児・介護支援", detail: "育休取得率100%、時短勤務制度" },
];

export default function CareersPage() {
  return (
    <>
      <Sidebar />
      <main className="ml-[96px] min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">ホーム</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">採用情報</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">採用情報</h1>
            <p className="text-gray-600">Michibikiは、AI技術を活用して世界中の人材と企業をつなぐプラットフォームです。急成長するチームで、あなたの力を発揮しませんか。</p>
          </div>
          {/* Values */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">私たちの価値観</h2>
            <p className="text-gray-600 mb-8">Michibikiのカルチャーを支える4つの柱</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-indigo-600 mb-3">{v.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Positions */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">募集中のポジション</h2>
            <p className="text-gray-600 mb-8">{positions.length}件のポジションを募集しています</p>
            <div className="space-y-4">
              {positions.map((pos, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{pos.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                        <span>{pos.team}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{pos.type}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{pos.location}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{pos.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {pos.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="shrink-0 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      応募する
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">福利厚生</h2>
            <p className="text-gray-600 mb-8">メンバーが安心して働ける環境を整えています</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{b.label}</p>
                  <p className="text-xs text-gray-500">{b.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">一緒に未来をつくりませんか？</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              ご興味をお持ちの方は、お気軽にご応募ください。カジュアル面談も受け付けています。
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                応募フォームへ
              </button>
              <button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                カジュアル面談を申し込む
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

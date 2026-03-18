"use client";

import { Sidebar } from "@/components/ExploreHeader";
import Link from "next/link";

const caseStudies = [
  {
    company: "株式会社テックフォワード",
    industry: "IT・SaaS",
    logo: "T",
    logoColor: "bg-blue-500",
    summary: "急成長SaaS企業がMichibikiを活用し、エンジニア採用を劇的に効率化。採用コストと期間の大幅削減を実現しました。",
    quote: "Michibiki導入後、候補者の質が明らかに向上しました。APEXスコアのおかげで、書類選考にかかる時間がほぼゼロになり、面接の段階からミスマッチが激減しました。",
    quotePerson: "田中 誠一",
    quoteRole: "CTO",
    stats: [
      { label: "採用コスト削減", value: "40%", icon: "down" },
      { label: "採用期間短縮", value: "平均45日→22日", icon: "clock" },
      { label: "定着率", value: "95%", icon: "up" },
    ],
  },
  {
    company: "グローバルファイナンス株式会社",
    industry: "金融・フィンテック",
    logo: "G",
    logoColor: "bg-emerald-500",
    summary: "金融業界特有の高い専門性が求められるポジションにおいて、AI面接とスキル評価を活用した精度の高いマッチングを実現しました。",
    quote: "金融ドメインの知識と技術力の両方を兼ね備えた人材を見つけるのは非常に困難でしたが、MichibikiのAI評価により、適切なスキルセットを持つ候補者に効率的にアクセスできるようになりました。",
    quotePerson: "佐藤 美咲",
    quoteRole: "人事部長",
    stats: [
      { label: "採用成功率", value: "3.5倍", icon: "up" },
      { label: "候補者スクリーニング時間", value: "70%削減", icon: "down" },
      { label: "年間採用数", value: "48名", icon: "up" },
    ],
  },
  {
    company: "ヘルステック・イノベーションズ合同会社",
    industry: "ヘルスケア・医療IT",
    logo: "H",
    logoColor: "bg-purple-500",
    summary: "医療×ITの希少な人材採用において、Michibikiのグローバルネットワークを活用。海外拠点のエンジニア採用にも成功しました。",
    quote: "医療ITの経験を持つエンジニアは日本国内だけでは見つけにくいですが、Michibikiのグローバルなプラットフォームにより、アジア各国から優秀な人材を採用できました。",
    quotePerson: "鈴木 健太郎",
    quoteRole: "CEO",
    stats: [
      { label: "グローバル採用比率", value: "60%", icon: "up" },
      { label: "オファー承諾率", value: "92%", icon: "up" },
      { label: "採用単価", value: "55%削減", icon: "down" },
    ],
  },
  {
    company: "リテイルDX株式会社",
    industry: "小売・EC",
    logo: "R",
    logoColor: "bg-orange-500",
    summary: "DX推進に必要なエンジニア・データサイエンティストをスピーディーに採用。プロジェクトの立ち上げからわずか2ヶ月でチーム構築を完了しました。",
    quote: "DXプロジェクトの納期が迫る中、チームマッチング機能で必要なスキルセットを持つチームを一括で提案してもらえたのは非常に助かりました。個別採用では絶対に間に合いませんでした。",
    quotePerson: "山本 亜希子",
    quoteRole: "DX推進室長",
    stats: [
      { label: "チーム構築期間", value: "2ヶ月", icon: "clock" },
      { label: "プロジェクト達成率", value: "100%", icon: "up" },
      { label: "エンジニア満足度", value: "4.8/5.0", icon: "up" },
    ],
  },
];

function StatIcon({ type }: { type: string }) {
  if (type === "up") {
    return (
      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  }
  if (type === "down") {
    return (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function CasesPage() {
  return (
    <>
      <Sidebar />
      <main className="ml-[96px] min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">ホーム</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">導入事例</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">導入事例</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Michibikiを導入いただいた企業の成果をご紹介します。業界を問わず、AI人材マッチングが採用課題を解決しています。
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "導入企業数", value: "500+" },
              { label: "平均採用コスト削減", value: "45%" },
              { label: "平均採用期間短縮", value: "50%" },
              { label: "顧客満足度", value: "4.8/5.0" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Case Studies */}
          <div className="space-y-8">
            {caseStudies.map((cs, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-100">
                  <div className={`w-12 h-12 rounded-xl ${cs.logoColor} flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">{cs.logo}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{cs.company}</h3>
                    <span className="text-sm text-gray-500">{cs.industry}</span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Summary */}
                  <p className="text-gray-600 mb-6">{cs.summary}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {cs.stats.map((stat) => (
                      <div key={stat.label} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                        <StatIcon type={stat.icon} />
                        <div>
                          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="bg-indigo-50 rounded-lg p-5 border-l-4 border-indigo-600">
                    <p className="text-sm text-gray-700 italic leading-relaxed mb-3">
                      &ldquo;{cs.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                        <span className="text-indigo-700 text-xs font-medium">{cs.quotePerson.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cs.quotePerson}</p>
                        <p className="text-xs text-gray-500">{cs.company} {cs.quoteRole}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">貴社の採用課題をMichibikiで解決しませんか？</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              導入に関するご相談・デモのご依頼はお気軽にお問い合わせください。
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                お問い合わせ
              </button>
              <button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                資料ダウンロード
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

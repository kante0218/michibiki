"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/ExploreHeader";
import Link from "next/link";

const expertDomains = [
  {
    id: "system-design",
    category: "IT・システム設計",
    title: "システム設計エキスパート",
    description: "大規模分散システム、マイクロサービス設計、クラウドアーキテクチャなど高度な技術判断力を評価",
    duration: "35分",
    format: "ケーススタディ + 技術討論",
    skills: ["システム設計", "分散処理", "スケーラビリティ", "API設計"],
    color: "indigo",
    interviewCategory: "system_design_expert",
  },
  {
    id: "ml-ai",
    category: "AI・機械学習",
    title: "ML/AIリサーチエキスパート",
    description: "機械学習モデルの設計、研究アプローチ、実験計画、最新手法の理解と応用力を評価",
    duration: "35分",
    format: "研究課題 + 技術討論",
    skills: ["機械学習", "深層学習", "統計学", "研究設計"],
    color: "purple",
    interviewCategory: "ml_research_expert",
  },
  {
    id: "finance",
    category: "金融・投資分析",
    title: "金融エキスパート",
    description: "DCF分析、リスク評価、ポートフォリオ理論、M&A分析など高度な金融判断プロセスを評価",
    duration: "30分",
    format: "ケーススタディ + 分析討論",
    skills: ["財務分析", "リスク管理", "投資判断", "バリュエーション"],
    color: "emerald",
    interviewCategory: "finance_expert",
  },
  {
    id: "medical",
    category: "医療・臨床判断",
    title: "医療エキスパート",
    description: "症例に基づく臨床判断プロセス、診断推論、治療方針決定の思考過程を評価",
    duration: "30分",
    format: "症例検討 + 判断討論",
    skills: ["臨床推論", "診断", "治療計画", "EBM"],
    color: "rose",
    interviewCategory: "medical_expert",
  },
  {
    id: "legal",
    category: "法律・法務",
    title: "法務エキスパート",
    description: "法的論点の整理、判例分析、契約レビュー、リーガルリスク評価の思考プロセスを評価",
    duration: "30分",
    format: "ケーススタディ + 法的討論",
    skills: ["法的分析", "契約法", "コンプライアンス", "判例研究"],
    color: "amber",
    interviewCategory: "legal_expert",
  },
  {
    id: "strategy",
    category: "経営・戦略コンサル",
    title: "戦略コンサルタント",
    description: "市場分析、競争戦略、事業計画策定、組織変革など経営判断の思考フレームワークを評価",
    duration: "35分",
    format: "ケーススタディ + 戦略討論",
    skills: ["戦略立案", "市場分析", "問題構造化", "仮説思考"],
    color: "sky",
    interviewCategory: "strategy_expert",
  },
];

const colorMap: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700", border: "border-indigo-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", badge: "bg-purple-100 text-purple-700", border: "border-purple-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", badge: "bg-rose-100 text-rose-700", border: "border-rose-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", badge: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", badge: "bg-sky-100 text-sky-700", border: "border-sky-200" },
};

export default function ExpertPage() {
  const [activeTab, setActiveTab] = useState<"interviews" | "about">("interviews");
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30">
      <Sidebar activeItem="expert" />

      <div className="ml-0 md:ml-[96px] flex-1">
        <TopBar />

        <div className="px-6 py-6 max-w-[1200px]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">エキスパート</h1>
            </div>
            <p className="text-sm text-gray-500">高度な専門知識を持つプロフェッショナル向け。思考プロセス（Chain-of-Thought）を評価するAI面接で、真の実力を証明しましょう。</p>
          </div>

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 rounded-t-xl mb-6">
            <nav className="flex gap-1 bg-gray-100/80 rounded-full p-1 w-fit">
              {[
                { key: "interviews" as const, label: "エキスパート面接" },
                { key: "about" as const, label: "エキスパートとは" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === "interviews" && (
            <>
              {/* CoT Explainer */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">思考プロセス（Chain-of-Thought）評価とは</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      通常の面接が「正解」を評価するのに対し、エキスパート面接は「正解に至る思考の過程」を評価します。
                      なぜその判断に至ったか、どのような代替案を検討したか、リスクをどう評価したか —
                      専門家としての深い思考力がAIによって可視化・スコア化されます。
                    </p>
                  </div>
                </div>
              </div>

              {/* Expert Interview Cards */}
              <div className="grid md:grid-cols-2 gap-5">
                {expertDomains.map((domain) => {
                  const c = colorMap[domain.color];
                  return (
                    <div
                      key={domain.id}
                      className={`bg-white rounded-2xl border border-gray-200 hover:${c.border} p-6 transition-all hover:shadow-md group cursor-pointer`}
                      onClick={() => router.push(`/expert/interview?category=${domain.interviewCategory}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                          {domain.category}
                        </span>
                        <span className="text-xs text-gray-400">{domain.duration}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {domain.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">{domain.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {domain.skills.map((skill) => (
                          <span key={skill} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          <span className={c.text}>●</span> {domain.format}
                        </span>
                        <span className="text-xs font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
                          面接を開始 →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "about" && (
            <div className="max-w-3xl">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">エキスパート面接の特徴</h2>
                <div className="space-y-4">
                  {[
                    { t: "思考プロセスの可視化", d: "回答だけでなく、判断に至った理由・検討した代替案・リスク評価のプロセスをAIが分析・スコア化します。" },
                    { t: "ケーススタディ形式", d: "実務に即した複雑なケースに取り組み、専門家としてのアプローチを示します。正解は一つではありません。" },
                    { t: "AIによる深層分析", d: "思考の深さ（Thinking Depth）、ユニークな洞察、ドメイン専門性を多角的に評価。通常面接より詳細なレポートを生成します。" },
                    { t: "企業からの直接オファー", d: "高スコアのエキスパートには、専門性を求める企業から直接オファーが届きます。通常の求人応募とは異なる採用チャネルです。" },
                  ].map((item) => (
                    <div key={item.t} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{item.t}</h3>
                        <p className="text-sm text-gray-500">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">通常面接との違い</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 text-left text-gray-500 font-medium"></th>
                        <th className="py-3 text-center text-gray-500 font-medium">通常面接</th>
                        <th className="py-3 text-center text-indigo-600 font-medium">エキスパート面接</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { label: "面接時間", normal: "20分", expert: "30〜40分" },
                        { label: "質問形式", normal: "選択式 + 記述式", expert: "ケーススタディ + 討論" },
                        { label: "評価対象", normal: "正解率・スキル", expert: "思考プロセス・判断力" },
                        { label: "分析レポート", normal: "基本スコア", expert: "CoT分析 + 洞察評価" },
                        { label: "企業からの露出", normal: "候補者プール", expert: "優先マッチング + 直接オファー" },
                      ].map((row) => (
                        <tr key={row.label}>
                          <td className="py-3 font-medium text-gray-700">{row.label}</td>
                          <td className="py-3 text-center text-gray-500">{row.normal}</td>
                          <td className="py-3 text-center text-indigo-600 font-medium">{row.expert}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

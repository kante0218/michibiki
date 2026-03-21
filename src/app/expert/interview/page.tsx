"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Sidebar, TopBar } from "@/components/ExploreHeader";
import Link from "next/link";

const categoryInfo: Record<string, { title: string; description: string; topics: string[]; duration: number; cotGuidance: string }> = {
  system_design_expert: {
    title: "システム設計エキスパート面接",
    description: "大規模システムの設計・アーキテクチャ判断について、思考プロセスを含めて評価します。",
    topics: ["分散システム設計", "スケーラビリティ", "トレードオフ分析", "障害耐性設計"],
    duration: 35,
    cotGuidance: "設計判断の理由、検討した代替案、各選択肢のトレードオフを言語化してください。",
  },
  ml_research_expert: {
    title: "ML/AIリサーチエキスパート面接",
    description: "機械学習の研究設計・モデル選定・実験計画について、思考プロセスを含めて評価します。",
    topics: ["モデル設計", "実験計画", "最新手法の理解", "研究アプローチ"],
    duration: 35,
    cotGuidance: "手法選定の根拠、期待する結果、潜在的なリスクと対策を言語化してください。",
  },
  finance_expert: {
    title: "金融エキスパート面接",
    description: "投資判断・財務分析・リスク評価について、思考プロセスを含めて評価します。",
    topics: ["DCF分析", "リスク評価", "ポートフォリオ理論", "M&A分析"],
    duration: 30,
    cotGuidance: "分析の前提条件、判断の根拠、想定リスクと感応度分析を言語化してください。",
  },
  medical_expert: {
    title: "医療エキスパート面接",
    description: "臨床判断・診断推論・治療方針について、思考プロセスを含めて評価します。",
    topics: ["臨床推論", "鑑別診断", "治療計画", "エビデンス評価"],
    duration: 30,
    cotGuidance: "優先した情報、鑑別診断の根拠、治療選択の理由と代替案を言語化してください。",
  },
  legal_expert: {
    title: "法務エキスパート面接",
    description: "法的分析・契約レビュー・リスク評価について、思考プロセスを含めて評価します。",
    topics: ["法的論点整理", "判例分析", "契約リスク", "コンプライアンス"],
    duration: 30,
    cotGuidance: "法的論点の整理、適用法令の根拠、リスク評価と対策案を言語化してください。",
  },
  strategy_expert: {
    title: "戦略コンサルタント面接",
    description: "経営戦略・市場分析・事業計画について、思考プロセスを含めて評価します。",
    topics: ["市場分析", "競争戦略", "事業計画", "組織変革"],
    duration: 35,
    cotGuidance: "問題の構造化、仮説の根拠、代替シナリオと推奨アクションを言語化してください。",
  },
};

function ExpertInterviewContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const info = categoryInfo[category];

  if (!info) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30">
        <Sidebar activeItem="expert" />
        <div className="ml-0 md:ml-[96px] flex-1">
          <TopBar />
          <div className="px-6 py-16 max-w-[800px] mx-auto text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 3v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">カテゴリが選択されていません</h2>
            <p className="text-sm text-gray-500 mb-6">エキスパートページから面接カテゴリを選択してください。</p>
            <Link href="/expert" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">← エキスパートに戻る</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30">
      <Sidebar activeItem="expert" />
      <div className="ml-0 md:ml-[96px] flex-1">
        <TopBar />
        <div className="px-6 py-6 max-w-[800px] mx-auto">
          {/* Back */}
          <Link href="/expert" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            エキスパートに戻る
          </Link>

          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">エキスパート面接</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{info.title}</h1>
            <p className="text-sm text-gray-500 mb-6">{info.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">面接時間</p>
                <p className="text-lg font-bold text-gray-900">{info.duration}分</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">評価方式</p>
                <p className="text-lg font-bold text-gray-900">CoT分析</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-medium text-gray-700 mb-2">評価トピック</p>
              <div className="flex flex-wrap gap-2">
                {info.topics.map((topic) => (
                  <span key={topic} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">{topic}</span>
                ))}
              </div>
            </div>

            {/* CoT Guidance */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900 mb-1">思考プロセスの言語化ガイド</h3>
                  <p className="text-sm text-indigo-700 leading-relaxed">{info.cotGuidance}</p>
                  <p className="text-xs text-indigo-500 mt-2">※ 回答の「正確さ」だけでなく、「どのように考えたか」が評価の重要なポイントです。</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/interview/live?category=${category}&expert=true`}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
                本番面接を開始
              </Link>
              <Link
                href={`/interview/practice?category=${category}&expert=true`}
                className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                練習する
              </Link>
            </div>
          </div>

          {/* What CoT evaluates */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Chain-of-Thought 評価の観点</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "問題理解", desc: "課題の本質を正しく把握しているか" },
                { title: "論理的アプローチ", desc: "解決に至る推論が論理的か" },
                { title: "代替案の検討", desc: "複数のアプローチを比較検討しているか" },
                { title: "リスク認識", desc: "潜在的なリスクを適切に評価しているか" },
                { title: "技術的深さ", desc: "専門分野の知識を深く活用しているか" },
                { title: "独自の洞察", desc: "他にないユニークな視点を提示しているか" },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-xl p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpertInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <ExpertInterviewContent />
    </Suspense>
  );
}

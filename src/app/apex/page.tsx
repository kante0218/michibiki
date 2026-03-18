"use client";

import { useState } from "react";
import Logo from "@/components/Logo";

const leaderboardData = [
  {
    rank: 1,
    model: "GPT-4o",
    provider: "OpenAI",
    overall: 92.4,
    investmentBanking: 94.1,
    consulting: 93.8,
    legal: 90.2,
    medical: 91.5,
    change: "up",
  },
  {
    rank: 2,
    model: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    overall: 91.8,
    investmentBanking: 92.3,
    consulting: 94.2,
    legal: 91.7,
    medical: 89.0,
    change: "up",
  },
  {
    rank: 3,
    model: "Gemini 1.5 Pro",
    provider: "Google",
    overall: 89.6,
    investmentBanking: 88.9,
    consulting: 91.0,
    legal: 89.4,
    medical: 89.1,
    change: "same",
  },
  {
    rank: 4,
    model: "Claude 3 Opus",
    provider: "Anthropic",
    overall: 88.2,
    investmentBanking: 90.5,
    consulting: 89.1,
    legal: 87.3,
    medical: 85.9,
    change: "down",
  },
  {
    rank: 5,
    model: "GPT-4 Turbo",
    provider: "OpenAI",
    overall: 87.5,
    investmentBanking: 89.2,
    consulting: 88.0,
    legal: 86.1,
    medical: 86.7,
    change: "down",
  },
  {
    rank: 6,
    model: "Llama 3.1 405B",
    provider: "Meta",
    overall: 85.3,
    investmentBanking: 84.7,
    consulting: 86.2,
    legal: 84.9,
    medical: 85.4,
    change: "up",
  },
  {
    rank: 7,
    model: "Mistral Large 2",
    provider: "Mistral AI",
    overall: 83.9,
    investmentBanking: 83.1,
    consulting: 85.0,
    legal: 83.7,
    medical: 83.8,
    change: "same",
  },
  {
    rank: 8,
    model: "Command R+",
    provider: "Cohere",
    overall: 81.2,
    investmentBanking: 80.5,
    consulting: 82.3,
    legal: 80.8,
    medical: 81.2,
    change: "down",
  },
];

const categories = [
  {
    title: "投資銀行",
    description: "財務モデリング、バリュエーション、M&Aアドバイザリーに関する専門タスクの評価。",
    topModel: "GPT-4o",
    topScore: 94.1,
  },
  {
    title: "コンサルティング",
    description: "ケーススタディ分析、戦略提案、市場調査に関するタスクの評価。",
    topModel: "Claude 3.5 Sonnet",
    topScore: 94.2,
  },
  {
    title: "法務",
    description: "契約書レビュー、法的リサーチ、コンプライアンス分析に関する評価。",
    topModel: "Claude 3.5 Sonnet",
    topScore: 91.7,
  },
  {
    title: "医療",
    description: "臨床知識、診断推論、医療文献の理解に関するタスクの評価。",
    topModel: "GPT-4o",
    topScore: 91.5,
  },
];

const methodologySteps = [
  {
    step: "01",
    title: "タスク設計",
    description: "各業界の専門家が実務に即したタスクを設計。リアルなビジネスシナリオに基づいています。",
  },
  {
    step: "02",
    title: "モデル評価",
    description: "同一条件下でAIモデルにタスクを実行させ、出力の品質を多角的に評価します。",
  },
  {
    step: "03",
    title: "専門家レビュー",
    description: "業界の専門家がAIの出力を詳細にレビューし、スコアリングを行います。",
  },
  {
    step: "04",
    title: "スコア算出",
    description: "複数の評価軸を統合し、正規化されたAPEXスコアを算出。定期的に更新します。",
  },
];

export default function ApexPage() {
  const [selectedCategory, setSelectedCategory] = useState("overall");

  const getSortedData = () => {
    const sorted = [...leaderboardData];
    if (selectedCategory === "investmentBanking") {
      sorted.sort((a, b) => b.investmentBanking - a.investmentBanking);
    } else if (selectedCategory === "consulting") {
      sorted.sort((a, b) => b.consulting - a.consulting);
    } else if (selectedCategory === "legal") {
      sorted.sort((a, b) => b.legal - a.legal);
    } else if (selectedCategory === "medical") {
      sorted.sort((a, b) => b.medical - a.medical);
    }
    return sorted.map((item, idx) => ({ ...item, displayRank: idx + 1 }));
  };

  const getScore = (item: (typeof leaderboardData)[0]) => {
    switch (selectedCategory) {
      case "investmentBanking":
        return item.investmentBanking;
      case "consulting":
        return item.consulting;
      case "legal":
        return item.legal;
      case "medical":
        return item.medical;
      default:
        return item.overall;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <Logo size="xs" />
              <span className="font-semibold text-gray-900 text-sm hidden sm:inline">
                Michibiki
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              <a href="/" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
                ホーム
              </a>
              <a href="/" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
                求人を探す
              </a>
              <a href="/interview" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
                AI面接
              </a>
              <a href="/apex" className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md font-medium">
                APEX
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
              ログイン
            </button>
            <button className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md transition-colors font-medium">
              登録する
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Michibiki Research
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            APEX
          </h1>
          <p className="text-xl text-indigo-600 font-semibold mb-4">AI生産性指数</p>
          <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            APEXは、実際のビジネスタスクにおけるAIモデルの生産性を定量的に測定するベンチマークです。
            投資銀行、コンサルティング、法務、医療など、各業界の専門家が設計したタスクでAIの実力を評価します。
          </p>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">リーダーボード</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "overall", label: "総合" },
                { key: "investmentBanking", label: "投資銀行" },
                { key: "consulting", label: "コンサルティング" },
                { key: "legal", label: "法務" },
                { key: "medical", label: "医療" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                    selectedCategory === cat.key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 w-16">ランク</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">モデル名</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden sm:table-cell">提供元</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">
                      {selectedCategory === "overall"
                        ? "総合スコア"
                        : selectedCategory === "investmentBanking"
                        ? "投資銀行"
                        : selectedCategory === "consulting"
                        ? "コンサルティング"
                        : selectedCategory === "legal"
                        ? "法務"
                        : "医療"}
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 px-5 py-3 w-16 hidden sm:table-cell">変動</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedData().map((item) => (
                    <tr
                      key={item.model}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            item.displayRank === 1
                              ? "bg-amber-100 text-amber-700"
                              : item.displayRank === 2
                              ? "bg-gray-100 text-gray-600"
                              : item.displayRank === 3
                              ? "bg-orange-100 text-orange-700"
                              : "text-gray-400"
                          }`}
                        >
                          {item.displayRank}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-900">{item.model}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-500">{item.provider}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">{getScore(item).toFixed(1)}</span>
                        <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${getScore(item)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center hidden sm:table-cell">
                        {item.change === "up" && (
                          <svg className="w-4 h-4 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                        {item.change === "down" && (
                          <svg className="w-4 h-4 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                        {item.change === "same" && (
                          <span className="text-xs text-gray-400 font-medium">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Category breakdown */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">カテゴリ別評価</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto text-sm">
            各業界の専門タスクにおけるトップパフォーマーと評価内容の詳細です。
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {categories.map((cat) => (
              <div key={cat.title} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{cat.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">トップモデル</p>
                    <p className="text-sm font-semibold text-gray-900">{cat.topModel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">スコア</p>
                    <p className="text-lg font-bold text-indigo-600">{cat.topScore}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APEX-Agents */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
                Coming Soon
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">APEX-Agents</h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                APEX-Agentsは、AIエージェントの実務遂行能力を評価する次世代ベンチマークです。
                単一タスクの処理能力だけでなく、複数ステップのワークフロー、ツール利用、
                他のAIやチームとの協調作業など、エージェントとしての総合力を測定します。
              </p>
              <ul className="space-y-3">
                {[
                  "マルチステップタスクの自律遂行能力",
                  "外部ツール・APIの適切な利用",
                  "エラー処理と自己修正能力",
                  "チーム協調・マルチエージェント連携",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-indigo-600">50+</p>
                    <p className="text-xs text-gray-500 mt-1">評価タスク</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-indigo-600">8</p>
                    <p className="text-xs text-gray-500 mt-1">業界カテゴリ</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-indigo-600">15+</p>
                    <p className="text-xs text-gray-500 mt-1">評価モデル</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-indigo-600">月次</p>
                    <p className="text-xs text-gray-500 mt-1">更新頻度</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">評価方法</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto text-sm">
            APEXスコアは、業界専門家とAI研究者が協力して設計した厳密な評価プロセスに基づいています。
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodologySteps.map((s) => (
              <div key={s.step}>
                <div className="text-4xl font-bold text-indigo-100 mb-2">{s.step}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="xs" />
            <span className="text-sm text-gray-500">Michibiki 導</span>
          </div>
          <p className="text-xs text-gray-400">&copy; 2026 Michibiki. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

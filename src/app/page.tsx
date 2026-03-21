"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

const interviewTypes = [
  {
    title: "ソフトウェアエンジニアリング",
    category: "software_engineering",
    duration: "20分",
    format: ["ビデオ", "コーディング"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    description: "アルゴリズム、システム設計、コーディング実技を含む総合的な技術面接です。",
  },
  {
    title: "データサイエンス",
    category: "data_science",
    duration: "25分",
    format: ["ビデオ", "ケーススタディ"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description: "統計分析、機械学習、データ可視化に関するケーススタディ形式の面接です。",
  },
  {
    title: "プロダクトマネジメント",
    category: "product_management",
    duration: "20分",
    format: ["ビデオ", "ケーススタディ"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    description: "プロダクト戦略、優先順位付け、ユーザー理解力を評価する面接です。",
  },
  {
    title: "デザイン",
    category: "design",
    duration: "15分",
    format: ["ビデオ", "ポートフォリオレビュー"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    description: "UI/UXデザインの思考プロセスとポートフォリオについて議論する面接です。",
  },
  {
    title: "ビジネス・コンサルティング",
    category: "business_consulting",
    duration: "20分",
    format: ["ビデオ", "ケーススタディ"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: "ビジネス分析、問題解決力、コミュニケーション力を評価する面接です。",
  },
  {
    title: "医療・ヘルスケア",
    category: "healthcare",
    duration: "25分",
    format: ["ビデオ", "専門知識テスト"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    description: "医療知識、臨床判断力、ヘルスケア業界の理解を評価する面接です。",
  },
];

const steps = [
  {
    step: "01",
    title: "準備",
    description: "面接タイプを選択し、カメラ・マイクの動作確認を行います。練習モードで何度でもリハーサルできます。",
  },
  {
    step: "02",
    title: "面接実施",
    description: "AIが構造化された質問を行います。ビデオ通話形式で、自然な会話のように進行します。",
  },
  {
    step: "03",
    title: "結果確認",
    description: "面接終了後、AIがスキルを分析。詳細なフィードバックとスコアを確認できます。",
  },
];

const features = [
  {
    title: "再受験可能（最大2回）",
    description: "結果に満足できなければ、同じ案件で最大2回まで再挑戦できます。",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "練習モード無制限",
    description: "本番前に何度でも練習できます。評価には影響しません。",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "AIフィードバック",
    description: "面接後に詳細なフィードバックとスキル評価を受け取れます。",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "日本語完全対応",
    description: "質問・回答・フィードバックすべて日本語で完結します。",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
];

const faqs = [
  {
    q: "AI面接はどのように行われますか？",
    a: "Webブラウザ上でAIとビデオ通話形式で行います。AIが質問を出し、あなたが回答する形式です。自然な会話のように進行し、追加質問もAIが自動で行います。",
  },
  {
    q: "面接の結果はどのように使われますか？",
    a: "面接結果はスキルスコアとしてプロフィールに反映され、企業があなたを見つけやすくなります。スコアが高いほど、より多くの企業からオファーを受ける可能性が高まります。",
  },
  {
    q: "不合格になることはありますか？",
    a: "合格・不合格という概念はありません。あなたのスキルレベルを正確に測定し、そのレベルに合った求人をマッチングします。結果に満足できなければ再受験も可能です。",
  },
  {
    q: "どのような環境で受験すべきですか？",
    a: "安定したインターネット接続、静かな環境、Webカメラとマイクが必要です。Chrome またはEdgeブラウザの最新版を推奨します。",
  },
  {
    q: "練習モードと本番の違いは何ですか？",
    a: "練習モードは何度でも利用でき、結果はプロフィールに反映されません。本番は同じ案件で最大2回まで受験でき、最高スコアがプロフィールに反映されます。",
  },
];

export default function RootPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  const handlePractice = (category?: string) => {
    router.push(`/interview/practice${category ? `?category=${category}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="header" iconOnly showBrandName />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/for-companies" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
                企業向け
              </Link>
              <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
                料金プラン
              </Link>
              <Link href="/cases" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
                導入事例
              </Link>
              <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
                ブログ
              </Link>
              <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
                ヘルプ
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/contact" className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
              お問い合わせ
            </Link>
            <Link href="/login" className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md transition-colors font-medium">
              ログイン
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI搭載の次世代面接
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            AI面接で、あなたの
            <br />
            <span className="text-indigo-600">実力を証明</span>しよう
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
            20分間の構造化されたAI面接で、あなたのスキルを客観的に評価。
            面接結果は世界中の企業に共有され、あなたに最適な求人とマッチングされます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handlePractice()}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-base"
            >
              練習を始める
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-base"
            >
              詳しく見る
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">AI面接の流れ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative group cursor-default">
                <div className="text-5xl font-bold text-indigo-100 mb-3 transition-all duration-500 group-hover:text-indigo-500 group-hover:scale-110 group-hover:drop-shadow-lg origin-left">{s.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-indigo-700">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview types */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">面接タイプを選ぶ</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            あなたの専門分野に合わせた面接を受験できます。それぞれの面接は専門家が設計した質問で構成されています。
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {interviewTypes.map((type) => (
              <div
                key={type.title}
                className="border border-gray-200 rounded-xl p-6 hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="text-indigo-600 mb-4">{type.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{type.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{type.description}</p>
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{type.duration}</span>
                  {type.format.map((f) => (
                    <span key={f} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handlePractice(type.category)}
                  className="w-full text-center text-sm bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  練習する
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">AI面接の特長</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">よくある質問</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">面接を始めましょう</h2>
          <p className="text-indigo-100 mb-8 text-base">
            まずは練習モードで体験してみませんか？登録不要で、すぐに始められます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handlePractice()}
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              練習を始める
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* SEO Content - visually hidden but crawlable */}
      <section className="sr-only" aria-label="導（みちびき）について">
        <h2>導（みちびき）- AI面接練習・AI人材マッチングプラットフォーム</h2>
        <p>
          導（みちびき / Michibiki）は、AIを活用した面接練習と人材マッチングのプラットフォームです。
          ソフトウェアエンジニアリング、データサイエンス、プロダクトマネジメント、デザイン、マーケティングなど
          33分野のAI面接練習を無料で提供しています。
        </p>
        <h3>AI面接練習の特徴</h3>
        <p>
          技術テスト（選択問題5問＋記述問題5問）とAIビデオ面接を組み合わせた実践的な模擬面接です。
          AIがあなたの弱点を分析し、的確なフィードバックを提供します。
          オンライン面接対策、転職面接準備、就職活動の面接練習に最適です。
        </p>
        <h3>企業向けAI採用支援</h3>
        <p>
          AIが候補者のスキルを客観的に評価し、企業の求める人材像と自動マッチングします。
          採用コストの削減、選考時間の短縮、ミスマッチの防止を実現します。
          エンジニア採用、グローバル人材採用、リモートワーク人材の採用に対応しています。
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">求職者向け</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/ai-interview" className="text-xs text-gray-500 hover:text-gray-700">AI面接練習</Link>
                <Link href="/explore" className="text-xs text-gray-500 hover:text-gray-700">求人を探す</Link>
                <Link href="/engineer-jobs" className="text-xs text-gray-500 hover:text-gray-700">エンジニア求人</Link>
                <Link href="/remote-jobs" className="text-xs text-gray-500 hover:text-gray-700">リモート求人</Link>
                <Link href="/career-change" className="text-xs text-gray-500 hover:text-gray-700">転職サポート</Link>
              </nav>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">企業向け</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/for-companies" className="text-xs text-gray-500 hover:text-gray-700">AI採用支援</Link>
                <Link href="/pricing" className="text-xs text-gray-500 hover:text-gray-700">料金プラン</Link>
                <Link href="/cases" className="text-xs text-gray-500 hover:text-gray-700">導入事例</Link>
              </nav>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">サポート</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/help" className="text-xs text-gray-500 hover:text-gray-700">ヘルプ</Link>
                <Link href="/blog" className="text-xs text-gray-500 hover:text-gray-700">ブログ</Link>
                <Link href="/careers" className="text-xs text-gray-500 hover:text-gray-700">採用情報</Link>
                <Link href="/security" className="text-xs text-gray-500 hover:text-gray-700">セキュリティ</Link>
              </nav>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">法的情報</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-700">利用規約</Link>
                <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-700">プライバシーポリシー</Link>
                <Link href="/legal" className="text-xs text-gray-500 hover:text-gray-700">特定商取引法</Link>
              </nav>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Logo size="header" iconOnly showBrandName />
            </div>
            <p className="text-xs text-gray-400">&copy; 2026 Michibiki. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

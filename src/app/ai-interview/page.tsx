import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "AI面接練習 無料 - 33分野対応のAI模擬面接で面接力を鍛える",
  description:
    "導（みちびき）のAI面接練習は完全無料。ソフトウェアエンジニアリング・データサイエンス・マーケティングなど33分野の模擬面接をAIが実施。技術テスト＋ビデオ面接で弱点を分析し、実践的なフィードバックを提供。転職・就活の面接対策に最適。",
  keywords: [
    "AI面接", "AI面接練習", "AI面接 無料", "模擬面接", "面接練習 無料",
    "面接対策", "面接 AI", "オンライン面接練習", "面接シミュレーション",
    "技術面接 対策", "コーディング面接", "Web面接 練習",
    "面接 フィードバック", "面接 練習 アプリ",
  ],
  openGraph: {
    title: "AI面接練習 無料 - 33分野対応 | みちびき 導",
    description: "33分野のAI面接練習が完全無料。AIが弱点を分析しフィードバック。",
  },
  alternates: {
    canonical: "https://michibiki.tech/ai-interview",
  },
};

const features = [
  {
    title: "33分野の専門面接",
    description: "ソフトウェアエンジニアリング、データサイエンス、プロダクトマネジメント、UXデザイン、マーケティングなど、幅広い分野に対応した専門的な面接を受けられます。",
    icon: "🎯",
  },
  {
    title: "技術テスト + ビデオ面接",
    description: "選択問題5問＋記述問題5問の技術テストの後、AIがビデオ面接を実施。テスト結果を踏まえた深掘り質問で実力を正確に評価します。",
    icon: "📝",
  },
  {
    title: "AIによる即時フィードバック",
    description: "面接終了後、AIがあなたの回答を分析し、強み・弱み・改善ポイントを具体的にフィードバック。次の面接に活かせる実践的なアドバイスを提供します。",
    icon: "💡",
  },
  {
    title: "完全無料で何度でも",
    description: "AI面接練習は完全無料。回数制限なく、何度でも練習できます。面接本番前の最終チェックや、日常的なスキルアップにご活用ください。",
    icon: "✨",
  },
];

const steps = [
  { step: "1", title: "アカウント登録", description: "メールアドレスまたはGoogleアカウントで無料登録" },
  { step: "2", title: "分野を選択", description: "33分野から練習したい面接分野を選択" },
  { step: "3", title: "技術テスト", description: "選択問題5問＋記述問題5問のテストを受験" },
  { step: "4", title: "AI面接", description: "AIがビデオ面接を実施し、深掘り質問で実力を評価" },
  { step: "5", title: "フィードバック", description: "AIが強み・弱み・改善ポイントを即時フィードバック" },
];

const fields = [
  "ソフトウェアエンジニアリング", "データサイエンス", "プロダクトマネジメント",
  "UXデザイン", "UIデザイン", "マーケティング", "デジタルマーケティング",
  "セールス", "カスタマーサクセス", "人事・HR", "経理・財務",
  "法務", "経営企画", "コンサルティング", "プロジェクトマネジメント",
  "品質管理・QA", "インフラエンジニア", "セキュリティエンジニア",
  "モバイルアプリ開発", "フロントエンド開発", "バックエンド開発",
  "機械学習・AI", "クラウドアーキテクト", "DevOps",
];

export default function AIInterviewPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="header" iconOnly showBrandName />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">
              ログイン
            </Link>
            <Link href="/signup" className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-medium">
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            AI面接練習で<br className="md:hidden" />面接力を鍛える
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            33分野対応のAI模擬面接が<span className="text-indigo-600 font-semibold">完全無料</span>。
            技術テスト＋ビデオ面接でAIが弱点を分析し、実践的なフィードバックを提供します。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto text-center bg-indigo-600 text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-indigo-700 transition-colors">
              無料でAI面接を始める
            </Link>
            <Link href="/interview" className="w-full sm:w-auto text-center text-indigo-600 border border-indigo-200 px-8 py-3 rounded-xl text-base font-semibold hover:bg-indigo-50 transition-colors">
              面接分野を見る
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            導（みちびき）のAI面接練習の特徴
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            AI面接練習の流れ
          </h2>
          <div className="space-y-6">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-gray-600 text-sm">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fields */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
            対応分野一覧
          </h2>
          <p className="text-center text-gray-500 mb-10">33分野の専門面接に対応</p>
          <div className="flex flex-wrap justify-center gap-3">
            {fields.map((field) => (
              <span key={field} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
                {field}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            今すぐAI面接練習を始めよう
          </h2>
          <p className="text-indigo-100 mb-8">
            無料登録して、AIがあなたの面接力を分析。転職・就活の面接対策に最適です。
          </p>
          <Link href="/signup" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
            無料で登録する
          </Link>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-gray prose-sm">
          <h2 className="text-xl font-bold text-gray-900">AI面接練習とは？</h2>
          <p className="text-gray-600">
            AI面接練習とは、人工知能（AI）を活用して模擬面接を行うサービスです。導（みちびき）では、33分野に対応した専門的なAI面接を無料で提供しています。
            従来の面接練習では、友人や家族に面接官役をお願いする必要がありましたが、AI面接練習なら24時間いつでも、何度でも練習できます。
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8">AI面接練習のメリット</h2>
          <p className="text-gray-600">
            AI面接練習の最大のメリットは、客観的なフィードバックが即座に得られることです。AIがあなたの回答内容、論理構成、専門知識の正確性を分析し、
            具体的な改善ポイントを提示します。また、時間や場所を選ばず練習できるため、忙しい方でも効率的に面接対策ができます。
            転職活動中の方、就職活動中の学生、スキルアップを目指す現役エンジニアなど、幅広い方にご利用いただいています。
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8">こんな方におすすめ</h2>
          <p className="text-gray-600">
            エンジニア転職を考えている方、初めての転職で面接に不安がある方、技術面接（コーディング面接）の対策をしたい方、
            データサイエンティストやプロダクトマネージャーへのキャリアチェンジを目指す方、外資系企業の面接対策をしたい方に特におすすめです。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="header" iconOnly showBrandName />
          <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link href="/explore" className="hover:text-gray-600">求人を探す</Link>
            <Link href="/interview" className="hover:text-gray-600">面接練習</Link>
            <Link href="/pricing" className="hover:text-gray-600">料金</Link>
            <Link href="/cases" className="hover:text-gray-600">導入事例</Link>
            <Link href="/blog" className="hover:text-gray-600">ブログ</Link>
            <Link href="/help" className="hover:text-gray-600">ヘルプ</Link>
            <Link href="/terms" className="hover:text-gray-600">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-600">プライバシー</Link>
          </nav>
          <p className="text-xs text-gray-400">&copy; 2026 Michibiki</p>
        </div>
      </footer>
    </div>
  );
}

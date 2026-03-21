import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "転職・キャリアチェンジ - AIで最適な転職先を発見",
  description:
    "転職・キャリアチェンジをAIがサポート。AI面接練習でスキルを可視化し、あなたに最適な転職先をマッチング。未経験からのエンジニア転職、年収アップ転職、キャリアアップを導（みちびき）が支援します。",
  keywords: [
    "転職", "転職 サイト", "転職 エンジニア", "転職活動", "キャリアチェンジ",
    "キャリアアップ", "年収アップ 転職", "未経験 転職", "第二新卒 転職",
    "IT転職", "Web系 転職", "スタートアップ 転職", "外資系 転職",
    "転職 面接対策", "転職 準備", "転職 スキル",
  ],
  openGraph: {
    title: "転職・キャリアチェンジ | みちびき 導",
    description: "AIで最適な転職先を発見。面接練習からマッチングまでサポート。",
  },
  alternates: {
    canonical: "https://michibiki.tech/career-change",
  },
};

export default function CareerChangePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2"><Logo size="header" iconOnly showBrandName /></Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">ログイン</Link>
            <Link href="/signup" className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-medium">無料で始める</Link>
          </div>
        </div>
      </header>

      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            AIで転職を成功させる
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            AI面接練習でスキルを可視化し、あなたに最適な転職先をAIがマッチング。
            未経験からのキャリアチェンジも、年収アップ転職もサポートします。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-center">
              無料で転職を始める
            </Link>
            <Link href="/ai-interview" className="w-full sm:w-auto text-indigo-600 border border-indigo-200 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors text-center">
              まず面接練習をする
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">導（みちびき）の転職サポート</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "スキルの可視化", d: "AI面接であなたの技術力・コミュニケーション力を客観的に評価。自分の強みと弱みを知ることが転職成功の第一歩です。", i: "📊" },
              { t: "最適なマッチング", d: "スキルレベル・経験・希望条件をAIが分析し、あなたに最適な求人を自動提案。ミスマッチのない転職を実現します。", i: "🎯" },
              { t: "面接力の向上", d: "33分野のAI模擬面接で、本番さながらの面接練習ができます。何度でも無料で練習でき、面接への自信がつきます。", i: "💪" },
            ].map((f) => (
              <div key={f.t} className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-4">{f.i}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.t}</h3>
                <p className="text-sm text-gray-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">こんな転職をサポート</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { t: "未経験→エンジニア", d: "プログラミングを学び始めた方のエンジニア転職をサポート。AI面接で現在のスキルレベルを可視化します。" },
              { t: "年収アップ転職", d: "現在のスキルに見合った年収の求人をAIが提案。年収交渉に役立つスキル評価レポートも提供します。" },
              { t: "異業種→IT業界", d: "営業、事務、製造業などからIT業界へのキャリアチェンジ。ポテンシャル重視の求人とマッチングします。" },
              { t: "フリーランス転向", d: "正社員からフリーランスへの転向を検討中の方に。業務委託案件やリモート案件を多数掲載しています。" },
              { t: "外資系・グローバル企業", d: "英語力を活かせる外資系企業やグローバル企業の求人。英語面接の練習もAIで対応します。" },
              { t: "マネジメント職", d: "テックリード、エンジニアリングマネージャー、CTOなどのマネジメントポジションの求人。" },
            ].map((c) => (
              <div key={c.t} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">{c.t}</h3>
                <p className="text-sm text-gray-600">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">転職の第一歩を踏み出そう</h2>
          <p className="text-indigo-100 mb-8">無料登録してAI面接を受けるだけ。あとはAIが最適な求人を見つけます。</p>
          <Link href="/signup" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">無料で登録する</Link>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray prose-sm">
          <h2 className="text-xl font-bold text-gray-900">転職活動をAIがサポートする時代</h2>
          <p className="text-gray-600">
            導（みちびき）は、転職活動のすべてのステップをAIでサポートするプラットフォームです。
            自己分析、面接対策、求人探し、マッチングまで、一貫したサポートを提供します。
            従来の転職サイトとは異なり、AIがあなたのスキルを客観的に評価した上で求人をマッチングするため、
            経歴だけでは見えない実力を企業にアピールできます。
            新卒・第二新卒の就職活動、中途採用、ハイクラス転職、フリーランス転向など、あらゆるキャリアステージの方にご利用いただけます。
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="header" iconOnly showBrandName />
          <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link href="/explore" className="hover:text-gray-600">求人を探す</Link>
            <Link href="/engineer-jobs" className="hover:text-gray-600">エンジニア求人</Link>
            <Link href="/remote-jobs" className="hover:text-gray-600">リモート求人</Link>
            <Link href="/ai-interview" className="hover:text-gray-600">AI面接練習</Link>
            <Link href="/for-companies" className="hover:text-gray-600">企業向け</Link>
            <Link href="/terms" className="hover:text-gray-600">利用規約</Link>
          </nav>
          <p className="text-xs text-gray-400">&copy; 2026 Michibiki</p>
        </div>
      </footer>
    </div>
  );
}

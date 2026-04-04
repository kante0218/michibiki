import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "高専生・大学院生の採用に特化 - AI面接で理系人材を発掘",
  description:
    "導（みちびき）の企業向けAI採用支援。高専生・大学院生の新卒採用・インターンシップ・共同研究に特化。33分野のAI面接で学生のスキルを客観的に評価し、優秀な理系人材をマッチング。",
  keywords: [
    "高専生採用", "大学院生採用", "理系人材", "新卒採用", "インターンシップ",
    "共同研究", "AI採用", "AI人材マッチング", "採用支援", "採用コスト削減",
    "スキル評価", "採用効率化", "ミスマッチ防止", "技術人材採用",
  ],
  openGraph: {
    title: "高専生・大学院生の採用に特化 | みちびき 導",
    description: "AI面接で理系学生のスキルを客観評価。新卒・インターン・共同研究に対応。",
  },
  alternates: {
    canonical: "https://michibiki.tech/for-companies",
  },
};

const employmentTypes = [
  {
    title: "新卒採用",
    subtitle: "New Graduate",
    description: "高専・大学院の卒業生を対象に、AI面接でスキルとポテンシャルを客観評価。即戦力となる理系人材を採用できます。",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
  },
  {
    title: "インターンシップ",
    subtitle: "Internship",
    description: "高専生・大学院生の長期・短期インターンを募集。将来の採用候補を早期に発掘し、実務スキルを評価します。",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
  },
  {
    title: "共同研究",
    subtitle: "Joint Research",
    description: "大学院生の専門知識を活用した産学連携。研究テーマに合った学生をAIがマッチングし、共同研究をスムーズに開始。",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
];

const aiStrengths = [
  {
    title: "理系人材へのダイレクトアクセス",
    description: "高専5年間・大学院での専門教育を受けた理系学生に直接アプローチ。機械、電気、情報、化学など33分野の専門スキルをAIが正確に評価。",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
      </svg>
    ),
  },
  {
    title: "AI面接による客観評価",
    description: "学生が都合の良い時間にいつでもAI面接を受験可能。学歴バイアスを排除し、実力とポテンシャルで学生を客観的に評価します。",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "採用コスト大幅削減",
    description: "合同説明会・人材紹介の高額コストを削減。AIが一次選考を代行し、採用担当者は最終面接に集中できます。",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "詳細なスキルレポート",
    description: "面接動画・スコア・フィードバックを含む詳細レポートを自動生成。学生の専門スキルと研究実績を可視化し、採用判断を支援します。",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
];

const integrations = [
  { title: "ATS連携", description: "SmartHR、HRMOSなど主要ATSとシームレスに連携" },
  { title: "カスタムAPI", description: "RESTful APIで自社システムと自由に統合" },
  { title: "SSO / SAML", description: "既存の認証基盤でシングルサインオンを実現" },
  { title: "Slack / Teams通知", description: "候補者の進捗をリアルタイムでチームに通知" },
  { title: "CSV / Excelエクスポート", description: "採用データをワンクリックでエクスポート" },
  { title: "Webhook対応", description: "イベントトリガーで外部システムと自動連携" },
];

const securityBadges = [
  { title: "SOC2 Type II", description: "国際的なセキュリティ基準に準拠した運用体制" },
  { title: "AES-256暗号化", description: "通信・保存データすべてを最高レベルで暗号化" },
  { title: "個人情報保護法準拠", description: "日本の個人情報保護法に完全準拠した設計" },
  { title: "SLA 99.9%保証", description: "エンタープライズ向け高可用性を保証" },
];

export default function ForCompaniesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-600 font-semibold text-sm mb-4">高専生・大学院生の採用に特化</p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            優秀な理系学生を
            <br className="hidden md:block" />
            AIで発掘・評価する
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            高専生・大学院生の新卒採用・インターンシップ・共同研究に対応。
            33分野の専門AI面接で、学生の技術スキルとポテンシャルを客観的に評価します。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              無料で始める
            </Link>
            <Link href="/contact" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* Employment Types */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">採用形態に合わせた柔軟な対応</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">新卒採用・インターンシップ・共同研究の3つの形態で、高専生・大学院生とのマッチングをサポートします。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employmentTypes.map((type) => (
              <div key={type.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  {type.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-0.5">{type.title}</h3>
                <p className="text-xs text-indigo-500 font-medium mb-2">{type.subtitle}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Strengths */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">導を選ぶ3つの理由</h2>
            <p className="text-gray-600">高専生・大学院生の採用に特化した、AI面接プラットフォームならではの強みをご紹介します。</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {aiStrengths.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{s.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">導入から運用まで4ステップ</h2>
          <div className="space-y-6">
            {[
              { n: "1", t: "募集要項を登録", d: "求めるスキル・研究分野・採用形態（新卒・インターン・共同研究）を入力。AIが最適な学生を自動で探します。" },
              { n: "2", t: "AIが学生を評価", d: "専門分野のAI面接で技術スキルとポテンシャルを多角的に評価。バイアスのない客観的な評価を提供します。" },
              { n: "3", t: "マッチング結果を確認", d: "スキルスコア・面接動画・評価レポートを確認。気になる学生にすぐコンタクトできます。" },
              { n: "4", t: "採用・受入管理", d: "オファー送信から内定承諾まで一気通貫で管理。インターンや共同研究の受入もサポートします。" },
            ].map((s) => (
              <div key={s.n} className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">{s.n}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.t}</h3>
                  <p className="text-gray-600 text-sm">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">既存システムとの連携</h2>
            <p className="text-gray-600">お使いの人事システムやツールとシームレスに統合できます。</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {integrations.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">エンタープライズ品質のセキュリティ</h2>
            <p className="text-gray-600">大切な採用データを最高水準のセキュリティで保護します。</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {securityBadges.map((badge) => (
              <div key={badge.title} className="text-center bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{badge.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{badge.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/security" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              セキュリティの詳細を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">高専生・大学院生の採用を始めませんか？</h2>
          <p className="text-indigo-100 mb-8">まずは無料でお試しください。理系学生の採用に特化した専門スタッフが導入をサポートします。</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
              無料で始める
            </Link>
            <Link href="/contact" className="text-white border border-white/30 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              お問い合わせ
            </Link>
            <Link href="/roi-calculator" className="text-white border border-white/30 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              コスト削減を試算
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Text */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray prose-sm">
          <h2 className="text-xl font-bold text-gray-900">高専生・大学院生向けAI採用支援とは</h2>
          <p className="text-gray-600">
            導（みちびき）は、高専生・大学院生の採用に特化したAI面接プラットフォームです。AIが学生の技術スキル、
            研究能力、問題解決力を客観的に評価し、企業の求める人材像と自動マッチングします。
            機械工学、電気電子、情報工学、化学、材料科学など、理系専門分野の採用に特に効果を発揮します。
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8">対応する採用形態</h2>
          <p className="text-gray-600">
            新卒採用、インターンシップ、共同研究の3つの形態に対応しています。製造業、IT企業、スタートアップ、研究機関、
            コンサルティングファームなど、理系人材を求める企業に幅広くご利用いただけます。
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

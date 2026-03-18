"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ExploreHeader";
import Link from "next/link";

const plans = [
  {
    name: "フリー",
    price: "¥0",
    period: "永年無料",
    description: "まずは気軽に始めたい方に",
    features: [
      { label: "AI面接（月1回）", included: true },
      { label: "APEXスコア表示", included: true },
      { label: "求人検索・応募（月5件まで）", included: true },
      { label: "基本プロフィール", included: true },
      { label: "優先マッチング", included: false },
      { label: "スキルレポート詳細", included: false },
      { label: "専任サポート", included: false },
      { label: "カスタムAPI連携", included: false },
    ],
    cta: "無料で始める",
    highlighted: false,
  },
  {
    name: "プロ",
    price: "¥4,980",
    period: "月額（税込）",
    description: "本格的にキャリアアップしたい方に",
    features: [
      { label: "AI面接（無制限）", included: true },
      { label: "APEXスコア表示", included: true },
      { label: "求人検索・応募（無制限）", included: true },
      { label: "拡張プロフィール", included: true },
      { label: "優先マッチング", included: true },
      { label: "スキルレポート詳細", included: true },
      { label: "チャットサポート", included: true },
      { label: "カスタムAPI連携", included: false },
    ],
    cta: "プロプランを始める",
    highlighted: true,
  },
  {
    name: "エンタープライズ",
    price: "要相談",
    period: "カスタム見積もり",
    description: "企業向けの包括的なソリューション",
    features: [
      { label: "AI面接（無制限）", included: true },
      { label: "APEXスコア表示", included: true },
      { label: "求人掲載・候補者検索（無制限）", included: true },
      { label: "企業ブランディングページ", included: true },
      { label: "優先マッチング", included: true },
      { label: "採用分析ダッシュボード", included: true },
      { label: "専任サクセスマネージャー", included: true },
      { label: "カスタムAPI連携", included: true },
    ],
    cta: "お問い合わせ",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "無料プランから有料プランへの切り替えはいつでもできますか？",
    a: "はい、いつでもアカウント設定からプランを変更できます。アップグレードは即座に反映され、日割り計算で課金されます。",
  },
  {
    q: "支払い方法は何に対応していますか？",
    a: "クレジットカード（Visa、Mastercard、JCB、American Express）、銀行振込に対応しています。エンタープライズプランでは請求書払いも可能です。",
  },
  {
    q: "解約したい場合はどうすればよいですか？",
    a: "アカウント設定からいつでも解約可能です。解約後は、現在の請求期間が終了するまでプロプランの機能をご利用いただけます。自動更新はされません。",
  },
  {
    q: "企業として複数名で利用する場合の料金は？",
    a: "エンタープライズプランでは、利用人数に応じたカスタム料金をご案内しています。まずはお問い合わせください。チーム規模に応じたボリュームディスカウントもございます。",
  },
  {
    q: "無料トライアルはありますか？",
    a: "プロプランは14日間の無料トライアルをご用意しています。トライアル期間中は全機能をお試しいただけます。クレジットカードの登録は不要です。",
  },
  {
    q: "年間契約の割引はありますか？",
    a: "はい、プロプランの年間契約では20%の割引が適用され、月あたり¥3,980でご利用いただけます。",
  },
];

const comparisonFeatures = [
  { name: "AI面接", free: "月1回", pro: "無制限", enterprise: "無制限" },
  { name: "求人応募数", free: "月5件", pro: "無制限", enterprise: "無制限" },
  { name: "APEXスコア", free: "基本", pro: "詳細レポート付き", enterprise: "詳細レポート付き" },
  { name: "マッチング", free: "標準", pro: "優先", enterprise: "優先＋専任" },
  { name: "サポート", free: "FAQ", pro: "チャット", enterprise: "専任マネージャー" },
  { name: "API連携", free: "---", pro: "---", enterprise: "カスタム対応" },
  { name: "採用分析", free: "---", pro: "基本", enterprise: "高度な分析" },
  { name: "SLA", free: "---", pro: "---", enterprise: "99.9%保証" },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Sidebar />
      <main className="ml-[96px] min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">ホーム</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">料金プラン</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">料金プラン</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              あなたのニーズに合ったプランをお選びください。すべてのプランに基本的なAI機能が含まれています。
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? "bg-white border-indigo-600 ring-2 ring-indigo-600 relative"
                    : "bg-white border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    人気プラン
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500 ml-2">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <svg className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">機能比較</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-800 w-1/4">機能</th>
                      <th className="text-center p-4 font-semibold text-gray-800">フリー</th>
                      <th className="text-center p-4 font-semibold text-indigo-600">プロ</th>
                      <th className="text-center p-4 font-semibold text-gray-800">エンタープライズ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((f, i) => (
                      <tr key={f.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-4 font-medium text-gray-700">{f.name}</td>
                        <td className="p-4 text-center text-gray-600">{f.free}</td>
                        <td className="p-4 text-center text-gray-600">{f.pro}</td>
                        <td className="p-4 text-center text-gray-600">{f.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">よくある質問</h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

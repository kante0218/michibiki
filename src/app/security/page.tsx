import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

const commitments = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: "データ非売却",
    description: "プロフィールや面接データは第三者に販売しません。お客様のデータはマッチング目的のみに使用されます。",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: "AIモデル訓練非使用",
    description: "面接データを自社AIモデルの訓練に使用しません。AIの改善にはお客様データ以外のデータセットを使用しています。",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "暗号化",
    description: "転送中・保存中のデータはすべてAES-256で暗号化。TLS 1.3による安全な通信を確保しています。",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: "SOC2 Type II",
    description: "第三者監査機関による厳格な審査をクリアし、SOC2 Type II認証を取得しています。",
  },
];

const complianceItems = [
  {
    title: "個人情報保護法",
    description: "日本の個人情報保護法に完全準拠。個人データの取得・利用・第三者提供について適切な管理体制を構築しています。利用目的の明示、安全管理措置、開示請求への対応を徹底しています。",
  },
  {
    title: "下請法",
    description: "下請代金支払遅延等防止法を遵守し、適正な取引を実施しています。報酬の60日以内の支払い、不当な減額の禁止など、フリーランスの方の権利を保護します。",
  },
  {
    title: "インボイス制度",
    description: "2023年10月から施行された適格請求書等保存方式（インボイス制度）に対応。適格請求書発行事業者として登録し、法令に準拠した請求書を自動発行しています。",
  },
];

const dataHandlingItems = [
  {
    title: "データ収集",
    description: "必要最小限のデータのみを収集し、利用目的を明確に告知します。",
  },
  {
    title: "データ保存",
    description: "データは暗号化された状態で、SOC2認定のクラウドインフラに保存されます。",
  },
  {
    title: "データアクセス",
    description: "厳格なアクセス制御により、権限を持つ担当者のみがデータにアクセスできます。",
  },
  {
    title: "データ削除",
    description: "アカウント削除時、30日の猶予期間後にすべてのデータを完全に削除します。",
  },
  {
    title: "データポータビリティ",
    description: "お客様はいつでも自身のデータをエクスポートし、持ち出すことができます。",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            セキュリティとプライバシー
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Michibikiは、お客様のデータを最高水準のセキュリティで保護することをお約束します。
            透明性のあるデータ管理と厳格なセキュリティ基準を維持しています。
          </p>
        </div>
      </section>

      {/* Key commitments */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            私たちのコミットメント
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commitments.map((item, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            法令遵守
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            日本の法規制に完全準拠し、適切な事業運営を行っています。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {complianceItems.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data handling */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            データの取り扱い
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            お客様のデータがどのように管理されているかを透明にお伝えします。
          </p>
          <div className="space-y-4">
            {dataHandlingItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 rounded-xl border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-semibold">{idx + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            セキュリティに関するお問い合わせ
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            セキュリティに関するご質問、脆弱性の報告、またはデータに関するご要望がございましたら、お気軽にご連絡ください。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:security@michibiki.tech"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              security@michibiki.tech
            </a>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
            >
              ヘルプセンター
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

"use client";

import { Sidebar } from "@/components/ExploreHeader";
import Link from "next/link";

const sections = [
  { id: "operator", title: "1. 個人情報取扱事業者" },
  { id: "collection", title: "2. 個人情報の収集" },
  { id: "purpose", title: "3. 利用目的" },
  { id: "third-party", title: "4. 第三者提供" },
  { id: "safety", title: "5. 安全管理措置" },
  { id: "protection", title: "6. データ保護" },
  { id: "cookies", title: "7. Cookieの使用" },
  { id: "rights", title: "8. ユーザーの権利" },
  { id: "disclosure", title: "9. 開示等の請求手続き" },
  { id: "deletion", title: "10. アカウント削除・データ消去" },
  { id: "contact", title: "11. お問い合わせ・苦情窓口" },
];

export default function PrivacyPage() {
  return (
    <>
      <Sidebar />
      <main className="ml-[96px] min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">ホーム</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">プライバシーポリシー</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">プライバシーポリシー</h1>
            <p className="text-sm text-gray-500">最終更新日：2026年3月1日</p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Michibiki 導 株式会社（以下「当社」）は、個人情報の保護に関する法律（個人情報保護法）およびEU一般データ保護規則（GDPR）を遵守し、ユーザーの個人情報を適切に取り扱います。本プライバシーポリシーは、当社が運営するAI人材マッチングプラットフォーム「Michibiki」における個人情報の取り扱いについて説明するものです。
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">目次</h2>
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm transition-colors">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            <section id="operator" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. 個人情報取扱事業者</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <div className="bg-gray-50 rounded-lg p-6">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      <tr><td className="py-2 font-medium text-gray-800 w-40">事業者名</td><td className="py-2">Michibiki 導 株式会社</td></tr>
                      <tr><td className="py-2 font-medium text-gray-800">代表者</td><td className="py-2">（代表取締役名を記載）</td></tr>
                      <tr><td className="py-2 font-medium text-gray-800">所在地</td><td className="py-2">〒150-0002 東京都渋谷区渋谷2-24-12</td></tr>
                      <tr><td className="py-2 font-medium text-gray-800">個人情報保護管理者</td><td className="py-2">（管理者名・連絡先を記載）</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="collection" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. 個人情報の収集</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>当社は、本サービスの提供にあたり、以下の個人情報を収集する場合があります。</p>
                <h3 className="font-semibold text-gray-800 mt-4">1.1 ユーザーから直接提供される情報</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>氏名、メールアドレス、電話番号</li>
                  <li>生年月日、住所</li>
                  <li>職歴、学歴、スキル情報</li>
                  <li>履歴書、職務経歴書</li>
                  <li>プロフィール写真</li>
                  <li>銀行口座情報（報酬支払いのため）</li>
                </ul>
                <h3 className="font-semibold text-gray-800 mt-4">1.2 自動的に収集される情報</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>IPアドレス、ブラウザの種類、OS情報</li>
                  <li>アクセスログ、利用履歴</li>
                  <li>AI面接時の映像・音声データ</li>
                  <li>Cookie情報</li>
                </ul>
                <h3 className="font-semibold text-gray-800 mt-4">1.3 第三者から取得する情報</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>ソーシャルログイン（Google、GitHub等）を通じた基本プロフィール情報</li>
                  <li>外部スキル認定サービスとの連携データ</li>
                </ul>
              </div>
            </section>

            <section id="purpose" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. 利用目的</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>当社は、収集した個人情報を以下の目的で利用します。</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>本サービスの提供、運営、改善</li>
                  <li>ユーザーアカウントの管理・認証</li>
                  <li>AIによるスキル評価（APEXスコア）の算出</li>
                  <li>求職者と企業のマッチング</li>
                  <li>報酬の計算・支払い処理</li>
                  <li>カスタマーサポートの提供</li>
                  <li>サービスに関する通知・お知らせの送信</li>
                  <li>利用状況の統計分析（匿名化処理後）</li>
                  <li>不正利用の防止・検出</li>
                  <li>法令に基づく対応</li>
                </ul>
              </div>
            </section>

            <section id="third-party" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. 第三者提供</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>当社は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>ユーザーが求人に応募した場合の、応募先企業への必要情報の提供</li>
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体または財産の保護のために必要がある場合</li>
                  <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                </ul>
                <h3 className="font-semibold text-gray-800 mt-4">3.1 業務委託先への提供</h3>
                <p>当社は、業務の一部を外部に委託する場合があります。この場合、委託先と適切な契約を締結し、個人情報の安全管理を徹底します。</p>
                <h3 className="font-semibold text-gray-800 mt-4">3.2 海外への移転</h3>
                <p>本サービスの運営上、個人情報を日本国外（米国等）のサーバーで処理する場合があります。この場合、GDPR第46条に基づく適切な保護措置を講じます。</p>
              </div>
            </section>

            <section id="safety" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. 安全管理措置</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>当社は、個人情報保護法第23条に基づき、以下の安全管理措置を講じています。</p>
                <h3 className="font-semibold text-gray-800 mt-4">5.1 組織的安全管理措置</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>個人情報保護管理者の設置</li>
                  <li>個人情報の取り扱いに関する規程の整備・運用</li>
                  <li>個人情報の取り扱い状況の定期的な点検</li>
                </ul>
                <h3 className="font-semibold text-gray-800 mt-4">5.2 技術的安全管理措置</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>アクセス制御（ロールベースアクセス制御、Row Level Security）</li>
                  <li>通信経路の暗号化（TLS 1.2以上）</li>
                  <li>保存データの暗号化（AES-256）</li>
                  <li>外部からの不正アクセス防止（WAF、CSP、セキュリティヘッダー）</li>
                  <li>脆弱性管理（定期的な依存パッケージの更新）</li>
                </ul>
                <h3 className="font-semibold text-gray-800 mt-4">5.3 物理的安全管理措置</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>クラウドサービス（Supabase、Vercel）のデータセンターセキュリティに準拠</li>
                  <li>サーバーへの物理的アクセスはクラウドプロバイダーにより管理</li>
                </ul>
              </div>
            </section>

            <section id="protection" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. データ保護</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>当社は、個人情報の安全管理のため、以下の措置を講じています。</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>SSL/TLSによる通信の暗号化</li>
                  <li>データベースの暗号化（AES-256）</li>
                  <li>アクセス権限の厳格な管理</li>
                  <li>定期的なセキュリティ監査の実施</li>
                  <li>従業員への個人情報保護教育の実施</li>
                  <li>不正アクセス検知システムの導入</li>
                </ul>
                <h3 className="font-semibold text-gray-800 mt-4">4.1 データ保持期間</h3>
                <p>個人情報は、利用目的の達成に必要な期間、または法令で定められた期間保持します。アカウント削除後、30日の猶予期間を経て完全に削除されます。</p>
              </div>
            </section>

            <section id="cookies" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Cookieの使用</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>当社は、以下の目的でCookieおよび類似技術を使用しています。</p>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 border border-gray-200 font-semibold text-gray-800">種類</th>
                        <th className="text-left p-3 border border-gray-200 font-semibold text-gray-800">目的</th>
                        <th className="text-left p-3 border border-gray-200 font-semibold text-gray-800">必須</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border border-gray-200">必須Cookie</td>
                        <td className="p-3 border border-gray-200">ログイン状態の維持、セキュリティ</td>
                        <td className="p-3 border border-gray-200">はい</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-gray-200">分析Cookie</td>
                        <td className="p-3 border border-gray-200">サービス利用状況の分析・改善</td>
                        <td className="p-3 border border-gray-200">いいえ</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-gray-200">機能Cookie</td>
                        <td className="p-3 border border-gray-200">ユーザー設定の保存</td>
                        <td className="p-3 border border-gray-200">いいえ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">ブラウザの設定により、Cookieの受け入れを拒否することが可能です。ただし、必須Cookieを無効にした場合、本サービスの一部機能が利用できなくなる場合があります。</p>
              </div>
            </section>

            <section id="rights" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. ユーザーの権利</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>ユーザーは、個人情報保護法およびGDPRに基づき、以下の権利を有します。</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><span className="font-medium text-gray-800">アクセス権：</span>当社が保有するご自身の個人情報の開示を請求する権利</li>
                  <li><span className="font-medium text-gray-800">訂正権：</span>不正確な個人情報の訂正を請求する権利</li>
                  <li><span className="font-medium text-gray-800">削除権（忘れられる権利）：</span>個人情報の削除を請求する権利</li>
                  <li><span className="font-medium text-gray-800">処理制限権：</span>個人情報の処理を制限する権利</li>
                  <li><span className="font-medium text-gray-800">データポータビリティ権：</span>個人情報を構造化された形式で受け取る権利</li>
                  <li><span className="font-medium text-gray-800">異議申立権：</span>個人情報の処理に異議を申し立てる権利</li>
                  <li><span className="font-medium text-gray-800">同意撤回権：</span>いつでも同意を撤回する権利</li>
                </ul>
                <p className="mt-4">上記の権利を行使される場合は、下記のお問い合わせ窓口までご連絡ください。ご本人確認の上、原則として30日以内に対応いたします。</p>
              </div>
            </section>

            <section id="disclosure" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. 開示等の請求手続き</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>個人情報保護法第33条〜第39条に基づき、以下の請求を受け付けます。</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><span className="font-medium text-gray-800">利用目的の通知：</span>当社が保有するご自身の個人情報の利用目的の通知</li>
                  <li><span className="font-medium text-gray-800">開示：</span>当社が保有するご自身の個人情報の開示</li>
                  <li><span className="font-medium text-gray-800">訂正・追加・削除：</span>個人情報の内容が事実でない場合の訂正等</li>
                  <li><span className="font-medium text-gray-800">利用停止・消去：</span>個人情報の利用停止または消去</li>
                  <li><span className="font-medium text-gray-800">第三者提供の停止：</span>個人情報の第三者への提供の停止</li>
                </ul>
                <h3 className="font-semibold text-gray-800 mt-4">請求方法</h3>
                <p>下記のお問い合わせ窓口にメールまたは書面にてご連絡ください。ご本人確認のため、本人確認書類（運転免許証、マイナンバーカード等のコピー）のご提出をお願いする場合があります。</p>
                <p className="mt-2"><span className="font-medium text-gray-800">回答期限：</span>請求受理後、原則として2週間以内に回答いたします。</p>
                <p><span className="font-medium text-gray-800">手数料：</span>開示請求1件につき1,000円（税込）。郵便為替または銀行振込にてお支払いください。</p>
              </div>
            </section>

            <section id="deletion" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. アカウント削除・データ消去</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>ユーザーはいつでもアカウントの削除を請求することができます。</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>プロフィール設定画面から削除を申請、または下記窓口にご連絡ください</li>
                  <li>削除申請後、30日間の猶予期間を設けます（期間中は復元可能）</li>
                  <li>猶予期間経過後、以下のデータを完全に削除します：
                    <ul className="list-disc ml-6 mt-1 space-y-1">
                      <li>プロフィール情報（氏名、メール、電話番号等）</li>
                      <li>アップロードされた履歴書・職務経歴書</li>
                      <li>応募履歴・スキル評価データ</li>
                      <li>チャット履歴</li>
                    </ul>
                  </li>
                  <li>法令上の保存義務がある情報（取引記録等）は、法定期間終了後に削除します</li>
                </ul>
              </div>
            </section>

            <section id="contact" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">11. お問い合わせ・苦情窓口</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>個人情報の取り扱いに関するお問い合わせ、苦情、ご相談は以下の窓口までお願いいたします。</p>
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <p className="font-medium text-gray-900">Michibiki 導 株式会社 個人情報保護管理者</p>
                  <p className="mt-2">〒150-0002 東京都渋谷区渋谷2-24-12</p>
                  <p>メール：privacy@michibiki.tech</p>
                  <p>電話：03-6890-XXXX（平日 10:00〜18:00）</p>
                </div>
                <p className="mt-4 text-sm">
                  当社の個人情報の取り扱いについてご不満がある場合、個人情報保護委員会（https://www.ppc.go.jp/）に苦情を申し立てることができます。EU居住者の方は、お住まいの国のデータ保護機関に苦情を申し立てることも可能です。
                </p>
              </div>
            </section>
          </div>

          {/* Footer note */}
          <div className="mt-10 text-center text-sm text-gray-400">
            <p>制定日：2025年4月1日 ／ 最終改定日：2026年3月1日</p>
          </div>
        </div>
      </main>
    </>
  );
}

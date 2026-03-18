"use client";

import { Sidebar } from "@/components/ExploreHeader";
import Link from "next/link";

const rows = [
  { label: "事業者名", value: "Michibiki 導 株式会社" },
  { label: "代表者", value: "（代表取締役名を記載）" },
  { label: "所在地", value: "〒150-0002 東京都渋谷区渋谷2-24-12" },
  { label: "電話番号", value: "03-6890-XXXX（平日 10:00〜18:00）" },
  { label: "メールアドレス", value: "support@michibiki.jp" },
  { label: "URL", value: "https://michibiki.jp" },
  { label: "サービス内容", value: "AI人材マッチングプラットフォームの運営、求職者と企業のマッチング支援、紹介報酬の仲介" },
  { label: "サービス料金", value: "求職者：無料\n企業：採用成功時に成功報酬が発生（詳細は個別契約による）\n紹介報酬：紹介した方が採用された場合、紹介者に報酬を支払い" },
  { label: "料金以外の必要経費", value: "インターネット接続に必要な通信費等はユーザー負担" },
  { label: "支払方法", value: "銀行振込" },
  { label: "支払時期", value: "企業向け：請求書発行日から30日以内\n紹介報酬：採用確定後、翌月末日までに支払い" },
  { label: "サービス提供時期", value: "アカウント登録完了後、直ちにご利用いただけます" },
  { label: "返品・キャンセル", value: "デジタルサービスの性質上、サービス提供開始後の返金は原則として行いません。ただし、当社の責に帰すべき事由による場合はこの限りではありません。" },
  { label: "契約解除", value: "ユーザーはいつでもアカウントを削除し、サービスの利用を終了できます。既に成立した契約上の義務は解除されません。" },
  { label: "動作環境", value: "最新版のGoogle Chrome、Safari、Firefox、Microsoft Edgeを推奨。JavaScript有効が必要。" },
  { label: "個人情報の取り扱い", value: "プライバシーポリシーに基づき適切に管理します" },
];

export default function LegalPage() {
  return (
    <>
      <Sidebar />
      <main className="ml-0 md:ml-[96px] min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">ホーム</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">特定商取引法に基づく表記</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">特定商取引法に基づく表記</h1>
            <p className="text-sm text-gray-500">最終更新日：2026年3月18日</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.label} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 text-sm font-semibold text-gray-800 bg-gray-50/70 w-48 align-top whitespace-nowrap border-r border-gray-100">
                      {row.label}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {row.label === "個人情報の取り扱い" ? (
                        <>
                          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800 transition-colors underline">
                            プライバシーポリシー
                          </Link>
                          に基づき適切に管理します
                        </>
                      ) : (
                        row.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">ご注意</h3>
            <ul className="text-sm text-amber-700 space-y-1 list-disc ml-4">
              <li>表示価格は全て税込です（特に記載がない場合）。</li>
              <li>サービス内容・料金は予告なく変更される場合があります。</li>
              <li>ご不明な点がございましたら、上記メールアドレスまでお問い合わせください。</li>
            </ul>
          </div>

          {/* Related links */}
          <div className="mt-8 flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors underline"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors underline"
            >
              プライバシーポリシー
            </Link>
          </div>

          {/* Footer note */}
          <div className="mt-10 text-center text-sm text-gray-400">
            <p>制定日：2026年3月18日</p>
          </div>
        </div>
      </main>
    </>
  );
}

"use client";

import { Sidebar } from "@/components/ExploreHeader";
import Link from "next/link";

const sections = [
  { id: "overview", title: "第1条 サービス概要" },
  { id: "conditions", title: "第2条 利用条件" },
  { id: "prohibited", title: "第3条 禁止事項" },
  { id: "ip", title: "第4条 知的財産権" },
  { id: "disclaimer", title: "第5条 免責事項" },
  { id: "termination", title: "第6条 契約解除" },
  { id: "law", title: "第7条 準拠法" },
  { id: "contact", title: "第8条 お問い合わせ" },
];

export default function TermsPage() {
  return (
    <>
      <Sidebar />
      <main className="ml-[96px] min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">ホーム</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">利用規約</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">利用規約</h1>
            <p className="text-sm text-gray-500">最終更新日：2026年3月1日</p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              本利用規約（以下「本規約」）は、Michibiki 導 株式会社（以下「当社」）が提供するAI人材マッチングプラットフォーム「Michibiki」（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただく前に、本規約をよくお読みください。
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
            {/* Section 1 */}
            <section id="overview" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第1条 サービス概要</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>1. 本サービスは、AI技術を活用した人材マッチングプラットフォームであり、求職者（以下「ユーザー」）と企業をつなぐサービスです。</p>
                <p>2. 本サービスには、AIによるスキル評価（APEXスコア）、AI面接、求人マッチング、契約管理、報酬支払い機能が含まれます。</p>
                <p>3. 当社は、本サービスの内容を予告なく変更、追加、または廃止する場合があります。重要な変更の場合は、事前に通知いたします。</p>
                <p>4. 本サービスは、日本国内外の個人および法人を対象としております。</p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="conditions" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第2条 利用条件</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>1. 本サービスの利用にあたり、ユーザーは以下の条件を満たす必要があります。</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>満18歳以上であること</li>
                  <li>正確かつ最新の個人情報を登録すること</li>
                  <li>本規約に同意すること</li>
                  <li>反社会的勢力に該当しないこと</li>
                </ul>
                <p>2. ユーザーは、自身のアカウント情報の管理について一切の責任を負うものとします。</p>
                <p>3. 一人のユーザーが複数のアカウントを作成することは禁止されています。</p>
                <p>4. 当社は、利用条件を満たさないユーザーの登録を拒否する権利を有します。</p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="prohibited" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第3条 禁止事項</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>虚偽の情報を登録または提供する行為</li>
                  <li>他のユーザーまたは第三者の権利を侵害する行為</li>
                  <li>本サービスのシステムに不正にアクセスする行為</li>
                  <li>AI面接において不正な手段を用いる行為（代理受験、外部ツールの不正使用等）</li>
                  <li>本サービスを通じて取得した情報を無断で第三者に提供する行為</li>
                  <li>本サービスの運営を妨害する行為</li>
                  <li>法令または公序良俗に反する行為</li>
                  <li>本サービスのリバースエンジニアリング、逆コンパイル、または逆アセンブル</li>
                  <li>当社の事前の書面による同意なくして本サービスを商業目的で利用する行為</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="ip" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第4条 知的財産権</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>1. 本サービスに関する一切の知的財産権は、当社または正当な権利者に帰属します。</p>
                <p>2. ユーザーが本サービスに投稿またはアップロードしたコンテンツの知的財産権は、ユーザーに帰属します。ただし、ユーザーは当社に対して、本サービスの提供・改善に必要な範囲で、当該コンテンツを使用する非独占的な権利を許諾するものとします。</p>
                <p>3. APEXスコアの算出アルゴリズム、AI面接システム、マッチングエンジン等の技術的仕組みは、当社の営業秘密に該当します。</p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="disclaimer" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第5条 免責事項</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>1. 当社は、本サービスを通じて提供される情報の正確性、完全性、有用性等について、いかなる保証も行いません。</p>
                <p>2. 当社は、本サービスの利用に起因してユーザーに生じた損害について、当社の故意または重大な過失による場合を除き、一切の責任を負いません。</p>
                <p>3. 当社は、本サービスの中断、停止、変更、終了等によりユーザーに生じた損害について、責任を負わないものとします。</p>
                <p>4. ユーザー間またはユーザーと企業間のトラブルについて、当社は仲介の努力は行いますが、最終的な解決の責任を負うものではありません。</p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="termination" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第6条 契約解除</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>1. ユーザーは、いつでもアカウント設定画面から退会手続きを行うことができます。</p>
                <p>2. 当社は、ユーザーが本規約に違反した場合、事前の通知なくアカウントを停止または削除することができます。</p>
                <p>3. 退会後30日間はアカウントの復元が可能です。30日経過後は、全てのデータが完全に削除されます。</p>
                <p>4. 退会時に未払いの報酬がある場合は、当社所定の手続きに従い精算を行います。</p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="law" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第7条 準拠法</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>1. 本規約の解釈および適用は、日本法に準拠するものとします。</p>
                <p>2. 本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
                <p>3. 本規約の一部が無効と判断された場合でも、残りの条項は引き続き有効とします。</p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="contact" className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">第8条 お問い合わせ</h2>
              <div className="text-gray-600 leading-relaxed space-y-3">
                <p>本規約に関するお問い合わせは、以下の窓口までご連絡ください。</p>
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <p className="font-medium text-gray-900">Michibiki 導 株式会社</p>
                  <p className="mt-2">〒150-0002 東京都渋谷区渋谷2-24-12</p>
                  <p>メール：legal@michibiki.tech</p>
                  <p>電話：03-6890-XXXX（平日 10:00〜18:00）</p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer note */}
          <div className="mt-10 text-center text-sm text-gray-400">
            <p>以上</p>
            <p className="mt-2">制定日：2025年4月1日 ／ 最終改定日：2026年3月1日</p>
          </div>
        </div>
      </main>
    </>
  );
}

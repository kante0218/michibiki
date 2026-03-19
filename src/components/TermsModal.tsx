"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface TermsModalProps {
  type: "terms" | "privacy";
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const TERMS_CONTENT = {
  terms: {
    title: "利用規約",
    sections: [
      {
        heading: "第1条 サービス概要",
        body: "本利用規約（以下「本規約」）は、Michibiki 導 株式会社（以下「当社」）が提供するAI人材マッチングプラットフォーム「Michibiki」（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただく前に、本規約をよくお読みください。本サービスを利用することにより、ユーザーは本規約に同意したものとみなされます。",
      },
      {
        heading: "第2条 利用条件",
        body: "本サービスの利用には、以下の条件を満たす必要があります。\n・18歳以上であること\n・正確かつ最新の情報を登録すること\n・1人につき1つのアカウントのみ作成すること\n・アカウント情報を第三者に開示・共有しないこと",
      },
      {
        heading: "第3条 禁止事項",
        body: "ユーザーは、以下の行為を行ってはなりません。\n・虚偽の情報を登録する行為\n・他のユーザーになりすます行為\n・本サービスの運営を妨害する行為\n・法令または公序良俗に違反する行為\n・本サービスを利用した営業活動\n・スクレイピング等の自動化ツールの使用\n・当社の知的財産権を侵害する行為",
      },
      {
        heading: "第4条 知的財産権",
        body: "本サービスに関する知的財産権は、当社または正当な権利者に帰属します。ユーザーが本サービスに登録したコンテンツについて、当社はマッチングサービス提供の目的に限り利用することができます。",
      },
      {
        heading: "第5条 免責事項",
        body: "当社は、本サービスの完全性、正確性、有用性等について保証しません。本サービスの利用により生じた損害について、当社の故意または重過失による場合を除き、責任を負いません。マッチングの成立や雇用の保証は行いません。",
      },
      {
        heading: "第6条 契約解除",
        body: "ユーザーはいつでもアカウントを削除し、本サービスの利用を終了できます。当社は、ユーザーが本規約に違反した場合、事前の通知なくアカウントを停止・削除できます。",
      },
      {
        heading: "第7条 準拠法",
        body: "本規約は日本法に準拠し、東京地方裁判所を第一審の専属的合意管轄裁判所とします。",
      },
    ],
  },
  privacy: {
    title: "プライバシーポリシー",
    sections: [
      {
        heading: "1. 個人情報取扱事業者",
        body: "事業者名：Michibiki 導 株式会社\n所在地：〒150-0002 東京都渋谷区渋谷2-24-12",
      },
      {
        heading: "2. 個人情報の収集",
        body: "当社は、本サービスの提供にあたり、以下の個人情報を収集する場合があります。\n・氏名、メールアドレス、電話番号\n・職歴、学歴、スキル情報\n・履歴書、職務経歴書\n・プロフィール写真\n・銀行口座情報（報酬支払いのため）\n・IPアドレス、ブラウザ情報、Cookie情報",
      },
      {
        heading: "3. 利用目的",
        body: "収集した個人情報は以下の目的で利用します。\n・本サービスの提供、運営、改善\n・ユーザーアカウントの管理・認証\n・AIによるスキル評価の算出\n・求職者と企業のマッチング\n・報酬の計算・支払い処理\n・カスタマーサポートの提供\n・不正利用の防止・検出",
      },
      {
        heading: "4. 第三者提供",
        body: "当社は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。\n・ユーザーが求人に応募した場合の応募先企業への必要情報の提供\n・法令に基づく場合\n・人の生命、身体または財産の保護のために必要がある場合",
      },
      {
        heading: "5. 安全管理措置",
        body: "当社は、個人情報保護法に基づき、以下の安全管理措置を講じています。\n・アクセス制御（Row Level Security）\n・通信経路の暗号化（TLS 1.2以上）\n・保存データの暗号化（AES-256）\n・外部からの不正アクセス防止",
      },
      {
        heading: "6. ユーザーの権利",
        body: "ユーザーは、個人情報保護法に基づき、自身の個人情報の開示、訂正、削除、利用停止を請求する権利を有します。アカウント削除後、30日の猶予期間を経てデータは完全に削除されます。",
      },
      {
        heading: "7. お問い合わせ",
        body: "個人情報の取り扱いに関するお問い合わせは以下までお願いします。\nメール：privacy@michibiki.tech",
      },
    ],
  },
};

export default function TermsModal({ type, open, onClose, onAgree }: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    // Check if scrolled near the bottom (within 40px)
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  }, []);

  if (!open) return null;

  const content = TERMS_CONTENT[type];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{content.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {content.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-gray-800 mb-2">{section.heading}</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </div>
          ))}

          {/* Scroll indicator at the bottom */}
          <div className="text-center text-xs text-gray-400 pt-2 pb-1">
            最終更新日：2026年3月18日
          </div>
        </div>

        {/* Scroll hint + Agree button */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          {!hasScrolledToBottom && (
            <p className="text-xs text-amber-600 text-center mb-3 flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              最後までスクロールしてお読みください
            </p>
          )}
          <button
            onClick={() => {
              onAgree();
              onClose();
            }}
            disabled={!hasScrolledToBottom}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              hasScrolledToBottom
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/25"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {hasScrolledToBottom ? "同意する" : "最後までお読みください"}
          </button>
        </div>
      </div>
    </div>
  );
}

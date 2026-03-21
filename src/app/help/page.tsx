"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

const categories = [
  {
    id: "getting-started",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.37m5.96 6a14.926 14.926 0 01-5.84 2.58m0 0a14.926 14.926 0 01-5.84-2.58m5.84 2.58V18.8m-5.84-6.43a6 6 0 115.84 7.38" />
      </svg>
    ),
    title: "はじめに",
    description: "登録、プロフィール設定",
    faqs: [
      { q: "Michibikiへの登録方法を教えてください。", a: "Michibikiへの登録は無料です。トップページの「登録する」ボタンからメールアドレスまたはGoogleアカウントで簡単に登録できます。登録後、プロフィールを完成させるとAIマッチングが開始されます。" },
      { q: "プロフィールの設定で重要なポイントは？", a: "スキル、経験年数、希望する勤務形態、希望報酬レンジを正確に入力してください。これらの情報がAIマッチングの精度を大きく左右します。GitHubやポートフォリオのリンクも追加すると、企業からの注目度が上がります。" },
      { q: "APEXスコアとは何ですか？", a: "APEXスコアはMichibiki独自のスキル評価指標です。AI面接やスキルテストの結果に基づいて算出され、企業が候補者のスキルレベルを客観的に判断するために使用されます。" },
      { q: "登録後、すぐに求人に応募できますか？", a: "はい、プロフィールを設定後すぐに求人への応募が可能です。ただし、AI面接を完了するとAPEXスコアが付与され、より多くの求人とマッチングされるようになります。" },
      { q: "アカウントの削除方法は？", a: "設定ページの「アカウント管理」から削除申請が可能です。削除後30日以内であれば復元できます。30日を過ぎるとすべてのデータが完全に削除されます。" },
    ],
  },
  {
    id: "ai-interview",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "AI面接",
    description: "面接の流れ、よくある質問",
    faqs: [
      { q: "AI面接はどのように行われますか？", a: "AI面接はビデオ通話形式で行われます。AIが技術的な質問やケーススタディを出題し、あなたの回答をリアルタイムで分析します。所要時間は約30〜45分です。カメラとマイクが正常に動作することを事前に確認してください。" },
      { q: "AI面接の準備として何をすればいいですか？", a: "静かな環境を確保し、安定したインターネット接続を用意してください。技術面接では実際のコーディングが求められる場合もあります。リラックスして、普段通りの実力を発揮することが大切です。" },
      { q: "AI面接の結果はいつわかりますか？", a: "面接終了後、通常24時間以内にAPEXスコアが更新されます。詳細なフィードバックレポートもダッシュボードで確認できます。" },
      { q: "AI面接は何回受けられますか？", a: "初回面接後、90日ごとに再受験が可能です。スキルアップした場合は再受験してスコアを更新することをお勧めします。" },
      { q: "面接中に技術的な問題が発生した場合は？", a: "接続が切れた場合は自動的に再接続を試みます。問題が解決しない場合は、サポートチームにご連絡ください。未完了の面接は再スケジュール可能です。" },
    ],
  },
  {
    id: "jobs",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    title: "求人・応募",
    description: "求人検索、応募方法",
    faqs: [
      { q: "求人の検索方法を教えてください。", a: "「求人を探す」ページでキーワード検索やフィルター（ドメイン、報酬、勤務形態、勤務地など）を使って求人を絞り込めます。AIがあなたのプロフィールに基づいてマッチ度も表示します。" },
      { q: "応募後の流れを教えてください。", a: "応募後、企業がプロフィールとAPEXスコアを確認します。マッチする場合は企業から面接リクエストが届きます。ダッシュボードで応募状況をリアルタイムに確認できます。" },
      { q: "同時に複数の求人に応募できますか？", a: "はい、制限なく複数の求人に同時応募可能です。ただし、各求人に対して丁寧に対応することをお勧めします。" },
      { q: "応募を取り下げることはできますか？", a: "はい、ダッシュボードの「応募管理」から応募を取り下げることができます。企業との面接が設定された後の取り下げはマナーとしてお控えください。" },
    ],
  },
  {
    id: "payment",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: "報酬・決済",
    description: "支払いスケジュール、請求書",
    faqs: [
      { q: "支払いはどのように行われますか？", a: "報酬は毎週水曜日に前週分が自動送金されます。日本国内の銀行口座への振込に対応しています。Stripeを通じた安全な決済システムを使用しています。" },
      { q: "請求書（インボイス）の発行方法は？", a: "ダッシュボードの「報酬・決済」ページから適格請求書（インボイス）をダウンロードできます。インボイス制度に対応した形式で自動生成されます。" },
      { q: "源泉徴収はどうなりますか？", a: "業務委託の場合、源泉徴収税は報酬から自動的に差し引かれます。年末に源泉徴収票をダウンロードできます。確定申告にご利用ください。" },
      { q: "銀行口座の変更方法は？", a: "設定ページの「決済情報」から銀行口座を変更できます。セキュリティのため、変更後は本人確認が必要です。反映まで1〜2営業日かかります。" },
    ],
  },
  {
    id: "company",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    title: "企業向け",
    description: "求人掲載、候補者管理",
    faqs: [
      { q: "求人を掲載するにはどうすればいいですか？", a: "企業アカウントにログイン後、「新規求人を作成」ページから求人を掲載できます。職種、スキル要件、報酬レンジなどを入力すると、AIが最適な候補者を自動推薦します。" },
      { q: "候補者の管理方法を教えてください。", a: "企業ダッシュボードで応募者一覧の確認、面接スケジュール管理、候補者へのメッセージ送信が可能です。APEXスコアで候補者のスキルレベルを確認できます。" },
      { q: "料金体系について教えてください。", a: "求人掲載は無料です。採用が成立した場合に成功報酬が発生します。詳細な料金プランについては営業チームにお問い合わせください。" },
      { q: "AIによる候補者推薦の精度は？", a: "MichibikiのAIは技術スキル、経験、カルチャーフィットなど多角的に分析し、高精度なマッチングを実現しています。推薦候補者は平均3日以内に面接可能です。" },
    ],
  },
  {
    id: "security",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "セキュリティ",
    description: "データ保護、プライバシー",
    faqs: [
      { q: "個人情報はどのように保護されていますか？", a: "すべてのデータは転送中・保存中ともに暗号化で保護されています。厳格なセキュリティ基準に基づいてデータを管理しています。" },
      { q: "面接データはどう扱われますか？", a: "面接データはマッチング目的のみに使用されます。第三者への販売は行いません。データの保持期間や削除についてはプライバシーポリシーをご確認ください。" },
      { q: "二要素認証は使えますか？", a: "はい、設定ページから二要素認証（2FA）を有効にできます。認証アプリ（Google Authenticator等）またはSMSによる認証に対応しています。" },
      { q: "不正アクセスを検知した場合は？", a: "異常なログインを検知した場合、即座にメール通知を送信します。心当たりのないログインがあった場合は、すぐにパスワードを変更し、サポートチームにご連絡ください。" },
    ],
  },
];

const popularArticles = [
  { title: "Michibikiの始め方ガイド", category: "はじめに" },
  { title: "AI面接で高スコアを取るコツ", category: "AI面接" },
  { title: "インボイス制度への対応について", category: "報酬・決済" },
  { title: "リモートワーク求人の探し方", category: "求人・応募" },
  { title: "プロフィールを魅力的にする5つの方法", category: "はじめに" },
];

type ChatMessage = {
  text: string;
  isUser: boolean;
};

export default function HelpPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch previous chat history when modal opens
  useEffect(() => {
    if (showChat && user) {
      setChatLoading(true);
      (supabase.from("chat_messages") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .then(({ data, error }: { data: any[] | null; error: any }) => {
          if (!error && data && data.length > 0) {
            const history: ChatMessage[] = data.map((msg: any) => ({
              text: msg.message,
              isUser: msg.sender === "user",
            }));
            setChatMessages([
              { text: "Michibikiサポートへようこそ。ご質問をどうぞ。", isUser: false },
              ...history,
            ]);
          } else {
            setChatMessages([
              { text: "Michibikiサポートへようこそ。ご質問をどうぞ。", isUser: false },
            ]);
          }
          setChatLoading(false);
        });
    }
  }, [showChat, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleFaq = (categoryId: string, index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === index ? null : index,
    }));
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !user || sendingMessage) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { text: userMsg, isUser: true }]);
    setChatInput("");
    setSendingMessage(true);

    // Save message to Supabase
    const { error } = await (supabase.from("chat_messages") as any).insert({
      user_id: user.id,
      sender: "user",
      message: userMsg,
    });

    if (error) {
      setChatMessages((prev) => [
        ...prev,
        { text: "メッセージの送信に失敗しました。もう一度お試しください。", isUser: false },
      ]);
    } else {
      setChatMessages((prev) => [
        ...prev,
        { text: "メッセージを送信しました。担当者が確認次第返信いたします。", isUser: false },
      ]);
    }
    setSendingMessage(false);
  };

  const handleChatButtonClick = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setShowChat(true);
  };

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    faqs: searchQuery
      ? cat.faqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : cat.faqs,
  })).filter((cat) => (searchQuery ? cat.faqs.length > 0 : true));

  return (
    <div className="min-h-screen bg-white">
      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowChat(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col" style={{ height: "500px" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">ライブチャット</h3>
                  <p className="text-xs text-green-600">オンライン</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-sm text-gray-400">読み込み中...</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.isUser ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || sendingMessage}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublicHeader />

      {/* Hero with search */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">ヘルプセンター</h1>
          <p className="text-gray-600 mb-8">ご不明な点がございましたら、以下からお探しください。</p>
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="質問を検索..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Category cards grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {!searchQuery && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="group p-6 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{cat.title}</h3>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </a>
            ))}
          </div>
        )}

        {/* FAQ sections */}
        <div className="space-y-12">
          {filteredCategories.map((cat) => (
            <div key={cat.id} id={cat.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  {cat.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{cat.title}</h2>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                {cat.faqs.map((faq, idx) => (
                  <div key={idx}>
                    <button
                      onClick={() => toggleFaq(cat.id, idx)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 pr-4">{faq.q}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openItems[cat.id] === idx ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openItems[cat.id] === idx && (
                      <div className="px-6 pb-4">
                        <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular articles */}
      {!searchQuery && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">人気の記事</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((article, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mb-2">
                    {article.category}
                  </span>
                  <h3 className="font-medium text-gray-900 text-sm mb-2">{article.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">お問い合わせ</h2>
          <p className="text-gray-600 mb-8">解決できない問題がありましたら、お気軽にご連絡ください。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">メールサポート</h3>
              <p className="text-sm text-gray-500 mb-3">24時間以内に返信いたします</p>
              <a href="mailto:support@michibiki.tech" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                support@michibiki.tech
              </a>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">ライブチャット</h3>
              <p className="text-sm text-gray-500 mb-3">平日 9:00〜18:00（JST）</p>
              <button
                onClick={handleChatButtonClick}
                className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                チャットを開始
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

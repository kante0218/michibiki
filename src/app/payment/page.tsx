"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import Logo from "@/components/Logo";

type PaymentInfo = Database["public"]["Tables"]["payment_info"]["Row"];
type Earning = Database["public"]["Tables"]["earnings"]["Row"];
type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function statusLabel(status: Earning["status"]): string {
  switch (status) {
    case "paid": return "支払済み";
    case "processing": return "処理中";
    case "pending": return "保留中";
    default: return status;
  }
}

export default function PaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paidEarnings, setPaidEarnings] = useState<Earning[]>([]);
  const [allEarnings, setAllEarnings] = useState<Earning[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [activeTab, setActiveTab] = useState<"history" | "invoices">("history");
  const [toast, setToast] = useState<string | null>(null);
  const [editingBank, setEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    branchName: "",
    accountNumber: "",
    accountHolder: "",
  });

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [paymentRes, earningsRes, paidRes, chatRes]: any[] = await Promise.all([
      (supabase.from("payment_info") as any)
        .select("*")
        .eq("user_id", user.id)
        .single(),
      (supabase.from("earnings") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      (supabase.from("earnings") as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "paid")
        .order("date", { ascending: false }),
      (supabase.from("chat_messages") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    if (paymentRes.data) {
      setPaymentInfo(paymentRes.data);
      setBankForm({
        bankName: paymentRes.data.bank_name || "",
        branchName: paymentRes.data.branch_name || "",
        accountNumber: paymentRes.data.account_number || "",
        accountHolder: paymentRes.data.account_holder || "",
      });
    }

    if (earningsRes.data) setAllEarnings(earningsRes.data);
    if (paidRes.data) setPaidEarnings(paidRes.data);
    if (chatRes.data) setChatMessages(chatRes.data);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChat]);

  // Summary calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthIncome = allEarnings
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const unpaidBalance = allEarnings
    .filter((e) => e.status === "pending" || e.status === "processing")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = allEarnings
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  const nextPayDay = (() => {
    const today = new Date();
    const day = today.getDay();
    const daysUntilWed = (3 - day + 7) % 7 || 7;
    const nextWed = new Date(today);
    nextWed.setDate(today.getDate() + daysUntilWed);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${nextWed.getMonth() + 1}月${nextWed.getDate()}日（${weekdays[nextWed.getDay()]}）`;
  })();

  // Bank save handler
  const handleBankSave = async () => {
    if (!user) return;
    setSavingBank(true);

    if (paymentInfo) {
      // Update existing
      const { error } = await (supabase.from("payment_info") as any)
        .update({
          bank_name: bankForm.bankName || null,
          branch_name: bankForm.branchName || null,
          account_number: bankForm.accountNumber || null,
          account_holder: bankForm.accountHolder || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentInfo.id);

      if (!error) {
        setPaymentInfo({
          ...paymentInfo,
          bank_name: bankForm.bankName || null,
          branch_name: bankForm.branchName || null,
          account_number: bankForm.accountNumber || null,
          account_holder: bankForm.accountHolder || null,
          updated_at: new Date().toISOString(),
        });
        setEditingBank(false);
        showToast("口座情報を更新しました");
      } else {
        showToast("保存に失敗しました");
      }
    } else {
      // Insert new
      const { data, error } = await (supabase.from("payment_info") as any)
        .insert({
          user_id: user.id,
          bank_name: bankForm.bankName || null,
          branch_name: bankForm.branchName || null,
          account_number: bankForm.accountNumber || null,
          account_holder: bankForm.accountHolder || null,
        })
        .select()
        .single();

      if (!error && data) {
        setPaymentInfo(data);
        setEditingBank(false);
        showToast("口座情報を登録しました");
      } else {
        showToast("保存に失敗しました");
      }
    }
    setSavingBank(false);
  };

  // Chat send handler
  const handleSendChat = async () => {
    if (!chatInput.trim() || !user) return;
    const msg = chatInput.trim();
    setChatInput("");
    setSendingChat(true);

    const { data, error } = await (supabase.from("chat_messages") as any)
      .insert({
        user_id: user.id,
        sender: "user",
        message: msg,
      })
      .select()
      .single();

    if (!error && data) {
      setChatMessages((prev) => [...prev, data]);
    }
    setSendingChat(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
      case "processing":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
      case "pending":
        return "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20";
      default:
        return "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20";
    }
  };

  const hasBankInfo = paymentInfo && (paymentInfo.bank_name || paymentInfo.account_number);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-100" />
            <div className="absolute inset-0 w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-400 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-gray-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fade-in border border-white/10">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowChat(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 flex flex-col border border-gray-200/50" style={{ height: "520px" }}>
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-t-3xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">サポートチャット</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs text-gray-500">オンライン</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">メッセージを送信して会話を始めましょう</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-sm"
                        : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md"
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Chat input */}
            <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-3xl">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !sendingChat) handleSendChat(); }}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || sendingChat}
                  className="p-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl transition-all shadow-sm shadow-indigo-500/25"
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

      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo size="xs" />
              <span className="font-semibold text-gray-900 text-sm hidden sm:inline">Michibiki</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 px-3 py-1.5 rounded-lg transition-all">ホーム</Link>
              <Link href="/explore" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 px-3 py-1.5 rounded-lg transition-all">求人を探す</Link>
              <Link href="/payment" className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg font-medium ring-1 ring-indigo-100">報酬・決済</Link>
              <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 px-3 py-1.5 rounded-lg transition-all">ヘルプ</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/earnings" className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium">収益</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">報酬・決済</h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">収入の確認と決済設定を管理します</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-100" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-400 font-medium">読み込み中...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* 今月の収入 */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">今月の収入</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  <span className="text-base font-medium text-gray-400">¥</span>
                  {thisMonthIncome.toLocaleString()}
                </p>
              </div>
              {/* 未払い残高 */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">未払い残高</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  <span className="text-base font-medium text-gray-400">¥</span>
                  {unpaidBalance.toLocaleString()}
                </p>
                {unpaidBalance > 0 && <p className="text-xs text-amber-600 mt-1 font-medium">処理中</p>}
              </div>
              {/* 次回支払日 */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">次回支払日</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{nextPayDay}</p>
              </div>
              {/* 累計収入 - Featured */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-5 text-white shadow-lg shadow-indigo-500/25">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-indigo-100 font-medium">累計収入</span>
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">
                    <span className="text-lg font-medium text-indigo-200">¥</span>
                    {totalIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment schedule */}
            <div className="bg-gradient-to-r from-indigo-50 via-indigo-50/50 to-purple-50 border border-indigo-100/50 rounded-2xl p-5 mb-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 text-sm mb-1">支払いスケジュール</h3>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  毎週水曜日に前週分の報酬を自動送金いたします。祝日の場合は翌営業日の送金となります。処理には通常1〜2営業日かかります。
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-gray-200/60">
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === "history" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                支払い履歴
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === "invoices" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                適格請求書（インボイス）
              </button>
            </div>

            {/* Payment history table */}
            {activeTab === "history" && (
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden mb-8">
                {paidEarnings.length === 0 && allEarnings.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">支払い履歴はありません</p>
                    <p className="text-xs text-gray-400 mt-1">プロジェクトの報酬が発生すると、ここに表示されます。</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">日付</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">プロジェクト</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">時間</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">金額</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">ステータス</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {allEarnings.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(entry.date)}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.project_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{entry.hours.toFixed(1)}h</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatYen(entry.amount)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(entry.status)}`}>{statusLabel(entry.status)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Invoices */}
            {activeTab === "invoices" && (
              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">適格請求書（インボイス）</h3>
                      <p className="text-sm text-gray-500 mt-0.5">インボイス制度に対応した適格請求書を発行・ダウンロードできます。</p>
                    </div>
                  </div>
                  {paymentInfo?.invoice_number ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">インボイス登録番号</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">登録済み</span>
                      </div>
                      <p className="text-base font-mono font-medium text-gray-900">{paymentInfo.invoice_number}</p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 mb-4 text-center">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">インボイス登録番号が未登録です</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bank account settings */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">振込先口座</h3>
              </div>
              <p className="text-sm text-gray-500 mb-5 ml-11">報酬の振込先銀行口座を管理します</p>

              {!editingBank ? (
                hasBankInfo ? (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {paymentInfo?.bank_name || ""}{paymentInfo?.branch_name ? ` ${paymentInfo.branch_name}` : ""}
                        </p>
                        <p className="text-sm text-gray-500">
                          普通 ****{paymentInfo?.account_number ? paymentInfo.account_number.slice(-4) : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingBank(true)}
                      className="p-2 hover:bg-gray-200 rounded-xl transition-colors opacity-70 group-hover:opacity-100"
                      title="編集"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-4">支払い情報が未登録です</p>
                    <button
                      onClick={() => setEditingBank(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-indigo-500/25"
                    >
                      口座を登録する
                    </button>
                  </div>
                )
              ) : (
                <div className="border border-gray-200 rounded-2xl p-6 space-y-4 bg-gray-50/30">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">銀行名</label>
                    <input
                      type="text"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      placeholder="例: 三菱UFJ銀行"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">支店名</label>
                    <input
                      type="text"
                      value={bankForm.branchName}
                      onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                      placeholder="例: 渋谷支店"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">口座番号</label>
                    <input
                      type="text"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      placeholder="例: 1234567"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">口座名義（カタカナ）</label>
                    <input
                      type="text"
                      value={bankForm.accountHolder}
                      onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                      placeholder="例: タナカ タロウ"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleBankSave}
                      disabled={savingBank}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-indigo-400 disabled:to-indigo-400 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-indigo-500/25"
                    >
                      {savingBank ? "保存中..." : "保存する"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingBank(false);
                        if (paymentInfo) {
                          setBankForm({
                            bankName: paymentInfo.bank_name || "",
                            branchName: paymentInfo.branch_name || "",
                            accountNumber: paymentInfo.account_number || "",
                            accountHolder: paymentInfo.account_holder || "",
                          });
                        }
                      }}
                      className="px-5 py-2.5 border border-gray-200 hover:bg-white text-gray-700 text-sm font-medium rounded-xl transition-all"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tax section */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">税務関連</h3>
              </div>
              <p className="text-sm text-gray-500 mb-5 ml-11">源泉徴収とインボイス制度に関する情報</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1.5">源泉徴収</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    業務委託契約に基づく報酬は、所得税法に従い源泉徴収税（10.21%）を差し引いた金額をお支払いします。年末に源泉徴収票を発行いたします。
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1.5">インボイス制度</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    適格請求書発行事業者として登録済みの方は、設定ページで登録番号を入力してください。インボイス対応の請求書が自動生成されます。
                  </p>
                </div>
              </div>
              <button
                onClick={() => showToast("ダウンロードを開始しました")}
                className="flex items-center gap-2 text-sm text-gray-700 font-medium bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                税務書類をダウンロード
              </button>
            </div>

            {/* Support */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">サポート</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4 ml-11">決済に関するご質問はサポートチームにお問い合わせください</p>
              <button
                onClick={() => setShowChat(true)}
                className="ml-11 flex items-center gap-2 text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2.5 rounded-xl transition-all font-medium shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                チャットを開始
              </button>
            </div>

            {/* Stripe badge */}
            <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
              </svg>
              <span className="text-sm font-medium">Powered by Stripe</span>
              <span className="text-xs ml-1 bg-gray-100 px-2 py-0.5 rounded-md">安全な決済処理</span>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/80 backdrop-blur-sm py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">&copy; 2026 Michibiki 導 株式会社</p>
          <div className="flex items-center gap-6">
            <Link href="/security" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">セキュリティ</Link>
            <Link href="/help" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">ヘルプ</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">利用規約</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

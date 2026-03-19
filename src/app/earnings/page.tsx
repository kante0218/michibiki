"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ExploreHeader";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Earning = Database["public"]["Tables"]["earnings"]["Row"];

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

export default function EarningsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

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

  // Fetch earnings
  const fetchEarnings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase.from("earnings") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (!error && data) {
      setEarnings(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEarnings();
    }
  }, [user, fetchEarnings]);

  // Summary calculations
  const totalPaid = earnings
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthEarnings = earnings
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingAmount = earnings
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);

  // Build period filter options from actual data
  const periodSet = new Map<string, { year: number; month: number }>();
  earnings.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!periodSet.has(key)) {
      periodSet.set(key, { year: d.getFullYear(), month: d.getMonth() });
    }
  });
  const periodOptions = [
    { label: "すべて", value: "all" },
    ...Array.from(periodSet.entries())
      .sort((a, b) => {
        if (b[1].year !== a[1].year) return b[1].year - a[1].year;
        return b[1].month - a[1].month;
      })
      .map(([key, val]) => ({
        label: `${val.month + 1}月`,
        value: key,
      })),
  ];

  // Filter transactions by period
  const filteredTransactions = selectedPeriod === "all"
    ? earnings
    : earnings.filter((e) => {
        const d = new Date(e.date);
        return `${d.getFullYear()}-${d.getMonth()}` === selectedPeriod;
      });

  const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 6);

  // Monthly chart data (last 6 months)
  const monthlyMap = new Map<string, number>();
  earnings.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + e.amount);
  });

  const chartMonths: { key: string; month: string; amount: number; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const amount = monthlyMap.get(key) || 0;
    chartMonths.push({
      key,
      month: `${d.getMonth() + 1}月`,
      amount,
      label: formatYen(amount),
    });
  }

  const chartMax = Math.max(...chartMonths.map((d) => d.amount), 1);

  const statusBadge = (status: Earning["status"]) => {
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

  const yLabels = (() => {
    const step = Math.ceil(chartMax / 3);
    return [
      formatYen(step * 3),
      formatYen(step * 2),
      formatYen(step),
      "¥0",
    ];
  })();

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fade-in border border-white/10">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <Sidebar activeItem="earnings" />

      <main className="ml-0 md:ml-[96px] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">収益</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">収入の確認と支払い状況を管理します</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-sm text-gray-500">読み込み中...</p>
              </div>
            </div>
          ) : earnings.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">収益データはまだありません</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">プロジェクトを開始して収益を獲得しましょう。データが蓄積されるとここに表示されます。</p>
              <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30">
                求人を探す
              </button>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* 総収益 - Featured gradient card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-5 text-white shadow-lg shadow-indigo-500/25">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-indigo-100 font-medium">総収益</span>
                      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      <span className="text-lg font-medium text-indigo-200">¥</span>
                      {totalPaid.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* 今月の収益 */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 font-medium">今月の収益</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    <span className="text-base font-medium text-gray-400">¥</span>
                    {thisMonthEarnings.toLocaleString()}
                  </p>
                </div>

                {/* 保留中 */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 font-medium">保留中</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    <span className="text-base font-medium text-gray-400">¥</span>
                    {pendingAmount.toLocaleString()}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const today = new Date();
                      const day = today.getDay();
                      const daysUntilWed = (3 - day + 7) % 7 || 7;
                      const nextWed = new Date(today);
                      nextWed.setDate(today.getDate() + daysUntilWed);
                      const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
                      return `${nextWed.getMonth() + 1}月${nextWed.getDate()}日（${weekdays[nextWed.getDay()]}）`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Earnings Chart */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">月別収益推移</h2>
                    <p className="text-xs text-gray-400 mt-0.5">過去6ヶ月間のデータ</p>
                  </div>
                  <button
                    onClick={() => showToast("ダウンロードを開始しました")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition-all font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    CSV出力
                  </button>
                </div>
                <div className="flex">
                  <div className="flex flex-col justify-between pr-4 text-xs text-gray-400 py-1 font-medium" style={{ height: 240 }}>
                    {yLabels.map((label) => (
                      <span key={label} className="text-right w-16">{label}</span>
                    ))}
                  </div>
                  <div className="flex-1 flex items-end gap-4 border-l border-b border-gray-100 pl-4 pb-2" style={{ height: 240 }}>
                    {chartMonths.map((d, idx) => {
                      const heightPct = chartMax > 0 ? (d.amount / chartMax) * 100 : 0;
                      return (
                        <div
                          key={d.key}
                          className="flex-1 flex flex-col items-center justify-end h-full relative"
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {hoveredBar === idx && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap z-10 shadow-xl font-medium">
                              {d.label}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95" />
                            </div>
                          )}
                          <span className="text-[10px] text-gray-400 mb-1 whitespace-nowrap font-medium">{d.label}</span>
                          <div
                            className={`w-full max-w-[48px] rounded-t-xl transition-all duration-200 cursor-pointer ${
                              hoveredBar === idx
                                ? "bg-gradient-to-t from-indigo-600 to-purple-500 shadow-lg shadow-indigo-500/30"
                                : "bg-gradient-to-t from-indigo-500 to-indigo-400"
                            }`}
                            style={{ height: `${Math.max(heightPct, d.amount > 0 ? 2 : 0)}%` }}
                          />
                          <span className="text-xs text-gray-500 mt-2 font-semibold">{d.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">最近の取引</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{filteredTransactions.length}件の取引</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
                      {periodOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSelectedPeriod(opt.value); setShowAll(false); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedPeriod === opt.value
                              ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => showToast("ダウンロードを開始しました")}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition-all font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      ダウンロード
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">日付</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">プロジェクト</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">クライアント</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">時間</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">金額</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">ステータス</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {displayedTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.project_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{tx.client_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">{tx.hours.toFixed(1)}h</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatYen(tx.amount)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(tx.status)}`}>{statusLabel(tx.status)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTransactions.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-400">この期間の取引はありません</p>
                  </div>
                )}
                {!showAll && filteredTransactions.length > 6 && (
                  <div className="px-6 py-4 border-t border-gray-100 text-center">
                    <button onClick={() => setShowAll(true)} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline underline-offset-4">
                      すべて表示 ({filteredTransactions.length}件)
                    </button>
                  </div>
                )}
                {showAll && filteredTransactions.length > 6 && (
                  <div className="px-6 py-4 border-t border-gray-100 text-center">
                    <button onClick={() => setShowAll(false)} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline underline-offset-4">
                      折りたたむ
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method & Tax Info Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">支払い方法</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-5 ml-11">報酬の振込先銀行口座</p>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                    </div>
                    <p className="text-sm text-indigo-700 font-medium">毎週水曜日に前週分の報酬を自動送金</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">税務情報</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-5 ml-11">インボイス制度・源泉徴収に関する情報</p>
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1.5">源泉徴収について</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">業務委託契約に基づく報酬は、所得税法に従い源泉徴収税（10.21%）を差し引いた金額をお支払いします。年末に源泉徴収票を発行いたします。</p>
                  </div>
                  <button
                    onClick={() => showToast("ダウンロードを開始しました")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    税務書類をダウンロード
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

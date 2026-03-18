"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Sidebar, TopBar } from "@/components/ExploreHeader";
import {
  FiUploadCloud,
  FiLink,
  FiSearch,
  FiHelpCircle,
  FiShare2,
  FiUsers,
  FiUserPlus,
  FiDownload,
  FiCheckCircle,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

type Tab = "connections" | "referrals";
type TimeFilter = "1D" | "3D" | "7D" | "ALL";
type ReferralStatus =
  | "signed_up"
  | "application_started"
  | "application_completed"
  | "offer_extended"
  | "hired"
  | "paid";

const STATUS_LABELS: Record<ReferralStatus, string> = {
  signed_up: "登録済み",
  application_started: "応募開始",
  application_completed: "応募完了",
  offer_extended: "オファー提示",
  hired: "採用",
  paid: "報酬支払済",
};

export default function ReferralsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("connections");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<ReferralStatus>("signed_up");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || "XXXXXXXX";
  const referralLink = `https://michibiki.jp/signup?ref=${referralCode}`;

  const handleShare = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock stats — all zeros for empty state
  const stats: Record<ReferralStatus, number> = {
    signed_up: 0,
    application_started: 0,
    application_completed: 0,
    offer_extended: 0,
    hired: 0,
    paid: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar activeItem="referrals" />
      <TopBar />

      <main className="ml-0 md:ml-[96px] pt-16 px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">紹介</h1>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiHelpCircle size={18} />
              </button>
            </div>
            <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
              本日の紹介数 0/500
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("connections")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "connections"
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              マイコネクション
              {activeTab === "connections" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("referrals")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "referrals"
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              紹介履歴
              {activeTab === "referrals" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "connections" ? (
            <ConnectionsTab />
          ) : (
            <ReferralsTab
              stats={stats}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onShare={handleShare}
              copied={copied}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Connections Tab ─── */

function ConnectionsTab() {
  return (
    <>
      {/* Help button */}
      <div className="flex justify-end mb-4">
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors">
          <FiHelpCircle size={14} />
          ヘルプ
        </button>
      </div>

      {/* Empty State Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <FiUsers size={28} className="text-indigo-400" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          まだコネクションがありません
        </h2>
        <p className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1">
          LinkedInのコネクションを紹介報酬に変えましょう
          <FiInfo size={14} className="text-gray-400" />
        </p>
        <p className="text-xs text-gray-400 italic mb-8">
          LinkedInのコネクションをアップロードしても、メッセージは送信されません。あなたが管理します。
        </p>

        {/* Steps */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mb-8">
          {[
            { num: 1, label: "コネクションを\nダウンロード", sub: "LinkedInネットワークを\nエクスポート" },
            { num: 2, label: "アップロード＆\nマッチング", sub: "関連する求人を\nお探しします" },
            { num: 3, label: "報酬を獲得", sub: "採用されたら\n報酬を受け取る" },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                {step.num}
              </div>
              <p className="text-sm font-semibold text-gray-900 whitespace-pre-line leading-tight">
                {step.label}
              </p>
              <p className="text-xs text-gray-400 whitespace-pre-line leading-tight">
                {step.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-md shadow-indigo-500/20">
            <FiUploadCloud size={16} />
            コネクションをアップロード
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#0A66C2]">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            コネクションを取得
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-8">
          LinkedInからZIPを展開して「Connections.csv」をここにアップロードしてください。
        </p>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 mb-3">
            LinkedInをお持ちでない方は、候補者の適性を直接チェックできます。
          </p>
          <button className="flex items-center gap-2 mx-auto bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 transition-colors">
            <HiOutlineSparkles size={16} className="text-indigo-500" />
            候補者の適性をチェック
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Referrals Tab ─── */

function ReferralsTab({
  stats,
  timeFilter,
  setTimeFilter,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  onShare,
  copied,
}: {
  stats: Record<ReferralStatus, number>;
  timeFilter: TimeFilter;
  setTimeFilter: (f: TimeFilter) => void;
  selectedStatus: ReferralStatus;
  setSelectedStatus: (s: ReferralStatus) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onShare: () => void;
  copied: boolean;
}) {
  const timeFilters: TimeFilter[] = ["1D", "3D", "7D", "ALL"];
  const statuses: ReferralStatus[] = [
    "signed_up",
    "application_started",
    "application_completed",
    "offer_extended",
    "hired",
    "paid",
  ];

  return (
    <>
      {/* Description + controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <p className="text-sm text-gray-500">
          紹介の進捗と報酬を追跡できます
        </p>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors">
            <HiOutlineSparkles size={14} className="text-indigo-500" />
            新着情報
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors"
          >
            <FiShare2 size={14} />
            {copied ? "コピー済み！" : "シェア"}
          </button>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            {timeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeFilter === f
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`p-4 text-left border-b lg:border-b-0 lg:border-r border-gray-100 last:border-r-0 transition-colors relative ${
              selectedStatus === status ? "bg-indigo-50/50" : "hover:bg-gray-50"
            }`}
          >
            <p
              className={`text-xs font-medium mb-1 ${
                selectedStatus === status ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              {STATUS_LABELS[status]}
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats[status]}</p>
            {selectedStatus === status && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {/* Filter + Search row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors">
          <HiOutlineSparkles size={14} className="text-indigo-400" />
          ステータス：{STATUS_LABELS[selectedStatus]}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-1">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="名前またはメールで検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 w-64 transition-all"
          />
        </div>
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <FiUserPlus size={28} className="text-gray-300" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          まだ紹介がありません
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          あなたの紹介はすべてここに表示されます
        </p>
        <button
          onClick={onShare}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-md shadow-indigo-500/20"
        >
          <FiLink size={14} />
          紹介リンクをシェア
        </button>
      </div>
    </>
  );
}

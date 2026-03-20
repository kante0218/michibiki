"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Sidebar, TopBar } from "@/components/ExploreHeader";
import {
  FiUploadCloud,
  FiLink,
  FiSearch,
  FiHelpCircle,
  FiShare2,
  FiUsers,
  FiUserPlus,
  FiInfo,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import type { Database } from "@/lib/database.types";

type Tab = "connections" | "referrals";
type TimeFilter = "1D" | "3D" | "7D" | "ALL";
type ReferralStatus =
  | "signed_up"
  | "application_started"
  | "application_completed"
  | "offer_extended"
  | "hired"
  | "paid";

type ConnectionRow = Database["public"]["Tables"]["connections"]["Row"];
type ReferralRow = Database["public"]["Tables"]["referrals"]["Row"];

const STATUS_LABELS: Record<ReferralStatus, string> = {
  signed_up: "登録済み",
  application_started: "応募開始",
  application_completed: "応募完了",
  offer_extended: "オファー提示",
  hired: "採用",
  paid: "報酬支払済",
};

/* ─── CSV Parser ─── */
function parseLinkedInCSV(csvText: string): Omit<ConnectionRow, "id" | "user_id" | "created_at">[] {
  const lines = csvText.split("\n");
  if (lines.length < 2) return [];

  // Parse header to find column indices
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) => h.trim().toLowerCase());

  const firstNameIdx = headers.findIndex((h) => h.includes("first name") || h === "first name");
  const lastNameIdx = headers.findIndex((h) => h.includes("last name") || h === "last name");
  const emailIdx = headers.findIndex((h) => h.includes("email") || h === "email address");
  const companyIdx = headers.findIndex((h) => h === "company" || h.includes("company"));
  const positionIdx = headers.findIndex((h) => h === "position" || h.includes("position"));
  const connectedOnIdx = headers.findIndex((h) => h.includes("connected on") || h === "connected on");

  const results: Omit<ConnectionRow, "id" | "user_id" | "created_at">[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const firstName = (firstNameIdx >= 0 ? cols[firstNameIdx]?.trim() : "") || "";
    const lastName = (lastNameIdx >= 0 ? cols[lastNameIdx]?.trim() : "") || "";

    if (!firstName && !lastName) continue;

    results.push({
      first_name: firstName,
      last_name: lastName,
      email: emailIdx >= 0 ? cols[emailIdx]?.trim() || null : null,
      company: companyIdx >= 0 ? cols[companyIdx]?.trim() || null : null,
      position: positionIdx >= 0 ? cols[positionIdx]?.trim() || null : null,
      connected_on: connectedOnIdx >= 0 ? cols[connectedOnIdx]?.trim() || null : null,
    });
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/* ─── Main Page ─── */
export default function ReferralsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("connections");

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || "XXXXXXXX";
  const referralLink = `https://michibiki.tech/signup?ref=${referralCode}`;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar activeItem="referrals" />
      <TopBar />

      <main className="ml-0 md:ml-[96px] pt-14">
        <div className="px-6 py-6 max-w-[1400px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">紹介</h1>
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
            <ConnectionsTab userId={user?.id} />
          ) : (
            <ReferralsTabContent userId={user?.id} referralLink={referralLink} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Connections Tab ─── */

function ConnectionsTab({ userId }: { userId: string | undefined }) {
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchConnections = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase.from("connections") as any)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setConnections(data);
      }
    } catch {
      // Table may not exist yet
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    setUploadError(null);

    try {
      const text = await file.text();
      const parsed = parseLinkedInCSV(text);

      if (parsed.length === 0) {
        setUploadError("CSVからコネクションを読み取れませんでした。LinkedIn形式のCSVか確認してください。");
        setUploading(false);
        return;
      }

      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < parsed.length; i += batchSize) {
        const batch = parsed.slice(i, i + batchSize).map((c) => ({
          ...c,
          user_id: userId,
        }));
        const { error } = await (supabase.from("connections") as any).insert(batch);
        if (error) {
          setUploadError(`アップロード中にエラーが発生しました: ${error.message}`);
          break;
        }
      }

      await fetchConnections();
    } catch {
      setUploadError("ファイルの読み取りに失敗しました。");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteConnection = async (id: string) => {
    const { error } = await (supabase.from("connections") as any)
      .delete()
      .eq("id", id);
    if (!error) {
      setConnections((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filteredConnections = connections.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.position && c.position.toLowerCase().includes(q))
    );
  });

  // Hidden file input
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv"
      className="hidden"
      onChange={handleFileUpload}
    />
  );

  // If still loading
  if (loading) {
    return (
      <>
        {fileInput}
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-sm text-gray-500">読み込み中...</p>
          </div>
        </div>
      </>
    );
  }

  // Empty state
  if (connections.length === 0) {
    return (
      <>
        {fileInput}
        {/* Help button */}
        <div className="flex justify-end mb-4">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors">
            <FiHelpCircle size={14} />
            ヘルプ
          </button>
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
            {uploadError}
            <button onClick={() => setUploadError(null)}>
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
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
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              <FiUploadCloud size={16} />
              {uploading ? "アップロード中..." : "コネクションをアップロード"}
            </button>
            <a
              href="https://www.linkedin.com/mypreferences/d/download-my-data"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#0A66C2]">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              コネクションを取得
            </a>
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

  // Connections list view
  return (
    <>
      {fileInput}

      {/* Top bar: count + upload + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{connections.length}</span> 件のコネクション
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg px-3 py-1.5 bg-indigo-50 transition-colors disabled:opacity-50"
          >
            <FiUploadCloud size={14} />
            {uploading ? "アップロード中..." : "追加アップロード"}
          </button>
        </div>
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="名前・会社・メールで検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 w-64 transition-all"
          />
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
          {uploadError}
          <button onClick={() => setUploadError(null)}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Connections table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">会社</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ポジション</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">メール</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">接続日</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredConnections.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {c.first_name} {c.last_name}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.company || "-"}</td>
                  <td className="px-5 py-3 text-gray-600">{c.position || "-"}</td>
                  <td className="px-5 py-3 text-gray-600">{c.email || "-"}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{c.connected_on || "-"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeleteConnection(c.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      title="削除"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredConnections.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            検索に一致するコネクションがありません
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Referrals Tab ─── */

function ReferralsTabContent({
  userId,
  referralLink,
}: {
  userId: string | undefined;
  referralLink: string;
}) {
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<ReferralStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const timeFilters: TimeFilter[] = ["1D", "3D", "7D", "ALL"];
  const statuses: ReferralStatus[] = [
    "signed_up",
    "application_started",
    "application_completed",
    "offer_extended",
    "hired",
    "paid",
  ];

  const fetchReferrals = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase.from("referrals") as any)
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReferrals(data);
      }
    } catch {
      // Table may not exist yet
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleShare = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Time-filtered referrals
  const getTimeFilteredReferrals = useCallback(() => {
    if (timeFilter === "ALL") return referrals;

    const now = new Date();
    const daysMap: Record<TimeFilter, number> = { "1D": 1, "3D": 3, "7D": 7, ALL: 0 };
    const cutoff = new Date(now.getTime() - daysMap[timeFilter] * 24 * 60 * 60 * 1000);

    return referrals.filter((r) => new Date(r.created_at) >= cutoff);
  }, [referrals, timeFilter]);

  const timeFilteredReferrals = getTimeFilteredReferrals();

  // Stats based on time-filtered data
  const stats: Record<ReferralStatus, number> = {
    signed_up: 0,
    application_started: 0,
    application_completed: 0,
    offer_extended: 0,
    hired: 0,
    paid: 0,
  };
  timeFilteredReferrals.forEach((r) => {
    const s = r.status as ReferralStatus;
    if (stats[s] !== undefined) stats[s]++;
  });

  // Apply status + search filters for the list
  const filteredReferrals = timeFilteredReferrals.filter((r) => {
    if (selectedStatus && r.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.referred_name.toLowerCase().includes(q) ||
        r.referred_email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Description + controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <p className="text-sm text-gray-500">
          紹介の進捗と報酬を追跡できます
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
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
            onClick={() =>
              setSelectedStatus((prev) => (prev === status ? null : status))
            }
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
        <button
          onClick={() => setSelectedStatus(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors"
        >
          <HiOutlineSparkles size={14} className="text-indigo-400" />
          {selectedStatus
            ? `ステータス：${STATUS_LABELS[selectedStatus]}`
            : "すべてのステータス"}
          {selectedStatus && <FiX size={12} className="ml-1" />}
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

      {/* Referral link card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <FiLink size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">あなたの紹介リンク</p>
            <p className="text-xs text-indigo-600 font-mono break-all">{referralLink}</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-500/20 flex-shrink-0"
        >
          <FiLink size={14} />
          {copied ? "コピー済み！" : "リンクをコピー"}
        </button>
      </div>

      {/* Referrals list or empty state */}
      {filteredReferrals.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">メール</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">報酬</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">紹介日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReferrals.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{r.referred_name}</td>
                    <td className="px-5 py-3 text-gray-600">{r.referred_email}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status as ReferralStatus} />
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {r.reward_amount > 0 ? `¥${r.reward_amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(r.created_at).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <FiUserPlus size={28} className="text-gray-300" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {referrals.length > 0 ? "該当する紹介がありません" : "まだ紹介がありません"}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {referrals.length > 0
              ? "フィルターを変更して再検索してください"
              : "あなたの紹介はすべてここに表示されます"}
          </p>
          {referrals.length === 0 && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-md shadow-indigo-500/20"
            >
              <FiLink size={14} />
              紹介リンクをシェア
            </button>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Status Badge ─── */

function StatusBadge({ status }: { status: ReferralStatus }) {
  const styles: Record<ReferralStatus, string> = {
    signed_up: "bg-blue-50 text-blue-700",
    application_started: "bg-yellow-50 text-yellow-700",
    application_completed: "bg-orange-50 text-orange-700",
    offer_extended: "bg-purple-50 text-purple-700",
    hired: "bg-green-50 text-green-700",
    paid: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

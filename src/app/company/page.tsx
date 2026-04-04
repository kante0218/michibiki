"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import type { Database } from "@/lib/database.types";

type Company = Database["public"]["Tables"]["companies"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];
type Offer = Database["public"]["Tables"]["offers"]["Row"];

interface CandidateWithProfile {
  id: string;
  job_id: string;
  user_id: string;
  status: Application["status"];
  motivation: string | null;
  created_at: string;
  profile: {
    full_name: string;
    title: string | null;
    location: string | null;
    avatar_url: string | null;
  } | null;
  jobTitle: string;
}

type SidebarItem = "dashboard" | "jobs" | "candidates" | "offers" | "analytics" | "settings";

const sidebarItems: { key: SidebarItem; label: string; icon: string }[] = [
  { key: "dashboard", label: "ダッシュボード", icon: "home" },
  { key: "jobs", label: "求人管理", icon: "briefcase" },
  { key: "candidates", label: "学生候補者", icon: "users" },
  { key: "offers", label: "オファー管理", icon: "mail" },
  { key: "analytics", label: "分析", icon: "chart" },
  { key: "settings", label: "設定", icon: "settings" },
];

function SidebarIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "home":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "briefcase":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "users":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "mail":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "chart":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "settings":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function JobStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "公開中": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    "下書き": "bg-gray-50 text-gray-500 ring-1 ring-gray-500/20",
    "募集終了": "bg-red-50 text-red-600 ring-1 ring-red-600/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${colors[status] || "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20"}`}
    >
      {status}
    </span>
  );
}

function ApplicationStatusBadge({ status }: { status: Application["status"] }) {
  const map: Record<Application["status"], { label: string; color: string }> = {
    submitted: { label: "応募済み", color: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20" },
    screening: { label: "選考中", color: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" },
    interview: { label: "面接", color: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20" },
    offered: { label: "オファー済み", color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" },
    rejected: { label: "不採用", color: "bg-red-50 text-red-600 ring-1 ring-red-600/20" },
    accepted: { label: "採用決定", color: "bg-green-50 text-green-700 ring-1 ring-green-600/20" },
  };
  const info = map[status] || { label: status, color: "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

// Offer modal component
function OfferModal({
  candidate,
  company,
  onClose,
  onSuccess,
}: {
  candidate: CandidateWithProfile;
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [offerForm, setOfferForm] = useState({
    role: candidate.jobTitle,
    rate: "",
    commitment: "",
    workStyle: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.role || !offerForm.rate) {
      setError("役職と報酬は必須です。");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error: insertError } = await (supabase.from("offers") as any).insert({
      job_id: candidate.job_id,
      worker_id: candidate.user_id,
      company_id: company.id,
      title: offerForm.role,
      company_name: company.name,
      rate: parseFloat(offerForm.rate),
      commitment: offerForm.commitment || null,
      work_style: offerForm.workStyle || null,
      message: offerForm.message || null,
      status: "pending",
    } as any);

    setSubmitting(false);
    if (insertError) {
      setError("オファーの送信に失敗しました: " + insertError.message);
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">オファーを送信しました</h3>
          <p className="text-sm text-gray-500">{candidate.profile?.full_name}さんへのオファーが正常に送信されました。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">オファーを送る</h3>
              <p className="text-sm text-gray-500 mt-0.5">{candidate.profile?.full_name}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">役職</label>
              <input
                type="text"
                value={offerForm.role}
                onChange={(e) => setOfferForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">報酬（時給）</label>
              <input
                type="number"
                value={offerForm.rate}
                onChange={(e) => setOfferForm((f) => ({ ...f, rate: e.target.value }))}
                placeholder="例: 8500"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">コミットメント</label>
              <input
                type="text"
                value={offerForm.commitment}
                onChange={(e) => setOfferForm((f) => ({ ...f, commitment: e.target.value }))}
                placeholder="例: 週40時間"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">勤務形態</label>
              <input
                type="text"
                value={offerForm.workStyle}
                onChange={(e) => setOfferForm((f) => ({ ...f, workStyle: e.target.value }))}
                placeholder="例: リモート"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">メッセージ</label>
              <textarea
                value={offerForm.message}
                onChange={(e) => setOfferForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="学生候補者へのメッセージを入力してください"
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium transition-all disabled:opacity-50 shadow-sm shadow-indigo-500/25"
            >
              {submitting ? "送信中..." : "オファーを送信"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Company profile creation form
function CreateCompanyForm({ userId, onCreated }: { userId: string; onCreated: (c: Company) => void }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    industry: "",
    size: "",
    contact_email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("会社名は必須です。");
      return;
    }
    setSubmitting(true);
    setError("");

    const { data, error: insertError } = await (supabase.from("companies") as any)
      .insert({
        user_id: userId,
        name: form.name.trim(),
        description: form.description || null,
        website: form.website || null,
        industry: form.industry || null,
        size: form.size || null,
        contact_email: form.contact_email || null,
      } as any)
      .select()
      .single() as { data: Company | null; error: any };

    setSubmitting(false);
    if (insertError) {
      setError("企業プロフィールの作成に失敗しました: " + insertError.message);
      return;
    }
    if (data) onCreated(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl max-w-lg w-full p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">企業プロフィールを作成</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6 ml-[52px]">ダッシュボードを使用するには、まず企業情報を登録してください。</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">会社名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">業種</label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                placeholder="例: IT・テクノロジー"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">会社規模</label>
              <select
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
              >
                <option value="">選択してください</option>
                <option value="1-10">1-10名</option>
                <option value="11-50">11-50名</option>
                <option value="51-200">51-200名</option>
                <option value="201-500">201-500名</option>
                <option value="501+">501名以上</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ウェブサイト</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">連絡先メール</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                placeholder="hr@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">会社概要</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium transition-all disabled:opacity-50 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
          >
            {submitting ? "作成中..." : "企業プロフィールを作成"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Status label mapper
function jobStatusLabel(status: Job["status"]): string {
  const map: Record<Job["status"], string> = {
    published: "公開中",
    draft: "下書き",
    closed: "募集終了",
  };
  return map[status] || status;
}

function employmentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    "フルタイム": "フルタイム",
    "パートタイム": "パートタイム",
    "業務委託": "業務委託",
  };
  return map[type] || type;
}

export default function CompanyDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<CandidateWithProfile[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyNotFound, setCompanyNotFound] = useState(false);

  const [activeSection, setActiveSection] = useState<SidebarItem>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offerCandidate, setOfferCandidate] = useState<CandidateWithProfile | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({ name: "", contact_email: "", description: "", website: "", industry: "", size: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  const fetchData = useCallback(async (companyRecord: Company) => {
    // Fetch jobs
    const { data: jobsData } = await (supabase.from("jobs") as any)
      .select("*")
      .eq("company_id", companyRecord.id)
      .order("created_at", { ascending: false }) as { data: Job[] | null };

    const fetchedJobs = jobsData || [];
    setJobs(fetchedJobs);

    // Fetch applications with profiles for this company's jobs
    if (fetchedJobs.length > 0) {
      const jobIds = fetchedJobs.map((j) => j.id);
      const { data: appsData } = await (supabase.from("applications") as any)
        .select("id, job_id, user_id, status, motivation, created_at")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false }) as { data: Pick<Application, "id" | "job_id" | "user_id" | "status" | "motivation" | "created_at">[] | null };

      if (appsData && appsData.length > 0) {
        // Fetch profiles for all applicant user_ids
        const userIds = [...new Set(appsData.map((a) => a.user_id))];
        const { data: profilesData } = await (supabase.from("profiles") as any)
          .select("id, full_name, title, location, avatar_url")
          .in("id", userIds) as { data: { id: string; full_name: string; title: string | null; location: string | null; avatar_url: string | null }[] | null };

        const profileMap = new Map(
          (profilesData || []).map((p) => [p.id, p])
        );
        const jobMap = new Map(fetchedJobs.map((j) => [j.id, j.title]));

        const candidatesWithProfiles: CandidateWithProfile[] = appsData.map((a) => ({
          id: a.id,
          job_id: a.job_id,
          user_id: a.user_id,
          status: a.status,
          motivation: a.motivation,
          created_at: a.created_at,
          profile: profileMap.get(a.user_id) || null,
          jobTitle: jobMap.get(a.job_id) || "不明",
        }));

        setCandidates(candidatesWithProfiles);
      } else {
        setCandidates([]);
      }
    } else {
      setCandidates([]);
    }

    // Fetch offers
    const { data: offersData } = await (supabase.from("offers") as any)
      .select("*")
      .eq("company_id", companyRecord.id)
      .order("created_at", { ascending: false }) as { data: Offer[] | null };
    setOffers(offersData || []);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) {
      router.push("/login");
      return;
    }
    if (profile.role !== "company") {
      router.push("/dashboard");
      return;
    }

    // Fetch company record
    (async () => {
      const { data: companyData } = await (supabase.from("companies") as any)
        .select("*")
        .eq("user_id", user.id)
        .single() as { data: Company | null };

      if (!companyData) {
        setCompanyNotFound(true);
        setLoading(false);
        return;
      }

      setCompany(companyData);
      setSettingsForm({
        name: companyData.name,
        contact_email: companyData.contact_email || "",
        description: companyData.description || "",
        website: companyData.website || "",
        industry: companyData.industry || "",
        size: companyData.size || "",
      });

      await fetchData(companyData);
      setLoading(false);
    })();
  }, [authLoading, user, profile, router, fetchData]);

  const handleSettingsSave = async () => {
    if (!company) return;
    if (!settingsForm.name.trim()) {
      setSettingsError("会社名は必須です。");
      return;
    }
    setSettingsSaving(true);
    setSettingsError("");

    const { error } = await (supabase
      .from("companies") as any)
      .update({
        name: settingsForm.name.trim(),
        contact_email: settingsForm.contact_email || null,
        description: settingsForm.description || null,
        website: settingsForm.website || null,
        industry: settingsForm.industry || null,
        size: settingsForm.size || null,
      })
      .eq("id", company.id);

    setSettingsSaving(false);
    if (error) {
      setSettingsError("保存に失敗しました: " + error.message);
      return;
    }
    setCompany((c) => c ? { ...c, name: settingsForm.name.trim(), contact_email: settingsForm.contact_email || null, description: settingsForm.description || null, website: settingsForm.website || null, industry: settingsForm.industry || null, size: settingsForm.size || null } : c);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Compute KPIs
  const activeJobsCount = jobs.filter((j) => j.status === "published").length;
  const totalApplicants = candidates.length;
  const offeredCount = offers.length;
  const hiredCount = jobs.reduce((sum, j) => sum + j.hired_count, 0);

  // Analytics pipeline
  const submittedCount = candidates.filter((c) => c.status === "submitted").length;
  const screeningCount = candidates.filter((c) => c.status === "screening").length;
  const interviewCount = candidates.filter((c) => c.status === "interview").length;
  const offeredAppCount = candidates.filter((c) => c.status === "offered").length;
  const acceptedCount = candidates.filter((c) => c.status === "accepted").length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== "company") {
    return null;
  }

  if (companyNotFound) {
    return (
      <CreateCompanyForm
        userId={user.id}
        onCreated={(c) => {
          setCompany(c);
          setCompanyNotFound(false);
          setSettingsForm({
            name: c.name,
            contact_email: c.contact_email || "",
            description: c.description || "",
            website: c.website || "",
            industry: c.industry || "",
            size: c.size || "",
          });
          setLoading(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Offer Modal */}
      {offerCandidate && company && (
        <OfferModal
          candidate={offerCandidate}
          company={company}
          onClose={() => setOfferCandidate(null)}
          onSuccess={() => {
            if (company) fetchData(company);
          }}
        />
      )}

      {/* Toast for settings save */}
      {settingsSaved && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fade-in border border-white/10">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium">設定を保存しました</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl fixed top-0 w-full z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a href="/" className="flex items-center gap-2.5 group">
              <Logo size="xs" />
              <span className="font-semibold text-gray-900 text-sm hidden sm:inline">Michibiki</span>
              <span className="text-xs text-gray-400 hidden sm:inline ml-0.5 bg-gray-100 px-2 py-0.5 rounded-md font-medium">企業管理</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/help"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all hidden sm:block font-medium"
            >
              ヘルプ
            </Link>
            <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-xs">{company?.name?.charAt(0) || "企"}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[53px]">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[53px] left-0 h-[calc(100vh-53px)] w-60 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 z-20 transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="p-3 space-y-0.5">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveSection(item.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.key
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <SidebarIcon icon={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {/* Dashboard View */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ダッシュボード</h1>
                <p className="text-sm text-gray-500 mt-1">採用活動の概要</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <p className="text-sm text-gray-500 font-medium mb-1">アクティブ求人数</p>
                  <p className="text-3xl font-bold text-gray-900">{activeJobsCount}</p>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
                  <p className="text-sm text-gray-500 font-medium mb-1">応募者数</p>
                  <p className="text-3xl font-bold text-gray-900">{totalApplicants}</p>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                  <p className="text-sm text-gray-500 font-medium mb-1">送信オファー数</p>
                  <p className="text-3xl font-bold text-gray-900">{offeredCount}</p>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-5 text-white shadow-lg shadow-indigo-500/25">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="relative">
                    <p className="text-sm text-indigo-100 font-medium mb-1">採用数</p>
                    <p className="text-3xl font-bold">{hiredCount}</p>
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">最近の応募</h2>
                {candidates.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">まだ応募はありません。</p>
                    <p className="text-xs text-gray-400 mt-1">求人を公開すると、応募者がここに表示されます。</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {candidates.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white font-semibold text-xs">{c.profile?.full_name?.charAt(0) || "?"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium">
                            {c.profile?.full_name || "不明"}が「{c.jobTitle}」に応募しました
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(c.created_at).toLocaleDateString("ja-JP")}
                          </p>
                        </div>
                        <ApplicationStatusBadge status={c.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jobs View */}
          {activeSection === "jobs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">求人管理</h1>
                  <p className="text-sm text-gray-500 mt-1">{jobs.length}件の求人</p>
                </div>
                <Link
                  href="/company/post"
                  className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新規求人を作成
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="bg-white border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">求人がありません</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">最初の求人を作成して、学生候補者を見つけましょう。</p>
                  <Link
                    href="/company/post"
                    className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 shadow-md shadow-indigo-500/25"
                  >
                    新規求人を作成
                  </Link>
                </div>
              ) : (
                <div className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">求人タイトル</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">雇用形態</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">ステータス</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">応募者数</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">作成日</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {jobs.map((job) => (
                        <React.Fragment key={job.id}>
                          <tr
                            className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-gray-900">{job.title}</p>
                            </td>
                            <td className="px-5 py-4 hidden sm:table-cell">
                              <p className="text-sm text-gray-600">{employmentTypeLabel(job.employment_type)}</p>
                            </td>
                            <td className="px-5 py-4">
                              <JobStatusBadge status={jobStatusLabel(job.status)} />
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <p className="text-sm text-gray-600 font-medium">{job.applicant_count}名</p>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <p className="text-sm text-gray-500">{new Date(job.created_at).toLocaleDateString("ja-JP")}</p>
                            </td>
                            <td className="px-5 py-4">
                              <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${expandedJobId === job.id ? "rotate-180" : ""}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </td>
                          </tr>
                          {expandedJobId === job.id && (
                            <tr key={`${job.id}-detail`}>
                              <td colSpan={6} className="px-5 py-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 border-t border-gray-100">
                                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
                                  <span>雇用形態: {employmentTypeLabel(job.employment_type)}</span>
                                  <span>勤務形態: {job.work_style}</span>
                                  <span>勤務地: {job.location}</span>
                                  <span>応募者数: {job.applicant_count}名</span>
                                  <span>報酬: ¥{job.min_rate.toLocaleString()} ~ ¥{job.max_rate.toLocaleString()}/時</span>
                                  <span>作成日: {new Date(job.created_at).toLocaleDateString("ja-JP")}</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Candidates View */}
          {activeSection === "candidates" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">学生候補者</h1>
                <p className="text-sm text-gray-500 mt-1">応募した学生候補者一覧</p>
              </div>

              {candidates.length === 0 ? (
                <div className="bg-white border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">学生候補者がいません</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">求人に応募があると、ここに学生候補者が表示されます。</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {candidates.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200/50 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                            <span className="text-white font-semibold">{c.profile?.full_name?.charAt(0) || "?"}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{c.profile?.full_name || "不明"}</h3>
                              <ApplicationStatusBadge status={c.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">応募先: {c.jobTitle}</p>
                            {c.profile?.title && (
                              <p className="text-sm text-gray-600 mt-0.5 font-medium">{c.profile.title}</p>
                            )}
                            {c.profile?.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                <p className="text-xs text-gray-500">{c.profile.location}</p>
                              </div>
                            )}
                            {c.motivation && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2 bg-gray-50 rounded-lg p-2 border border-gray-100">{c.motivation}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">応募日: {new Date(c.created_at).toLocaleDateString("ja-JP")}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                          <button
                            onClick={() => setOfferCandidate(c)}
                            className="text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-4 py-2 rounded-xl transition-all whitespace-nowrap shadow-sm shadow-indigo-500/25"
                          >
                            オファーを送る
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Offers View */}
          {activeSection === "offers" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">オファー管理</h1>
                <p className="text-sm text-gray-500 mt-1">送信済みオファーの管理</p>
              </div>
              {offers.length === 0 ? (
                <div className="bg-white border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">送信済みオファーはありません</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">学生候補者にオファーを送ると、ここに表示されます。</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5 font-medium">報酬: ¥{offer.rate.toLocaleString()}/時</p>
                          {offer.commitment && <p className="text-sm text-gray-500">{offer.commitment}</p>}
                          {offer.message && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2 border border-gray-100">{offer.message}</p>}
                          <p className="text-xs text-gray-400 mt-2">{new Date(offer.created_at).toLocaleDateString("ja-JP")}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          offer.status === "pending" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" :
                          offer.status === "accepted" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" :
                          offer.status === "declined" ? "bg-red-50 text-red-600 ring-1 ring-red-600/20" :
                          "bg-gray-50 text-gray-500 ring-1 ring-gray-500/20"
                        }`}>
                          {offer.status === "pending" ? "保留中" :
                           offer.status === "accepted" ? "承諾済み" :
                           offer.status === "declined" ? "辞退" :
                           "期限切れ"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics View */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">分析</h1>
                <p className="text-sm text-gray-500 mt-1">採用パフォーマンスの分析</p>
              </div>
              {totalApplicants === 0 ? (
                <div className="bg-white border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">データがありません</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">応募者データが蓄積されると、分析が表示されます。</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4">採用パイプライン</h3>
                    <div className="space-y-3">
                      {[
                        { label: "応募", count: totalApplicants, pct: 100, color: "from-indigo-500 to-indigo-600" },
                        { label: "選考中", count: screeningCount, pct: totalApplicants > 0 ? Math.round((screeningCount / totalApplicants) * 100) : 0, color: "from-blue-500 to-blue-600" },
                        { label: "面接", count: interviewCount, pct: totalApplicants > 0 ? Math.round((interviewCount / totalApplicants) * 100) : 0, color: "from-purple-500 to-purple-600" },
                        { label: "オファー", count: offeredAppCount, pct: totalApplicants > 0 ? Math.round((offeredAppCount / totalApplicants) * 100) : 0, color: "from-amber-500 to-amber-600" },
                        { label: "採用", count: acceptedCount, pct: totalApplicants > 0 ? Math.round((acceptedCount / totalApplicants) * 100) : 0, color: "from-emerald-500 to-emerald-600" },
                      ].map((step) => (
                        <div key={step.label} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-24 text-right font-medium">{step.label}</span>
                          <div className="flex-1 h-7 bg-gray-100 rounded-xl overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${step.color} rounded-xl transition-all duration-500`}
                              style={{ width: `${step.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-10">{step.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4">求人別応募数</h3>
                    {jobs.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">求人がありません</p>
                    ) : (
                      <div className="space-y-3">
                        {jobs.slice(0, 8).map((job) => (
                          <div key={job.id} className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 flex-1 truncate font-medium">{job.title}</span>
                            <div className="w-24 h-5 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg"
                                style={{
                                  width: `${Math.max(jobs[0]?.applicant_count || 1, 1) > 0 ? Math.round((job.applicant_count / Math.max(...jobs.map((j) => j.applicant_count), 1)) * 100) : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-8 text-right">{job.applicant_count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings View */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">設定</h1>
                <p className="text-sm text-gray-500 mt-1">企業アカウントの設定</p>
              </div>

              {settingsError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{settingsError}</div>
              )}

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">基本情報</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">会社名 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
                      <input
                        type="email"
                        value={settingsForm.contact_email}
                        onChange={(e) => setSettingsForm((f) => ({ ...f, contact_email: e.target.value }))}
                        className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">会社詳細</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">業種</label>
                        <input
                          type="text"
                          value={settingsForm.industry}
                          onChange={(e) => setSettingsForm((f) => ({ ...f, industry: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">会社規模</label>
                        <select
                          value={settingsForm.size}
                          onChange={(e) => setSettingsForm((f) => ({ ...f, size: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                        >
                          <option value="">選択してください</option>
                          <option value="1-10">1-10名</option>
                          <option value="11-50">11-50名</option>
                          <option value="51-200">51-200名</option>
                          <option value="201-500">201-500名</option>
                          <option value="501+">501名以上</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">ウェブサイト</label>
                      <input
                        type="url"
                        value={settingsForm.website}
                        onChange={(e) => setSettingsForm((f) => ({ ...f, website: e.target.value }))}
                        className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">会社概要</label>
                      <textarea
                        value={settingsForm.description}
                        onChange={(e) => setSettingsForm((f) => ({ ...f, description: e.target.value }))}
                        rows={3}
                        className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSettingsSave}
                  disabled={settingsSaving}
                  className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-indigo-500/25"
                >
                  {settingsSaving ? "保存中..." : "保存する"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

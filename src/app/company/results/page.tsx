"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import type { Database } from "@/lib/database.types";

type InterviewResult = Database["public"]["Tables"]["interview_results"]["Row"];

interface ResultWithDetails extends InterviewResult {
  candidateProfile: {
    full_name: string;
    avatar_url: string | null;
    location: string | null;
    title: string | null;
  } | null;
  jobTitle: string;
  jobPostingId: string;
}

interface JobOption {
  id: string;
  title: string;
}

// --- Animated Circular Progress ---
function CircularScore({
  label,
  value,
  size = 120,
  strokeWidth = 8,
  delay = 0,
}: {
  label: string;
  value: number | null;
  size?: number;
  strokeWidth?: number;
  delay?: number;
}) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const score = value ?? 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? { stroke: "#10b981", text: "text-emerald-500", glow: "rgba(16,185,129,0.3)" }
      : score >= 60
      ? { stroke: "#3b82f6", text: "text-blue-500", glow: "rgba(59,130,246,0.3)" }
      : score >= 40
      ? { stroke: "#f59e0b", text: "text-amber-500", glow: "rgba(245,158,11,0.3)" }
      : { stroke: "#9ca3af", text: "text-gray-400", glow: "rgba(156,163,175,0.2)" };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-gray-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            stroke={color.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: animated ? `drop-shadow(0 0 6px ${color.glow})` : "none",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color.text}`}>
            {value !== null ? score : "-"}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  );
}

// --- Mini circular for list cards ---
function MiniCircle({ value, size = 44 }: { value: number | null; size?: number }) {
  const score = value ?? 0;
  const sw = 4;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const col =
    score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#9ca3af";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} className="stroke-gray-100" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw}
          stroke={col} strokeDasharray={c} strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-gray-700">{value !== null ? score : "-"}</span>
      </div>
    </div>
  );
}

// --- Matching badge for list ---
function MatchingBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm">-</span>;

  const config =
    score >= 80
      ? { bg: "bg-gradient-to-r from-emerald-500 to-teal-400", text: "text-white" }
      : score >= 60
      ? { bg: "bg-gradient-to-r from-blue-500 to-indigo-400", text: "text-white" }
      : score >= 40
      ? { bg: "bg-gradient-to-r from-amber-400 to-yellow-300", text: "text-gray-800" }
      : { bg: "bg-gray-200", text: "text-gray-600" };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} shadow-sm`}>
      <span>{score}%</span>
      <span className="opacity-80">マッチ</span>
    </div>
  );
}

// --- Large matching display for detail ---
function MatchingDisplay({ score }: { score: number | null }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), 200);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (score === null)
    return (
      <div className="text-center py-6">
        <p className="text-gray-400 text-sm">スコアなし</p>
      </div>
    );

  const config =
    score >= 80
      ? { gradient: "from-emerald-500 to-teal-400", color: "text-emerald-500", label: "非常に高いマッチング", glow: "rgba(16,185,129,0.4)", stroke: "#10b981" }
      : score >= 60
      ? { gradient: "from-blue-500 to-indigo-400", color: "text-blue-500", label: "良いマッチング", glow: "rgba(59,130,246,0.4)", stroke: "#3b82f6" }
      : score >= 40
      ? { gradient: "from-amber-400 to-yellow-300", color: "text-amber-500", label: "普通のマッチング", glow: "rgba(245,158,11,0.3)", stroke: "#f59e0b" }
      : { gradient: "from-gray-400 to-gray-300", color: "text-gray-500", label: "マッチングが低い", glow: "rgba(156,163,175,0.2)", stroke: "#9ca3af" };

  const size = 160;
  const sw = 10;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;

  return (
    <div ref={ref} className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.3),transparent_70%)]" />
      <div className="relative">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} stroke="rgba(255,255,255,0.1)" />
            <circle
              cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw}
              stroke={config.stroke}
              strokeDasharray={c}
              strokeDashoffset={animated ? off : c}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                filter: animated ? `drop-shadow(0 0 10px ${config.glow})` : "none",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{score}</span>
            <span className="text-xs text-gray-400 mt-0.5">/ 100</span>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white text-sm font-semibold shadow-lg`}>
          {config.label}
        </div>
        <p className="text-xs text-gray-500 mt-3">マッチングスコア</p>
      </div>
    </div>
  );
}

// --- Stat Card ---
function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function CompanyResultsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [results, setResults] = useState<ResultWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ResultWithDetails | null>(null);
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchResults();
  }, [authLoading, user]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data: resultsData, error } = await (supabase
        .from("interview_results") as ReturnType<typeof supabase.from>)
        .select("*")
        .eq("company_id", user!.id)
        .order("matching_score", { ascending: false }) as { data: InterviewResult[] | null; error: unknown };

      if (error || !resultsData) {
        console.error("Failed to fetch results:", error);
        setResults([]);
        return;
      }

      const candidateIds = [...new Set(resultsData.map((r) => r.candidate_id))];
      const jobPostingIds = [...new Set(resultsData.map((r) => r.job_posting_id))];

      // Fetch profiles and jobs in parallel instead of sequentially
      const [{ data: profiles }, { data: jobsData }] = await Promise.all([
        (supabase.from("profiles") as ReturnType<typeof supabase.from>)
          .select("id, full_name, avatar_url, location, title")
          .in("id", candidateIds.length > 0 ? candidateIds : [""]) as Promise<{
            data: { id: string; full_name: string; avatar_url: string | null; location: string | null; title: string | null }[] | null;
          }>,
        (supabase.from("jobs") as ReturnType<typeof supabase.from>)
          .select("id, title")
          .in("id", jobPostingIds.length > 0 ? jobPostingIds : [""]) as Promise<{
            data: { id: string; title: string }[] | null;
          }>,
      ]);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      const jobMap = new Map(jobsData?.map((j) => [j.id, j.title]) || []);

      const opts: JobOption[] = [];
      jobPostingIds.forEach((jpId) => {
        const title = jobMap.get(jpId);
        if (title) opts.push({ id: jpId, title });
      });
      setJobOptions(opts);

      const combined: ResultWithDetails[] = resultsData.map((r) => ({
        ...r,
        candidateProfile: profileMap.get(r.candidate_id) || null,
        jobTitle: jobMap.get(r.job_posting_id) || "不明な求人",
        jobPostingId: r.job_posting_id,
      }));

      setResults(combined);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (jobFilter === "all") return results;
    return results.filter((r) => r.jobPostingId === jobFilter);
  }, [results, jobFilter]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/home">
              <Logo size="header" iconOnly showBrandName />
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-sm font-medium text-gray-700">面接結果</h1>
          </div>
          <Link
            href="/company"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedResult ? (
          /* ─── Detail view ─── */
          <div className="animate-in fade-in duration-300">
            <button
              onClick={() => setSelectedResult(null)}
              className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 flex items-center gap-1 group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              結果一覧に戻る
            </button>

            {/* Candidate header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-4">
                {selectedResult.candidateProfile?.avatar_url ? (
                  <img
                    src={selectedResult.candidateProfile.avatar_url}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                    {selectedResult.candidateProfile?.full_name?.charAt(0) || "?"}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedResult.candidateProfile?.full_name || "不明な候補者"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedResult.candidateProfile?.title || ""}
                    {selectedResult.candidateProfile?.location
                      ? ` · ${selectedResult.candidateProfile.location}`
                      : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedResult.jobTitle} · {formatDate(selectedResult.created_at)}
                  </p>
                </div>
                <MatchingBadge score={selectedResult.matching_score} />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left column: Scores */}
              <div className="lg:col-span-2 space-y-6">
                {/* Circular Score Dashboard */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-8 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    評価スコア
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                    <CircularScore label="総合" value={selectedResult.overall_score} size={100} delay={0} />
                    <CircularScore label="技術力" value={selectedResult.technical_score} size={100} delay={100} />
                    <CircularScore label="対話力" value={selectedResult.communication_score} size={100} delay={200} />
                    <CircularScore label="清潔感" value={selectedResult.appearance_score} size={100} delay={300} />
                    <CircularScore label="問題解決" value={selectedResult.problem_solving_score} size={100} delay={400} />
                    <CircularScore label="正答率" value={selectedResult.correct_rate} size={100} delay={500} />
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedResult.ai_analysis && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI分析
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedResult.ai_analysis}
                    </p>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      強み
                    </h3>
                    {selectedResult.strengths && selectedResult.strengths.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedResult.strengths.map((s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">データなし</p>
                    )}
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 4h.01" />
                        </svg>
                      </span>
                      改善点
                    </h3>
                    {selectedResult.weaknesses && selectedResult.weaknesses.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedResult.weaknesses.map((w, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">データなし</p>
                    )}
                  </div>
                </div>

                {/* Recommendation */}
                {selectedResult.recommendation && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      推薦コメント
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedResult.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Right column: Matching + actions */}
              <div className="space-y-6">
                <MatchingDisplay score={selectedResult.matching_score} />

                {/* Recording link */}
                <Link
                  href="/company/recordings"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  面接録画を見る
                </Link>

                {/* Quick stats */}
                <div className="space-y-3">
                  <StatCard
                    label="求人"
                    value={selectedResult.jobTitle}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="面接日"
                    value={formatDate(selectedResult.created_at)}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="送信状態"
                    value={selectedResult.sent_to_company ? "送信済み" : "未送信"}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── List view ─── */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">面接結果</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredResults.length}件の結果
                </p>
              </div>

              {/* Job filter */}
              {jobOptions.length > 1 && (
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                >
                  <option value="all">すべての求人</option>
                  {jobOptions.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
                </div>
                <p className="text-sm text-gray-500">読み込み中...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">面接結果はまだありません</p>
                <p className="text-gray-400 text-sm mt-1">
                  候補者が面接を完了すると、結果がここに表示されます。
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-5 text-left hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Candidate header */}
                    <div className="flex items-center gap-3 mb-4">
                      {result.candidateProfile?.avatar_url ? (
                        <img
                          src={result.candidateProfile.avatar_url}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                          {result.candidateProfile?.full_name?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {result.candidateProfile?.full_name || "不明な候補者"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{result.jobTitle}</p>
                      </div>
                    </div>

                    {/* Matching score badge */}
                    <div className="mb-4">
                      <MatchingBadge score={result.matching_score} />
                    </div>

                    {/* Mini circular scores */}
                    <div className="flex items-center justify-around mb-4 py-3 bg-gray-50/80 rounded-xl">
                      {[
                        { label: "総合", value: result.overall_score },
                        { label: "技術", value: result.technical_score },
                        { label: "対話", value: result.communication_score },
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center gap-1">
                          <MiniCircle value={s.value} />
                          <span className="text-[10px] text-gray-400">{s.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Date + action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">{formatDate(result.created_at)}</span>
                      <span className="text-xs text-indigo-500 font-medium group-hover:text-indigo-600 flex items-center gap-0.5">
                        詳細
                        <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

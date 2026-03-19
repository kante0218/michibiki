"use client";

import { useState, useEffect, useMemo } from "react";
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

// --- Score bar component ---
function ScoreBar({ label, value, max = 100 }: { label: string; value: number | null; max?: number }) {
  const score = value ?? 0;
  const pct = Math.min((score / max) * 100, 100);
  const color =
    pct >= 80 ? "from-emerald-400 to-emerald-500" :
    pct >= 60 ? "from-blue-400 to-blue-500" :
    pct >= 40 ? "from-yellow-400 to-yellow-500" :
    "from-gray-300 to-gray-400";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value !== null ? `${score}` : "-"}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// --- Matching badge ---
function MatchingBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm">-</span>;

  const config =
    score >= 80
      ? { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "非常に高いマッチング" }
      : score >= 60
      ? { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200", label: "良いマッチング" }
      : score >= 40
      ? { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-200", label: "普通のマッチング" }
      : { bg: "bg-gray-50", text: "text-gray-500", ring: "ring-gray-200", label: "マッチングが低い" };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ${config.bg} ${config.text} ${config.ring}`}>
      <span className="text-lg font-bold">{score}</span>
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}

// --- Large matching display for detail ---
function MatchingDisplay({ score }: { score: number | null }) {
  if (score === null)
    return (
      <div className="text-center py-6">
        <p className="text-gray-400 text-sm">スコアなし</p>
      </div>
    );

  const config =
    score >= 80
      ? { border: "border-emerald-200", bg: "bg-emerald-50", color: "text-emerald-600", label: "非常に高いマッチング", ringColor: "stroke-emerald-500" }
      : score >= 60
      ? { border: "border-blue-200", bg: "bg-blue-50", color: "text-blue-600", label: "良いマッチング", ringColor: "stroke-blue-500" }
      : score >= 40
      ? { border: "border-yellow-200", bg: "bg-yellow-50", color: "text-yellow-600", label: "普通のマッチング", ringColor: "stroke-yellow-500" }
      : { border: "border-gray-200", bg: "bg-gray-50", color: "text-gray-500", label: "マッチングが低い", ringColor: "stroke-gray-400" };

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-6 text-center`}>
      <div className="relative w-32 h-32 mx-auto mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-gray-200" />
          <circle
            cx="60" cy="60" r="54" fill="none" strokeWidth="8"
            className={config.ringColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${config.color}`}>{score}</span>
        </div>
      </div>
      <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
      <p className="text-xs text-gray-400 mt-1">マッチングスコア</p>
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
      // Fetch interview results for this company
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

      // Get unique candidate IDs and job_posting_ids
      const candidateIds = [...new Set(resultsData.map((r) => r.candidate_id))];
      const jobPostingIds = [...new Set(resultsData.map((r) => r.job_posting_id))];

      // Fetch candidate profiles
      const { data: profiles } = await (supabase
        .from("profiles") as ReturnType<typeof supabase.from>)
        .select("id, full_name, avatar_url, location, title")
        .in("id", candidateIds.length > 0 ? candidateIds : [""]) as {
          data: { id: string; full_name: string; avatar_url: string | null; location: string | null; title: string | null }[] | null;
        };

      // Fetch job titles from jobs table via production_interviews
      const { data: interviews } = await (supabase
        .from("production_interviews") as ReturnType<typeof supabase.from>)
        .select("id, job_posting_id")
        .in("job_posting_id", jobPostingIds.length > 0 ? jobPostingIds : [""]) as {
          data: { id: string; job_posting_id: string }[] | null;
        };

      // Fetch jobs to get titles - job_posting_id references the jobs table
      const { data: jobsData } = await (supabase
        .from("jobs") as ReturnType<typeof supabase.from>)
        .select("id, title")
        .in("id", jobPostingIds.length > 0 ? jobPostingIds : [""]) as {
          data: { id: string; title: string }[] | null;
        };

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      const jobMap = new Map(jobsData?.map((j) => [j.id, j.title]) || []);

      // Build job options for filter
      const opts: JobOption[] = [];
      jobPostingIds.forEach((jpId) => {
        const title = jobMap.get(jpId);
        if (title) opts.push({ id: jpId, title });
      });
      setJobOptions(opts);

      // Combine data
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
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
          <div>
            <button
              onClick={() => setSelectedResult(null)}
              className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 flex items-center gap-1"
            >
              ← 結果一覧に戻る
            </button>

            {/* Candidate header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-4">
                {selectedResult.candidateProfile?.avatar_url ? (
                  <img
                    src={selectedResult.candidateProfile.avatar_url}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                    {selectedResult.candidateProfile?.full_name?.charAt(0) || "?"}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedResult.candidateProfile?.full_name || "不明な候補者"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedResult.candidateProfile?.title || ""}
                    {selectedResult.candidateProfile?.location
                      ? ` / ${selectedResult.candidateProfile.location}`
                      : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedResult.jobTitle} - {formatDate(selectedResult.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left column: Scores */}
              <div className="lg:col-span-2 space-y-6">
                {/* Score dashboard */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-5">評価スコア</h3>
                  <div className="space-y-4">
                    <ScoreBar label="総合スコア" value={selectedResult.overall_score} />
                    <ScoreBar label="技術力" value={selectedResult.technical_score} />
                    <ScoreBar label="コミュニケーション" value={selectedResult.communication_score} />
                    <ScoreBar label="清潔感" value={selectedResult.appearance_score} />
                    <ScoreBar label="問題解決力" value={selectedResult.problem_solving_score} />
                    <ScoreBar label="正答率" value={selectedResult.correct_rate} />
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedResult.ai_analysis && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">AI分析</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedResult.ai_analysis}
                    </p>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">強み</h3>
                    {selectedResult.strengths && selectedResult.strengths.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedResult.strengths.map((s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">データなし</p>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">改善点</h3>
                    {selectedResult.weaknesses && selectedResult.weaknesses.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedResult.weaknesses.map((w, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200"
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
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">推薦コメント</h3>
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
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  面接録画を見る
                </Link>

                {/* Quick stats */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">概要</h4>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">求人</dt>
                      <dd className="text-gray-900 font-medium text-right max-w-[60%] truncate">{selectedResult.jobTitle}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">面接日</dt>
                      <dd className="text-gray-900">{formatDate(selectedResult.created_at)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">送信済み</dt>
                      <dd className="text-gray-900">
                        {selectedResult.sent_to_company ? (
                          <span className="text-emerald-600 font-medium">はい</span>
                        ) : (
                          <span className="text-gray-400">いいえ</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── List view ─── */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">面接結果一覧</h2>

              {/* Job filter */}
              {jobOptions.length > 1 && (
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-sm text-gray-500">読み込み中...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 text-sm">面接結果はまだありません</p>
                <p className="text-gray-400 text-xs mt-1">
                  候補者が面接を完了すると、結果がここに表示されます。
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-indigo-200 transition-all group"
                  >
                    {/* Candidate header */}
                    <div className="flex items-center gap-3 mb-4">
                      {result.candidateProfile?.avatar_url ? (
                        <img
                          src={result.candidateProfile.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {result.candidateProfile?.full_name?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {result.candidateProfile?.full_name || "不明な候補者"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{result.jobTitle}</p>
                      </div>
                    </div>

                    {/* Matching score badge */}
                    <div className="mb-3">
                      <MatchingBadge score={result.matching_score} />
                    </div>

                    {/* Mini scores */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "総合", value: result.overall_score },
                        { label: "技術", value: result.technical_score },
                        { label: "対話", value: result.communication_score },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <p className="text-xs text-gray-400">{s.label}</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {s.value !== null ? s.value : "-"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Date + action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">{formatDate(result.created_at)}</span>
                      <span className="text-xs text-indigo-600 font-medium group-hover:text-indigo-700">
                        詳細を見る →
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

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["t.kante@michibiki.tech"];

type Tab = "overview" | "production" | "practice" | "users";

interface InterviewRow {
  id: string;
  candidate_id: string;
  status: string;
  questions: unknown;
  answers: unknown;
  conversation_log: unknown;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  candidate_name?: string;
  candidate_email?: string;
  job_title?: string;
  category?: string;
}

interface AssessmentRow {
  id: string;
  user_id: string;
  category: string;
  title: string;
  score: number | null;
  max_score: number;
  status: string;
  completed_at: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface ResultRow {
  production_interview_id: string;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  appearance_score: number | null;
  correct_rate: number | null;
  overall_matching_score: number | null;
  ai_analysis: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendation: string | null;
  expert_analysis?: unknown;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  title: string | null;
  location: string | null;
  created_at: string;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("overview");
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [results, setResults] = useState<Map<string, ResultRow>>(new Map());
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<InterviewRow | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin access
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    async function checkAdmin() {
      const { data: profile } = await (supabase.from("profiles") as any)
        .select("email")
        .eq("id", user!.id)
        .single();
      if (profile && ADMIN_EMAILS.includes(profile.email as string)) {
        setIsAdmin(true);
      } else {
        router.push("/home");
      }
    }
    checkAdmin();
  }, [user, authLoading, router]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);

    // Fetch production interviews
    const { data: intData } = await (supabase.from("production_interviews") as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    // Fetch assessments (practice)
    const { data: assData } = await (supabase.from("assessments") as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    // Fetch interview results
    const { data: resData } = await (supabase.from("interview_results") as any)
      .select("*");

    // Fetch all profiles
    const { data: profilesData } = await (supabase.from("profiles") as any)
      .select("id, email, full_name, role, title, location, created_at")
      .order("created_at", { ascending: false });

    // Build profiles map
    const profileMap = new Map<string, ProfileRow>();
    (profilesData || []).forEach((p: ProfileRow) => profileMap.set(p.id, p));

    // Enrich interviews with candidate info
    const enrichedInterviews = (intData || []).map((i: Record<string, unknown>) => {
      const profile = profileMap.get(i.candidate_id as string);
      return {
        ...i,
        candidate_name: profile?.full_name || "不明",
        candidate_email: profile?.email || "",
      } as InterviewRow;
    });

    // Enrich assessments with user info
    const enrichedAssessments = (assData || []).map((a: Record<string, unknown>) => {
      const profile = profileMap.get(a.user_id as string);
      return {
        ...a,
        user_name: profile?.full_name || "不明",
        user_email: profile?.email || "",
      } as AssessmentRow;
    });

    // Build results map
    const resMap = new Map<string, ResultRow>();
    (resData || []).forEach((r: ResultRow) => resMap.set(r.production_interview_id, r));

    setInterviews(enrichedInterviews);
    setAssessments(enrichedAssessments);
    setResults(resMap);
    setUsers(profilesData || []);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Delete handlers
  const deleteInterview = async (id: string) => {
    if (!confirm("この面接データを削除しますか？この操作は取り消せません。")) return;
    await supabase.from("interview_results").delete().eq("production_interview_id", id);
    await supabase.from("production_interviews").delete().eq("id", id);
    setSelectedInterview(null);
    fetchData();
  };

  const deleteAssessment = async (id: string) => {
    if (!confirm("この評価データを削除しますか？")) return;
    await supabase.from("assessments").delete().eq("id", id);
    setSelectedAssessment(null);
    fetchData();
  };

  // CSV export
  const exportCSV = (type: "production" | "practice") => {
    let csv = "";
    if (type === "production") {
      csv = "ID,候補者,ステータス,カテゴリ,技術スコア,コミュニケーション,問題解決,適合度,作成日\n";
      interviews.forEach((i) => {
        const r = results.get(i.id);
        csv += `${i.id},${i.candidate_name},${i.status},${i.category || ""},${r?.technical_score ?? ""},${r?.communication_score ?? ""},${r?.problem_solving_score ?? ""},${r?.overall_matching_score ?? ""},${i.created_at}\n`;
      });
    } else {
      csv = "ID,ユーザー,カテゴリ,スコア,最大スコア,ステータス,完了日\n";
      assessments.forEach((a) => {
        csv += `${a.id},${a.user_name},${a.category},${a.score ?? ""},${a.max_score},${a.status},${a.completed_at || ""}\n`;
      });
    }
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `michibiki_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Stats
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter((i) => i.status === "completed" || i.status === "analyzed").length;
  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter((a) => a.status === "completed").length;
  const totalUsers = users.length;
  const workerUsers = users.filter((u) => u.role === "worker").length;
  const companyUsers = users.filter((u) => u.role === "company").length;

  // Category distribution
  const categoryCount = new Map<string, number>();
  assessments.forEach((a) => {
    categoryCount.set(a.category, (categoryCount.get(a.category) || 0) + 1);
  });
  const topCategories = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Daily interview counts (last 30 days)
  const dailyCounts = new Map<string, number>();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  [...interviews, ...assessments].forEach((item) => {
    const date = new Date(item.created_at);
    if (date >= thirtyDaysAgo) {
      const key = date.toISOString().slice(0, 10);
      dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
    }
  });

  // Filter functions
  const filteredInterviews = interviews.filter((i) => {
    const matchesSearch = !searchQuery || i.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) || i.candidate_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch = !searchQuery || a.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      analyzed: "bg-purple-100 text-purple-700",
      not_started: "bg-gray-100 text-gray-600",
    };
    const labels: Record<string, string> = {
      pending: "待機中", in_progress: "進行中", completed: "完了", analyzed: "分析済", not_started: "未開始",
    };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>{labels[status] || status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">管理者ダッシュボード</h1>
              <p className="text-xs text-gray-500">みちびき データ管理</p>
            </div>
          </div>
          <button onClick={() => router.push("/home")} className="text-sm text-gray-500 hover:text-gray-700">← ホームに戻る</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-full p-1 w-fit mb-6">
          {([
            { key: "overview" as Tab, label: "概要" },
            { key: "production" as Tab, label: `本番面接 (${totalInterviews})` },
            { key: "practice" as Tab, label: `練習 (${totalAssessments})` },
            { key: "users" as Tab, label: `ユーザー (${totalUsers})` },
          ]).map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setSelectedInterview(null); setSelectedAssessment(null); setSearchQuery(""); setStatusFilter("all"); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "本番面接", value: totalInterviews, sub: `${completedInterviews} 完了`, color: "indigo" },
                { label: "練習面接", value: totalAssessments, sub: `${completedAssessments} 完了`, color: "purple" },
                { label: "求職者", value: workerUsers, sub: "登録済み", color: "emerald" },
                { label: "企業", value: companyUsers, sub: "登録済み", color: "amber" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">面接カテゴリ分布（上位10）</h3>
              {topCategories.length === 0 ? (
                <p className="text-sm text-gray-400">データがありません</p>
              ) : (
                <div className="space-y-2">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-40 truncate">{cat}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / (topCategories[0]?.[1] || 1)) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">過去30日の面接数</h3>
              {dailyCounts.size === 0 ? (
                <p className="text-sm text-gray-400">データがありません</p>
              ) : (
                <div className="flex items-end gap-1 h-32">
                  {Array.from({ length: 30 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - 29 + i);
                    const key = d.toISOString().slice(0, 10);
                    const count = dailyCounts.get(key) || 0;
                    const maxCount = Math.max(...dailyCounts.values(), 1);
                    return (
                      <div key={key} className="flex-1 flex flex-col items-center justify-end group" title={`${key}: ${count}件`}>
                        <div className="w-full bg-indigo-500 rounded-t-sm min-h-[2px] transition-all group-hover:bg-indigo-600"
                          style={{ height: `${(count / maxCount) * 100}%` }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Production Interviews Tab ── */}
        {tab === "production" && !selectedInterview && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input type="text" placeholder="候補者名・メールで検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
                <option value="all">全ステータス</option>
                <option value="pending">待機中</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
                <option value="analyzed">分析済</option>
              </select>
              <button onClick={() => exportCSV("production")} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
                CSVエクスポート
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">候補者</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">ステータス</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">スコア</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">日時</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">読み込み中...</td></tr>
                  ) : filteredInterviews.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">データがありません</td></tr>
                  ) : filteredInterviews.map((i) => {
                    const r = results.get(i.id);
                    return (
                      <tr key={i.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedInterview(i)}>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{i.candidate_name}</p>
                          <p className="text-xs text-gray-400">{i.candidate_email}</p>
                        </td>
                        <td className="py-3 px-4">{statusBadge(i.status)}</td>
                        <td className="py-3 px-4">
                          {r ? <span className="font-semibold text-indigo-600">{r.overall_matching_score ?? "—"}%</span> : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-500">{new Date(i.created_at).toLocaleDateString("ja-JP")}</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); deleteInterview(i.id); }}
                            className="text-xs text-red-500 hover:text-red-700">削除</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Interview Detail ── */}
        {tab === "production" && selectedInterview && (
          <div>
            <button onClick={() => setSelectedInterview(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              一覧に戻る
            </button>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedInterview.candidate_name}</h2>
                    <p className="text-sm text-gray-500">{selectedInterview.candidate_email}</p>
                  </div>
                  {statusBadge(selectedInterview.status)}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">カテゴリ:</span> <span className="font-medium">{selectedInterview.category || "—"}</span></div>
                  <div><span className="text-gray-500">開始:</span> <span className="font-medium">{selectedInterview.started_at ? new Date(selectedInterview.started_at).toLocaleString("ja-JP") : "—"}</span></div>
                  <div><span className="text-gray-500">完了:</span> <span className="font-medium">{selectedInterview.completed_at ? new Date(selectedInterview.completed_at).toLocaleString("ja-JP") : "—"}</span></div>
                </div>
              </div>

              {/* Results */}
              {results.get(selectedInterview.id) && (() => {
                const r = results.get(selectedInterview.id)!;
                return (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">AI分析結果</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      {[
                        { label: "技術", score: r.technical_score },
                        { label: "コミュニケーション", score: r.communication_score },
                        { label: "問題解決", score: r.problem_solving_score },
                        { label: "印象", score: r.appearance_score },
                        { label: "適合度", score: r.overall_matching_score },
                      ].map((s) => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                          <p className="text-xl font-bold text-gray-900">{s.score ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                    {r.ai_analysis && <div className="bg-gray-50 rounded-xl p-4 mb-3"><p className="text-sm text-gray-700 leading-relaxed">{r.ai_analysis}</p></div>}
                    {r.strengths && <div className="mb-2"><span className="text-xs font-semibold text-green-600">強み:</span> <span className="text-sm text-gray-600">{r.strengths.join("、")}</span></div>}
                    {r.weaknesses && <div className="mb-2"><span className="text-xs font-semibold text-red-500">改善点:</span> <span className="text-sm text-gray-600">{r.weaknesses.join("、")}</span></div>}
                    {r.recommendation && <div><span className="text-xs font-semibold text-indigo-600">推奨:</span> <span className="text-sm text-gray-600">{r.recommendation}</span></div>}
                    {!!r.expert_analysis && (
                      <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                        <h4 className="text-xs font-bold text-indigo-700 mb-2">エキスパートCoT分析</h4>
                        <pre className="text-xs text-indigo-900 whitespace-pre-wrap overflow-auto max-h-60">{JSON.stringify(r.expert_analysis, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Questions & Answers */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">質問と回答</h3>
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 overflow-auto max-h-96 whitespace-pre-wrap">
                  {JSON.stringify({ questions: selectedInterview.questions, answers: selectedInterview.answers }, null, 2)}
                </pre>
              </div>

              {/* Conversation Log */}
              {!!selectedInterview.conversation_log && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">会話ログ</h3>
                  <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 overflow-auto max-h-96 whitespace-pre-wrap">
                    {JSON.stringify(selectedInterview.conversation_log, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Practice Tab ── */}
        {tab === "practice" && !selectedAssessment && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input type="text" placeholder="ユーザー名・カテゴリで検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
                <option value="all">全ステータス</option>
                <option value="not_started">未開始</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
              </select>
              <button onClick={() => exportCSV("practice")} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
                CSVエクスポート
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">ユーザー</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">カテゴリ</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">スコア</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">ステータス</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">日時</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">読み込み中...</td></tr>
                  ) : filteredAssessments.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">データがありません</td></tr>
                  ) : filteredAssessments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAssessment(a)}>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{a.user_name}</p>
                        <p className="text-xs text-gray-400">{a.user_email}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{a.category}</td>
                      <td className="py-3 px-4">
                        {a.score !== null ? <span className="font-semibold">{a.score}/{a.max_score}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-3 px-4">{statusBadge(a.status)}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(a.created_at).toLocaleDateString("ja-JP")}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={(e) => { e.stopPropagation(); deleteAssessment(a.id); }}
                          className="text-xs text-red-500 hover:text-red-700">削除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Assessment Detail ── */}
        {tab === "practice" && selectedAssessment && (
          <div>
            <button onClick={() => setSelectedAssessment(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              一覧に戻る
            </button>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedAssessment.user_name}</h2>
              <p className="text-sm text-gray-500 mb-4">{selectedAssessment.user_email}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">カテゴリ</p><p className="font-semibold">{selectedAssessment.category}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">スコア</p><p className="font-semibold">{selectedAssessment.score ?? "—"} / {selectedAssessment.max_score}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">ステータス</p>{statusBadge(selectedAssessment.status)}</div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">完了日</p><p className="font-semibold text-sm">{selectedAssessment.completed_at ? new Date(selectedAssessment.completed_at).toLocaleString("ja-JP") : "—"}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* ── Users Tab ── */}
        {tab === "users" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input type="text" placeholder="名前・メールで検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">名前</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">メール</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">ロール</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">肩書</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">登録日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.filter((u) => !searchQuery || u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{u.full_name || "—"}</td>
                      <td className="py-3 px-4 text-gray-500">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === "company" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                          {u.role === "company" ? "企業" : "求職者"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{u.title || "—"}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(u.created_at).toLocaleDateString("ja-JP")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

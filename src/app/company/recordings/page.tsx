"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import InterviewPlayer from "@/components/InterviewPlayer";
import Logo from "@/components/Logo";
import Link from "next/link";

interface Recording {
  id: string;
  user_id: string;
  assessment_id: string | null;
  category: string | null;
  storage_path: string;
  duration_seconds: number;
  speech_segments: { start: number; end: number }[];
  file_size_bytes: number | null;
  mime_type: string;
  status: string;
  created_at: string;
  // Joined profile data
  profile?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

const categoryNames: Record<string, string> = {
  software_engineering: "ソフトウェアエンジニアリング",
  data_science: "データサイエンス",
  product_management: "プロダクトマネジメント",
  design: "デザイン",
  marketing: "マーケティング",
  sales: "セールス",
  general: "一般",
};

export default function RecordingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchRecordings();
  }, [authLoading, user]);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      // For company users: fetch recordings of candidates who applied
      // For workers: fetch their own recordings
      const isCompany = profile?.role === "company";

      let query;
      if (isCompany) {
        // Get recordings for all candidates (RLS handles authorization)
        const { data } = await (supabase.from("interview_recordings") as ReturnType<typeof supabase.from>)
          .select("*")
          .eq("status", "ready")
          .order("created_at", { ascending: false }) as { data: Recording[] | null };

        if (data) {
          // Fetch profile info for each unique user
          const userIds = [...new Set(data.map((r: Recording) => r.user_id))];
          const { data: profiles } = await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
            .select("id, full_name, email, avatar_url")
            .in("id", userIds) as { data: { id: string; full_name: string; email: string; avatar_url: string | null }[] | null };

          const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
          setRecordings(data.map((r: Recording) => ({
            ...r,
            profile: profileMap.get(r.user_id) || undefined,
          })));
        }
      } else {
        // Worker: own recordings
        const { data } = await (supabase.from("interview_recordings") as ReturnType<typeof supabase.from>)
          .select("*")
          .eq("user_id", user!.id)
          .eq("status", "ready")
          .order("created_at", { ascending: false }) as { data: Recording[] | null };

        setRecordings(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch recordings:", err);
    } finally {
      setLoading(false);
    }
  };

  const openRecording = async (recording: Recording) => {
    setSelectedRecording(recording);
    // Get signed URL for video
    const { data } = await supabase.storage
      .from("interview-recordings")
      .createSignedUrl(recording.storage_path, 3600); // 1 hour

    if (data?.signedUrl) {
      setVideoUrl(data.signedUrl);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}分${s}秒`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

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
            <h1 className="text-sm font-medium text-gray-700">面接録画</h1>
          </div>
          <Link
            href={profile?.role === "company" ? "/company" : "/home"}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 戻る
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedRecording && videoUrl ? (
          /* Player view */
          <div>
            <button
              onClick={() => { setSelectedRecording(null); setVideoUrl(null); }}
              className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-1"
            >
              ← 録画一覧に戻る
            </button>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InterviewPlayer
                  videoUrl={videoUrl}
                  segments={selectedRecording.speech_segments || []}
                  duration={selectedRecording.duration_seconds}
                  candidateName={selectedRecording.profile?.full_name}
                />
              </div>
              <div className="space-y-4">
                {/* Recording info */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-medium text-gray-900 mb-3">録画情報</h3>
                  <dl className="space-y-2.5 text-sm">
                    {selectedRecording.profile && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">候補者</dt>
                        <dd className="text-gray-900 font-medium">{selectedRecording.profile.full_name}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-500">カテゴリ</dt>
                      <dd className="text-gray-900">{categoryNames[selectedRecording.category || ""] || selectedRecording.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">面接時間</dt>
                      <dd className="text-gray-900">{formatDuration(selectedRecording.duration_seconds)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">発話セグメント</dt>
                      <dd className="text-gray-900">{selectedRecording.speech_segments?.length || 0}件</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">発話時間</dt>
                      <dd className="text-gray-900">
                        {formatDuration(
                          Math.round(
                            (selectedRecording.speech_segments || []).reduce(
                              (sum: number, s: { start: number; end: number }) => sum + (s.end - s.start), 0
                            )
                          )
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">ファイルサイズ</dt>
                      <dd className="text-gray-900">{formatFileSize(selectedRecording.file_size_bytes)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">日時</dt>
                      <dd className="text-gray-900">{formatDate(selectedRecording.created_at)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Quick tip */}
                <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    💡 「発話のみ再生」ボタンで候補者が話している部分だけを確認できます。
                    タイムラインの青い部分が発話区間です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List view */
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {profile?.role === "company" ? "候補者の面接録画" : "面接録画一覧"}
            </h2>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-sm text-gray-500">読み込み中...</p>
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm">録画はまだありません</p>
                <p className="text-gray-400 text-xs mt-1">面接を完了すると、録画が自動的に保存されます。</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recordings.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => openRecording(rec)}
                    className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        {rec.profile ? (
                          <p className="text-sm font-medium text-gray-900 truncate">{rec.profile.full_name}</p>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">面接録画</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {categoryNames[rec.category || ""] || rec.category || "一般"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatDuration(rec.duration_seconds)}</span>
                      <span>{rec.speech_segments?.length || 0} セグメント</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                      <span>{formatFileSize(rec.file_size_bytes)}</span>
                      <span>{formatDate(rec.created_at)}</span>
                    </div>
                    <div className="mt-3 text-xs text-indigo-600 font-medium group-hover:text-indigo-700">
                      録画を見る →
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

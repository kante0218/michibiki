"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/lib/types";

type JobDetailProps = {
  job: Job;
  onClose: () => void;
};

/* ─── Application Flow Modal ─── */
function ApplyModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [availability, setAvailability] = useState("");
  const [expectedRate, setExpectedRate] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOneClick = !job.requirements;
  const totalSteps = isOneClick ? 1 : 3;

  const handleResumeUpload = async (file: File) => {
    if (!user) return;
    setResumeFile(file);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file);

    if (uploadError) {
      setError("履歴書のアップロードに失敗しました: " + uploadError.message);
      setResumeFile(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(data.path);

    setResumeUrl(urlData.publicUrl);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await (supabase.from("applications") as any)
        .insert({
          job_id: job.id,
          user_id: user.id,
          status: "submitted",
          motivation: coverLetter || null,
          desired_rate: expectedRate ? parseFloat(expectedRate.replace(/,/g, "")) : null,
          start_date: availability || null,
          resume_url: resumeUrl,
        });

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "応募の送信に失敗しました";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">応募が完了しました！</h2>
          <p className="text-sm text-gray-500 mb-2">{job.title}</p>
          {job.companies?.name && (
            <p className="text-sm text-gray-400 mb-6">{job.companies.name}</p>
          )}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">次のステップ</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                企業があなたのプロフィールを確認します（通常1〜3営業日）
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                マッチした場合、面接の案内が届きます
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                進捗はダッシュボードで確認できます
              </li>
            </ul>
          </div>
          <div className="flex gap-3">
            <a href="/dashboard" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors text-center">
              ダッシュボードへ
            </a>
            <button onClick={onClose} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors">
              求人に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isOneClick ? "応募確認" : "応募フォーム"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{job.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        {totalSteps > 1 && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">ステップ {step} / {totalSteps}</span>
              <span className="text-xs text-indigo-600 font-medium">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ─── One-Click Apply ─── */}
          {isOneClick && step === 1 && (
            <div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-indigo-900">1クリック応募</span>
                </div>
                <p className="text-xs text-indigo-700">
                  プロフィール情報がそのまま送信されます。追加の入力は不要です。
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 mb-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">送信される情報</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <span className="text-indigo-600 font-medium text-sm">
                          {profile?.full_name?.charAt(0) ?? "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{profile?.full_name ?? "---"}</p>
                      <p className="text-xs text-gray-500">{profile?.email ?? "---"}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-2.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      プロフィール情報
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      スキル・職務経歴
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-500">
                  <a href="/terms" className="text-indigo-600 underline">利用規約</a>および
                  <a href="/privacy" className="text-indigo-600 underline">プライバシーポリシー</a>に同意します
                </span>
              </label>

              <button
                onClick={handleSubmit}
                disabled={!agreedTerms || submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    送信中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    応募を送信する
                  </>
                )}
              </button>
            </div>
          )}

          {/* ─── Multi-step Apply: Step 1 — Cover letter & availability ─── */}
          {!isOneClick && step === 1 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">志望動機・自己PR</h3>
              <p className="text-xs text-gray-500 mb-3">この求人に応募する理由やアピールポイントを記入してください</p>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="例：React/TypeScriptでの5年間の開発経験を活かし、貴社のSaaSプラットフォーム開発に貢献したいと考えています..."
                className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-4"
              />

              <h3 className="text-sm font-semibold text-gray-900 mb-1">稼働開始可能日</h3>
              <p className="text-xs text-gray-500 mb-3">いつから稼働できますか？</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {["即日", "1週間以内", "2週間以内", "1ヶ月以内"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAvailability(opt)}
                    className={`py-2.5 px-3 rounded-lg text-sm border transition-colors ${
                      availability === opt
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!coverLetter.trim() || !availability}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-medium transition-colors"
              >
                次へ
              </button>
            </div>
          )}

          {/* ─── Multi-step Apply: Step 2 — Rate & Resume ─── */}
          {!isOneClick && step === 2 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">希望報酬</h3>
              <p className="text-xs text-gray-500 mb-3">
                この求人の報酬レンジ: ¥{job.min_rate.toLocaleString()} - ¥{job.max_rate.toLocaleString()}/時
              </p>
              <div className="relative mb-5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">¥</span>
                <input
                  type="text"
                  value={expectedRate}
                  onChange={(e) => setExpectedRate(e.target.value)}
                  placeholder="例: 9,000"
                  className="w-full h-10 pl-8 pr-16 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/時</span>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 mb-1">履歴書・職務経歴書</h3>
              <p className="text-xs text-gray-500 mb-3">PDF形式でアップロードしてください</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleResumeUpload(file);
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-5 ${
                  resumeFile
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                }`}
              >
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-emerald-700">{resumeFile.name}</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">クリックしてファイルを選択</p>
                    <p className="text-xs text-gray-400">PDF, DOC, DOCX（最大10MB）</p>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!expectedRate.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  次へ
                </button>
              </div>
            </div>
          )}

          {/* ─── Multi-step Apply: Step 3 — Confirm & Submit ─── */}
          {!isOneClick && step === 3 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">応募内容の確認</h3>

              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 mb-5">
                <div className="p-3.5">
                  <p className="text-xs text-gray-500 mb-1">志望動機・自己PR</p>
                  <p className="text-sm text-gray-900 line-clamp-3">{coverLetter}</p>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">稼働開始可能日</p>
                    <p className="text-sm text-gray-900">{availability}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">編集</button>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">希望報酬</p>
                    <p className="text-sm text-gray-900">¥{expectedRate}/時</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">編集</button>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">履歴書</p>
                    <p className="text-sm text-gray-900">{resumeFile ? resumeFile.name : "未アップロード"}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">編集</button>
                </div>
              </div>

              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-500">
                  <a href="/terms" className="text-indigo-600 underline">利用規約</a>および
                  <a href="/privacy" className="text-indigo-600 underline">プライバシーポリシー</a>に同意します
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!agreedTerms || submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      送信中...
                    </>
                  ) : (
                    "応募を送信する"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Job Detail Panel ─── */
export default function JobDetail({ job, onClose }: JobDetailProps) {
  const { user } = useAuth();
  const [showApply, setShowApply] = useState(false);
  const [saved, setSaved] = useState(false);

  const companyName = job.companies?.name ?? null;
  const rateDisplay = `¥${job.min_rate.toLocaleString()} - ¥${job.max_rate.toLocaleString()}/時`;
  const postedDate = new Date(job.created_at).toLocaleDateString("ja-JP");

  const requirementsList = job.requirements
    ? job.requirements.split("\n").filter((r) => r.trim())
    : [];

  const handleApplyClick = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setShowApply(true);
  };

  const handleSave = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (saved) {
      await (supabase.from("saved_jobs") as any)
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", job.id);
      setSaved(false);
    } else {
      await (supabase.from("saved_jobs") as any)
        .insert({ user_id: user.id, job_id: job.id });
      setSaved(true);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg h-full bg-white overflow-y-auto shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {job.title}
            </h2>
            {companyName ? (
              <p className="text-sm text-gray-500">{companyName}</p>
            ) : (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                タレントネットワーク
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors ml-3 flex-shrink-0"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {/* Key info */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">報酬</p>
              <p className="text-sm font-medium text-gray-900">{rateDisplay}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">雇用形態</p>
              <p className="text-sm font-medium text-gray-900">{job.employment_type}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">勤務地</p>
              <p className="text-sm font-medium text-gray-900">{job.location}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">勤務形態</p>
              <p className="text-sm font-medium text-gray-900">{job.work_style}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">仕事内容</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Requirements */}
          {requirementsList.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">必須スキル・経験</h3>
              <ul className="space-y-1.5">
                {requirementsList.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preferred */}
          {job.preferred && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">歓迎スキル</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.preferred}</p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">福利厚生</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.benefits}</p>
            </div>
          )}

          {/* Category tag */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">カテゴリ</h3>
            <span className="px-2.5 py-1 rounded-md bg-gray-50 text-sm text-gray-600 border border-gray-100">
              {job.category}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-8">
            <span>投稿 {postedDate}</span>
            <span>{job.applicant_count}人が応募中</span>
            <span>紹介報酬 ¥{job.referral_amount.toLocaleString()}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {user ? (
              <button
                onClick={handleApplyClick}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {!job.requirements ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    1クリックで応募
                  </>
                ) : (
                  "応募する"
                )}
              </button>
            ) : (
              <a
                href="/login"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md text-sm font-medium transition-colors text-center"
              >
                ログインして応募
              </a>
            )}
            <button
              onClick={handleSave}
              className={`px-4 py-2.5 border rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                saved
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {saved ? "保存済み" : "保存"}
            </button>
          </div>

          {/* Referral section */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.7 10.7 6.6-3.4M8.7 13.3l6.6 3.4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
              <h4 className="text-sm font-semibold text-indigo-900">友達を紹介して報酬GET</h4>
            </div>
            <p className="text-xs text-indigo-700 mb-3">
              この求人に合いそうな人を紹介すると、採用時に<span className="font-bold">¥{job.referral_amount.toLocaleString()}</span>の紹介報酬がもらえます。
            </p>
            <button
              onClick={async () => {
                if (!user) {
                  window.location.href = "/login";
                  return;
                }
                const link = `${window.location.origin}/ref/${user.id}?job=${job.id}`;
                try {
                  await navigator.clipboard.writeText(link);
                } catch {
                  // fallback
                }
              }}
              className="w-full text-sm font-medium text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-100 py-2 rounded-md transition-colors"
            >
              紹介リンクをコピー
            </button>
          </div>

          {/* Company info */}
          {companyName && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">企業情報</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {job.companies?.logo_url ? (
                    <img src={job.companies.logo_url} alt={companyName} className="w-10 h-10 object-cover" />
                  ) : (
                    <span className="text-gray-500 font-bold text-sm">{companyName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{companyName}</p>
                </div>
              </div>
            </div>
          )}

          {/* About this job */}
          <div className="mt-6 border-t border-gray-100 pt-6 pb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">この求人について</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>投稿 {postedDate}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{job.applicant_count}人が応募中</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Michibiki安全保証付き</span>
              </div>
            </div>
          </div>

          {/* Report link */}
          <div className="border-t border-gray-100 pt-4 pb-6">
            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              この求人を報告する
            </button>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <ApplyModal job={job} onClose={() => setShowApply(false)} />
      )}
    </div>
  );
}

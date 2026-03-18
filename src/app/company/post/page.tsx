"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import type { Database } from "@/lib/database.types";

type Company = Database["public"]["Tables"]["companies"]["Row"];

const categoryOptions = [
  "ソフトウェアエンジニアリング",
  "AI・機械学習",
  "データサイエンス",
  "フロントエンド開発",
  "バックエンド開発",
  "モバイル開発",
  "DevOps・インフラ",
  "プロダクトマネジメント",
  "UI/UXデザイン",
  "QA・テスト",
  "セキュリティ",
  "ブロックチェーン",
];

const locationOptions = [
  "東京",
  "大阪",
  "名古屋",
  "福岡",
  "札幌",
  "仙台",
  "横浜",
  "京都",
  "神戸",
  "日本全国",
  "グローバル",
];

const experienceOptions = [
  "未経験可",
  "1年以上",
  "2年以上",
  "3年以上",
  "5年以上",
  "7年以上",
  "10年以上",
];

export default function JobPostPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    skills: [] as string[],
    rateMin: "",
    rateMax: "",
    employmentType: "業務委託",
    workStyle: "リモート",
    location: "",
    experience: "",
    aiRecommend: true,
  });
  const [skillInput, setSkillInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedTitle, setPublishedTitle] = useState("");
  const [savedDraft, setSavedDraft] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    (async () => {
      const { data: companyData } = await (supabase.from("companies") as any)
        .select("*")
        .eq("user_id", user.id)
        .single() as { data: Company | null };

      if (!companyData) {
        router.push("/company");
        return;
      }
      setCompany(companyData);
      setLoadingCompany(false);
    })();
  }, [authLoading, user, profile, router]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "職種名は必須です";
    if (!form.category) errors.category = "カテゴリーは必須です";
    if (!form.description.trim()) errors.description = "仕事内容は必須です";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const insertJob = async (status: "published" | "draft") => {
    if (!company) return null;

    const { data, error: insertError } = await (supabase.from("jobs") as any)
      .insert({
        company_id: company.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location || "未指定",
        work_style: form.workStyle,
        employment_type: form.employmentType,
        commitment: form.experience || null,
        min_rate: form.rateMin ? parseFloat(form.rateMin) : 0,
        max_rate: form.rateMax ? parseFloat(form.rateMax) : 0,
        requirements: form.skills.length > 0 ? form.skills.join(", ") : null,
        status,
      } as any)
      .select()
      .single() as { data: { id: string; title: string } | null; error: any };

    if (insertError) {
      setError("求人の保存に失敗しました: " + insertError.message);
      return null;
    }
    return data;
  };

  const handlePublish = () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    setShowConfirmModal(false);
    setPublishing(true);
    setError("");

    const data = await insertJob("published");
    setPublishing(false);

    if (data) {
      setPublishedTitle(data.title);
      setPublished(true);
    }
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      setValidationErrors({ title: "下書き保存にも職種名は必須です" });
      return;
    }
    setSavingDraft(true);
    setError("");

    const data = await insertJob("draft");
    setSavingDraft(false);

    if (data) {
      setSavedDraft(true);
      setTimeout(() => setSavedDraft(false), 3000);
    }
  };

  if (authLoading || loadingCompany) {
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

  // Published success screen
  if (published) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col">
        <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo size="xs" />
              <span className="font-semibold text-gray-900 text-sm hidden sm:inline">Michibiki</span>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            {/* Animated checkmark */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">求人が公開されました！</h1>
            <p className="text-gray-600 font-medium mb-2">{publishedTitle}</p>
            <p className="text-gray-500 mb-8 text-sm max-w-xs mx-auto">
              求人が正常に公開されました。AIが最適な候補者を自動的に推薦します。
            </p>
            <Link
              href="/company"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all inline-flex items-center gap-2 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
            >
              企業ダッシュボードへ戻る
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Draft saved toast */}
      {savedDraft && (
        <div className="fixed top-20 right-4 z-[70] bg-gray-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fade-in border border-white/10">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium">下書きを保存しました</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200/50" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">この求人を公開しますか？</h3>
              <p className="text-sm text-gray-500">公開後、AIが自動的に候補者のマッチングを開始します。</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={publishing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium transition-all disabled:opacity-50 shadow-sm shadow-indigo-500/25"
              >
                {publishing ? "公開中..." : "公開する"}
              </button>
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
              <Link href="/company/post" className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg font-medium ring-1 ring-indigo-100">求人を作成</Link>
              <Link href="/company" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 px-3 py-1.5 rounded-lg transition-all">ダッシュボード</Link>
              <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 px-3 py-1.5 rounded-lg transition-all">ヘルプ</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-xs">{company?.name?.charAt(0) || "企"}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">新規求人を作成</h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">求人情報を入力して、最適な候補者を見つけましょう</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job title */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">基本情報</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    職種名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="例: シニアフロントエンドエンジニア"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all ${
                      validationErrors.title ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    カテゴリー <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all bg-white ${
                      validationErrors.category ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"
                    }`}
                  >
                    <option value="">カテゴリーを選択</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {validationErrors.category && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{validationErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    仕事内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="業務内容、プロジェクトの概要、チーム構成などを記載してください"
                    rows={5}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all resize-none ${
                      validationErrors.description ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"
                    }`}
                  />
                  {validationErrors.description && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{validationErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    必須スキル
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="スキルを入力してEnterで追加"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                    />
                    <button
                      onClick={addSkill}
                      type="button"
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                    >
                      追加
                    </button>
                  </div>
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm font-medium ring-1 ring-indigo-100"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-0.5 text-indigo-400 hover:text-indigo-600 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">報酬・条件</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    報酬レンジ（時給）
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">¥</span>
                      <input
                        type="number"
                        value={form.rateMin}
                        onChange={(e) => handleChange("rateMin", e.target.value)}
                        placeholder="3,000"
                        className="w-full pl-8 pr-12 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">/時</span>
                    </div>
                    <span className="text-gray-300 font-medium">~</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">¥</span>
                      <input
                        type="number"
                        value={form.rateMax}
                        onChange={(e) => handleChange("rateMax", e.target.value)}
                        placeholder="8,000"
                        className="w-full pl-8 pr-12 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">/時</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    雇用形態
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["フルタイム", "パートタイム", "業務委託"].map((type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                          form.employmentType === type
                            ? "border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 ring-1 ring-indigo-200"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="employmentType"
                          value={type}
                          checked={form.employmentType === type}
                          onChange={(e) => handleChange("employmentType", e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          form.employmentType === type ? "border-indigo-600" : "border-gray-300"
                        }`}>
                          {form.employmentType === type && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    勤務形態
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["リモート", "ハイブリッド", "オンサイト"].map((style) => (
                      <label
                        key={style}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                          form.workStyle === style
                            ? "border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 ring-1 ring-indigo-200"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="workStyle"
                          value={style}
                          checked={form.workStyle === style}
                          onChange={(e) => handleChange("workStyle", e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          form.workStyle === style ? "border-indigo-600" : "border-gray-300"
                        }`}>
                          {form.workStyle === style && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        {style}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      勤務地
                    </label>
                    <select
                      value={form.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all bg-white"
                    >
                      <option value="">勤務地を選択</option>
                      {locationOptions.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      必要経験年数
                    </label>
                    <select
                      value={form.experience}
                      onChange={(e) => handleChange("experience", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all bg-white"
                    >
                      <option value="">経験年数を選択</option>
                      {experienceOptions.map((exp) => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* AI recommendation toggle */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AIで候補者を自動推薦</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      AIが求人内容を分析し、最適な候補者を自動的に推薦します
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleChange("aiRecommend", !form.aiRecommend)}
                  className={`relative w-12 h-6 rounded-full transition-all shadow-inner ${
                    form.aiRecommend ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      form.aiRecommend ? "translate-x-6.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                {showPreview ? "プレビューを閉じる" : "プレビュー"}
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="px-6 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
              >
                {savingDraft ? "保存中..." : "下書き保存"}
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium transition-all disabled:opacity-50 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                {publishing ? "公開中..." : "求人を公開する"}
              </button>
            </div>
          </div>

          {/* Preview sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">求人カードプレビュー</h3>
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {form.title || "職種名"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {form.category || "カテゴリー"}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white font-bold text-xs">{company?.name?.charAt(0) || "M"}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                  {form.description || "仕事内容がここに表示されます..."}
                </p>

                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {form.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 text-xs text-indigo-700 font-medium ring-1 ring-indigo-100">
                        {skill}
                      </span>
                    ))}
                    {form.skills.length > 4 && (
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-xs text-gray-500 font-medium">
                        +{form.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                  {(form.rateMin || form.rateMax) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">¥{form.rateMin || "---"} ~ ¥{form.rateMax || "---"}/時</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25" />
                    </svg>
                    <span className="font-medium">{form.employmentType} / {form.workStyle}</span>
                  </div>
                  {form.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="font-medium">{form.location}</span>
                    </div>
                  )}
                  {form.experience && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                      </svg>
                      <span className="font-medium">経験 {form.experience}</span>
                    </div>
                  )}
                </div>

                {form.aiRecommend && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      AI自動推薦 有効
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile preview toggle */}
              {showPreview && (
                <div className="lg:hidden mt-4 bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
                  <p className="text-sm text-gray-500 text-center">
                    上のプレビューカードでリアルタイムに確認できます
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/80 backdrop-blur-sm py-8 mt-12">
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

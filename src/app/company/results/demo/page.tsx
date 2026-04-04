"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

// ─── Types ───
interface DemoResult {
  id: string;
  candidate_id: string;
  job_posting_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  appearance_score: number;
  problem_solving_score: number;
  correct_rate: number;
  matching_score: number;
  ai_analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  recommendationLevel: "strongly_recommended" | "recommended" | "conditionally_recommended" | "not_recommended";
  sent_to_company: boolean;
  created_at: string;
  candidateProfile: { full_name: string; avatar_url: string | null; location: string | null; title: string | null };
  jobTitle: string;
  jobPostingId: string;
  expertAnalysis?: {
    domainExpertiseScore: number;
    thinkingDepth: string;
    chainOfThought: { step: number; description: string; quality: string }[];
    uniqueInsights: string[];
    readinessLevel: string;
    cotSummary: string;
  };
}

// ─── Demo Data (8 candidates) ───
const DEMO_RESULTS: DemoResult[] = [
  {
    id: "demo-1", candidate_id: "c1", job_posting_id: "j1",
    overall_score: 82, technical_score: 85, communication_score: 78, appearance_score: 88, problem_solving_score: 80, correct_rate: 75, matching_score: 84,
    ai_analysis: "田中太郎さんは、フロントエンド開発において非常に高い技術力を示しました。React・TypeScriptに関する深い理解を持ち、パフォーマンス最適化やアクセシビリティに関する質問にも的確に回答しました。コンポーネント設計の考え方が明確で、再利用性やテスタビリティを重視する姿勢が好印象です。",
    strengths: ["React/TypeScriptの深い知識", "パフォーマンス最適化の実務経験", "論理的な問題解決アプローチ", "チーム協業への積極的な姿勢"],
    weaknesses: ["バックエンド技術の経験が限定的", "大規模プロジェクトのアーキテクチャ経験がやや不足"],
    recommendation: "【強く推奨】フロントエンド開発者として即戦力となる人材です。React/TypeScriptのスキルは求人要件を十分に満たしており、チームへの貢献が期待できます。",
    recommendationLevel: "strongly_recommended",
    sent_to_company: true, created_at: "2026-03-25T10:30:00Z",
    candidateProfile: { full_name: "田中 太郎", avatar_url: null, location: "東京都", title: "フロントエンドエンジニア" },
    jobTitle: "シニアフロントエンドエンジニア", jobPostingId: "j1",
  },
  {
    id: "demo-2", candidate_id: "c2", job_posting_id: "j1",
    overall_score: 68, technical_score: 72, communication_score: 65, appearance_score: 70, problem_solving_score: 62, correct_rate: 60, matching_score: 66,
    ai_analysis: "佐藤花子さんは、基本的なフロントエンド技術に関する理解を示しました。HTMLとCSSの基礎は確実ですが、ReactやTypeScriptに関しては実務経験がまだ浅い印象です。今後の成長次第で活躍が期待できる候補者です。",
    strengths: ["HTML/CSSの確実な基礎力", "落ち着いたコミュニケーション", "学習意欲の高さ"],
    weaknesses: ["React実務経験の不足", "TypeScriptの型システムの理解がやや浅い", "複雑な状態管理パターンの経験不足"],
    recommendation: "【条件付き推奨】基礎力と学習意欲は認められますが、シニアポジションとしては経験不足です。ジュニア〜ミドルポジションであれば検討ください。",
    recommendationLevel: "conditionally_recommended",
    sent_to_company: true, created_at: "2026-03-24T14:00:00Z",
    candidateProfile: { full_name: "佐藤 花子", avatar_url: null, location: "大阪府", title: "Webデベロッパー" },
    jobTitle: "シニアフロントエンドエンジニア", jobPostingId: "j1",
  },
  {
    id: "demo-3", candidate_id: "c3", job_posting_id: "j2",
    overall_score: 91, technical_score: 94, communication_score: 88, appearance_score: 85, problem_solving_score: 92, correct_rate: 90, matching_score: 93,
    ai_analysis: "鈴木一郎さんは、データサイエンス分野において卓越した専門性を示しました。機械学習モデルの設計から本番デプロイメントまでの一連の工程に精通しており、特にモデルの評価指標の選定とバイアス対策に関する回答は非常に的確でした。",
    strengths: ["機械学習の理論と実践の両面で卓越", "体系的な思考プロセス", "ビジネスインパクトを意識した提案力", "MLOpsの実務経験が豊富"],
    weaknesses: ["リアルタイム推論システムの経験がやや限定的"],
    recommendation: "【強く推奨】データサイエンティストとして極めて優秀な候補者です。即座に採用を推奨します。",
    recommendationLevel: "strongly_recommended",
    sent_to_company: false, created_at: "2026-03-26T09:00:00Z",
    candidateProfile: { full_name: "鈴木 一郎", avatar_url: null, location: "東京都", title: "シニアデータサイエンティスト" },
    jobTitle: "リードデータサイエンティスト", jobPostingId: "j2",
    expertAnalysis: {
      domainExpertiseScore: 92, thinkingDepth: "deep",
      chainOfThought: [
        { step: 1, description: "問題の本質を正確に特定し、ビジネスKPIとの関連を明確化", quality: "good" },
        { step: 2, description: "複数のモデルアーキテクチャを比較検討し、トレードオフを的確に分析", quality: "good" },
        { step: 3, description: "データの偏りやリーケージリスクを事前に指摘", quality: "good" },
        { step: 4, description: "本番運用を見据えたモニタリング戦略を提案", quality: "good" },
      ],
      uniqueInsights: ["モデルのフェアネス指標をビジネスKPIに組み込む提案", "A/Bテストのデザインで統計的検出力を考慮した設計"],
      readinessLevel: "advanced_expert",
      cotSummary: "候補者は問題理解からアプローチ選定、代替案検討、リスク評価まで一貫して高い思考の質を示しました。",
    },
  },
  {
    id: "demo-4", candidate_id: "c4", job_posting_id: "j3",
    overall_score: 75, technical_score: 78, communication_score: 80, appearance_score: 82, problem_solving_score: 70, correct_rate: 65, matching_score: 74,
    ai_analysis: "山田健太さんは、バックエンド開発に関して安定した技術力を持っています。Go言語とマイクロサービスアーキテクチャに精通しており、API設計やデータベース最適化についての回答は的確でした。チームでのコミュニケーション力も高評価です。",
    strengths: ["Go言語の実務経験3年以上", "マイクロサービス設計力", "API設計のベストプラクティス理解", "チームコミュニケーション力"],
    weaknesses: ["フロントエンド技術への理解が限定的", "大規模分散システムの運用経験がやや不足"],
    recommendation: "【推奨】バックエンドエンジニアとして十分な技術力を持ち、チームワークも良好です。中堅エンジニアとして即戦力が期待できます。",
    recommendationLevel: "recommended",
    sent_to_company: true, created_at: "2026-03-23T11:00:00Z",
    candidateProfile: { full_name: "山田 健太", avatar_url: null, location: "福岡県", title: "バックエンドエンジニア" },
    jobTitle: "バックエンドエンジニア（Go）", jobPostingId: "j3",
  },
  {
    id: "demo-5", candidate_id: "c5", job_posting_id: "j2",
    overall_score: 55, technical_score: 50, communication_score: 60, appearance_score: 65, problem_solving_score: 48, correct_rate: 40, matching_score: 45,
    ai_analysis: "高橋美咲さんは、データ分析の基礎知識は持っていますが、求人が求めるリードレベルには達していません。Pythonの基本的なデータ処理は行えますが、機械学習モデルの設計・評価に関する理解が不十分です。",
    strengths: ["Pythonの基礎力", "データ可視化スキル", "明るいコミュニケーション"],
    weaknesses: ["機械学習の理論理解が不足", "統計的手法の応用経験なし", "MLパイプライン構築の経験なし", "ビジネス課題への落とし込み力が弱い"],
    recommendation: "【非推奨】リードデータサイエンティストとしてのスキルレベルに達していません。ジュニアデータアナリストとしてであれば、育成前提で検討可能です。",
    recommendationLevel: "not_recommended",
    sent_to_company: true, created_at: "2026-03-22T16:00:00Z",
    candidateProfile: { full_name: "高橋 美咲", avatar_url: null, location: "名古屋市", title: "データアナリスト" },
    jobTitle: "リードデータサイエンティスト", jobPostingId: "j2",
  },
  {
    id: "demo-6", candidate_id: "c6", job_posting_id: "j1",
    overall_score: 88, technical_score: 90, communication_score: 85, appearance_score: 82, problem_solving_score: 88, correct_rate: 85, matching_score: 89,
    ai_analysis: "渡辺翔太さんは、フルスタック寄りのフロントエンドエンジニアとして非常に高い能力を示しました。Next.jsやReactに精通し、SSR/ISRのパフォーマンス戦略にも豊富な経験があります。テスト駆動開発やCI/CDパイプラインの構築経験も優れています。",
    strengths: ["Next.js/Reactの高度な知識", "テスト駆動開発の実践", "CI/CDパイプライン構築経験", "フルスタック対応力"],
    weaknesses: ["チームリーダー経験がやや少ない"],
    recommendation: "【強く推奨】即戦力として非常に優秀な候補者です。フロントエンドのテックリードとしても成長が期待できます。",
    recommendationLevel: "strongly_recommended",
    sent_to_company: true, created_at: "2026-03-26T08:00:00Z",
    candidateProfile: { full_name: "渡辺 翔太", avatar_url: null, location: "東京都", title: "フルスタックエンジニア" },
    jobTitle: "シニアフロントエンドエンジニア", jobPostingId: "j1",
  },
  {
    id: "demo-7", candidate_id: "c7", job_posting_id: "j3",
    overall_score: 62, technical_score: 65, communication_score: 58, appearance_score: 60, problem_solving_score: 60, correct_rate: 55, matching_score: 58,
    ai_analysis: "伊藤裕子さんは、バックエンド開発の基礎は持っていますが、Go言語の実務経験が限られています。Java/SpringBootでの経験はありますが、求人が求めるGoスキルとの差があります。学習意欲は高く、キャッチアップの可能性はあります。",
    strengths: ["Java/SpringBootの実務経験", "REST API設計の理解", "積極的な学習姿勢"],
    weaknesses: ["Go言語の実務経験なし", "マイクロサービス移行経験の不足", "パフォーマンスチューニングの経験が限定的"],
    recommendation: "【条件付き推奨】Go経験はないが、Java経験を活かしたキャッチアップが期待できます。育成コストを許容できる場合は検討の価値あり。",
    recommendationLevel: "conditionally_recommended",
    sent_to_company: false, created_at: "2026-03-21T13:00:00Z",
    candidateProfile: { full_name: "伊藤 裕子", avatar_url: null, location: "横浜市", title: "Javaエンジニア" },
    jobTitle: "バックエンドエンジニア（Go）", jobPostingId: "j3",
  },
  {
    id: "demo-8", candidate_id: "c8", job_posting_id: "j2",
    overall_score: 78, technical_score: 80, communication_score: 75, appearance_score: 78, problem_solving_score: 82, correct_rate: 70, matching_score: 76,
    ai_analysis: "中村大輔さんは、データエンジニアリングの経験をベースに、データサイエンス領域へのキャリアチェンジを目指しています。ETLパイプラインやデータ基盤構築の経験は豊富で、MLモデルのデプロイ・運用面での知見は即戦力レベルです。",
    strengths: ["データ基盤構築の豊富な経験", "ETLパイプライン設計力", "MLデプロイ・運用の知見", "問題解決の論理的アプローチ"],
    weaknesses: ["統計モデリングの理論がやや弱い", "最新のLLM/生成AI技術への経験が限定的"],
    recommendation: "【推奨】データエンジニアリングの強みを活かし、MLOps寄りの役割で大きく貢献できる人材です。統計面の補強ができれば更に成長が期待できます。",
    recommendationLevel: "recommended",
    sent_to_company: true, created_at: "2026-03-20T15:30:00Z",
    candidateProfile: { full_name: "中村 大輔", avatar_url: null, location: "東京都", title: "データエンジニア" },
    jobTitle: "リードデータサイエンティスト", jobPostingId: "j2",
  },
];

const JOB_OPTIONS = [
  { id: "j1", title: "シニアフロントエンドエンジニア" },
  { id: "j2", title: "リードデータサイエンティスト" },
  { id: "j3", title: "バックエンドエンジニア（Go）" },
];

type SortKey = "matching_score" | "overall_score" | "technical_score" | "communication_score" | "problem_solving_score" | "correct_rate" | "created_at";
type ViewMode = "grid" | "table";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "matching_score", label: "マッチングスコア" },
  { key: "overall_score", label: "総合スコア" },
  { key: "technical_score", label: "技術力" },
  { key: "communication_score", label: "コミュニケーション" },
  { key: "problem_solving_score", label: "問題解決力" },
  { key: "correct_rate", label: "正答率" },
  { key: "created_at", label: "面接日" },
];

const RECOMMENDATION_OPTIONS = [
  { value: "all", label: "全ての推薦" },
  { value: "strongly_recommended", label: "強く推奨" },
  { value: "recommended", label: "推奨" },
  { value: "conditionally_recommended", label: "条件付き推奨" },
  { value: "not_recommended", label: "非推奨" },
];

const SCORE_RANGE_OPTIONS = [
  { value: "all", label: "全スコア" },
  { value: "A", label: "A (80+)" },
  { value: "B", label: "B (60-79)" },
  { value: "C", label: "C (40-59)" },
  { value: "D", label: "D (<40)" },
];

function getRecommendationBadge(level: DemoResult["recommendationLevel"]) {
  switch (level) {
    case "strongly_recommended": return { label: "強く推奨", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    case "recommended": return { label: "推奨", cls: "bg-blue-100 text-blue-800 border-blue-200" };
    case "conditionally_recommended": return { label: "条件付き", cls: "bg-amber-100 text-amber-800 border-amber-200" };
    case "not_recommended": return { label: "非推奨", cls: "bg-red-100 text-red-800 border-red-200" };
  }
}

// ─── Animated Circular Progress ───
function CircularScore({ label, value, size = 100, strokeWidth = 8, delay = 0 }: { label: string; value: number | null; size?: number; strokeWidth?: number; delay?: number }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const score = value ?? 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? { stroke: "#10b981", text: "text-emerald-500", glow: "rgba(16,185,129,0.3)" } : score >= 60 ? { stroke: "#3b82f6", text: "text-blue-500", glow: "rgba(59,130,246,0.3)" } : score >= 40 ? { stroke: "#f59e0b", text: "text-amber-500", glow: "rgba(245,158,11,0.3)" } : { stroke: "#9ca3af", text: "text-gray-400", glow: "rgba(156,163,175,0.2)" };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setTimeout(() => setAnimated(true), delay); observer.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-gray-100" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} stroke={color.stroke} strokeDasharray={circumference} strokeDashoffset={animated ? offset : circumference} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)", filter: animated ? `drop-shadow(0 0 6px ${color.glow})` : "none" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color.text}`}>{value !== null ? score : "-"}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  );
}

function MiniCircle({ value, size = 44 }: { value: number | null; size?: number }) {
  const score = value ?? 0;
  const sw = 4, r = (size - sw) / 2, c = 2 * Math.PI * r, off = c - (score / 100) * c;
  const col = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#9ca3af";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} className="stroke-gray-100" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} stroke={col} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-gray-700">{value !== null ? score : "-"}</span></div>
    </div>
  );
}

function MatchingBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm">-</span>;
  const config = score >= 80 ? { bg: "bg-gradient-to-r from-emerald-500 to-teal-400", text: "text-white" } : score >= 60 ? { bg: "bg-gradient-to-r from-blue-500 to-indigo-400", text: "text-white" } : score >= 40 ? { bg: "bg-gradient-to-r from-amber-400 to-yellow-300", text: "text-gray-800" } : { bg: "bg-gray-200", text: "text-gray-600" };
  return <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${config.bg} ${config.text} shadow-sm`}><span>{score}%</span><span className="opacity-80">マッチ</span></div>;
}

function MatchingDisplay({ score }: { score: number | null }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setTimeout(() => setAnimated(true), 200); observer.disconnect(); } }, { threshold: 0.3 }); if (ref.current) observer.observe(ref.current); return () => observer.disconnect(); }, []);
  if (score === null) return <div className="text-center py-6"><p className="text-gray-400 text-sm">スコアなし</p></div>;
  const config = score >= 80 ? { gradient: "from-emerald-500 to-teal-400", label: "非常に高いマッチング", glow: "rgba(16,185,129,0.4)", stroke: "#10b981" } : score >= 60 ? { gradient: "from-blue-500 to-indigo-400", label: "良いマッチング", glow: "rgba(59,130,246,0.4)", stroke: "#3b82f6" } : score >= 40 ? { gradient: "from-amber-400 to-yellow-300", label: "普通のマッチング", glow: "rgba(245,158,11,0.3)", stroke: "#f59e0b" } : { gradient: "from-gray-400 to-gray-300", label: "マッチングが低い", glow: "rgba(156,163,175,0.2)", stroke: "#9ca3af" };
  const sz = 160, sw = 10, r = (sz - sw) / 2, c = 2 * Math.PI * r, off = c - (score / 100) * c;
  return (
    <div ref={ref} className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.3),transparent_70%)]" />
      <div className="relative">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${sz} ${sz}`}>
            <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" strokeWidth={sw} stroke="rgba(255,255,255,0.1)" />
            <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" strokeWidth={sw} stroke={config.stroke} strokeDasharray={c} strokeDashoffset={animated ? off : c} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)", filter: animated ? `drop-shadow(0 0 10px ${config.glow})` : "none" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{score}</span>
            <span className="text-xs text-gray-400 mt-0.5">/ 100</span>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white text-sm font-semibold shadow-lg`}>{config.label}</div>
        <p className="text-xs text-gray-500 mt-3">マッチングスコア</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">{icon}</div>
      <div><p className="text-xs text-gray-500">{label}</p><p className="text-sm font-semibold text-gray-900">{value}</p></div>
    </div>
  );
}

// ─── Expert Analysis Panel ───
function ExpertAnalysisPanel({ data }: { data: NonNullable<DemoResult["expertAnalysis"]> }) {
  const depthLabel = data.thinkingDepth === "deep" ? "深い分析" : data.thinkingDepth === "moderate" ? "標準的分析" : "表面的";
  const depthColor = data.thinkingDepth === "deep" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : data.thinkingDepth === "moderate" ? "text-blue-600 bg-blue-50 border-blue-200" : "text-gray-600 bg-gray-50 border-gray-200";
  const readinessLabel = data.readinessLevel === "thought_leader" ? "ソートリーダー" : data.readinessLevel === "advanced_expert" ? "上級エキスパート" : "中級エキスパート";

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          エキスパート分析（CoT評価）
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/80 rounded-xl p-4 text-center border border-violet-100"><p className="text-3xl font-bold text-violet-600">{data.domainExpertiseScore}</p><p className="text-xs text-gray-500 mt-1">ドメイン専門性</p></div>
          <div className="bg-white/80 rounded-xl p-4 text-center border border-violet-100"><span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${depthColor}`}>{depthLabel}</span><p className="text-xs text-gray-500 mt-2">思考の深さ</p></div>
          <div className="bg-white/80 rounded-xl p-4 text-center border border-violet-100"><span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200">{readinessLabel}</span><p className="text-xs text-gray-500 mt-2">準備度</p></div>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-violet-100">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">思考プロセス総合評価</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{data.cotSummary}</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          思考ステップ分析
        </h4>
        <div className="space-y-3">
          {data.chainOfThought.map((step) => (
            <div key={step.step} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-indigo-600">{step.step}</span></div>
              <div className="flex-1"><p className="text-sm text-gray-700">{step.description}</p></div>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${step.quality === "good" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : step.quality === "adequate" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>{step.quality === "good" ? "優秀" : step.quality === "adequate" ? "適切" : "要改善"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          ユニークな洞察
        </h4>
        <div className="space-y-2">
          {data.uniqueInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
              <span className="text-amber-500 mt-0.5">&#9733;</span>
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Score Cell (for table) ───
function ScoreCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400">-</span>;
  const color = value >= 80 ? "text-emerald-600 bg-emerald-50" : value >= 60 ? "text-blue-600 bg-blue-50" : value >= 40 ? "text-amber-600 bg-amber-50" : "text-gray-500 bg-gray-50";
  return <span className={`inline-flex items-center justify-center w-10 h-7 rounded-md text-xs font-bold ${color}`}>{value}</span>;
}

// ─── Toolbar Icons ───
const GridIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const TableIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" /></svg>;

export default function CompanyResultsDemoPage() {
  const [selectedResult, setSelectedResult] = useState<DemoResult | null>(null);
  const [jobFilter, setJobFilter] = useState("all");
  const [recFilter, setRecFilter] = useState("all");
  const [scoreRange, setScoreRange] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("matching_score");
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredAndSorted = useMemo(() => {
    let data = [...DEMO_RESULTS];
    // Filters
    if (jobFilter !== "all") data = data.filter((r) => r.jobPostingId === jobFilter);
    if (recFilter !== "all") data = data.filter((r) => r.recommendationLevel === recFilter);
    if (scoreRange !== "all") {
      data = data.filter((r) => {
        const s = r.matching_score;
        if (scoreRange === "A") return s >= 80;
        if (scoreRange === "B") return s >= 60 && s < 80;
        if (scoreRange === "C") return s >= 40 && s < 60;
        if (scoreRange === "D") return s < 40;
        return true;
      });
    }
    // Sort
    data.sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "created_at") {
        av = new Date(a.created_at).getTime();
        bv = new Date(b.created_at).getTime();
      } else {
        av = a[sortKey] ?? 0;
        bv = b[sortKey] ?? 0;
      }
      return sortAsc ? av - bv : bv - av;
    });
    return data;
  }, [jobFilter, recFilter, scoreRange, sortKey, sortAsc]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });

  // ─── Table header click sort ───
  const handleTableSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortArrow = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="text-gray-300 ml-0.5">{"\u2195"}</span>;
    return <span className="text-indigo-500 ml-0.5">{sortAsc ? "\u25B2" : "\u25BC"}</span>;
  };

  if (selectedResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center py-3 text-sm font-medium">デモモード — 企業が受け取る面接結果レポートのサンプルです</div>
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3"><Link href="/home"><Logo size="header" iconOnly showBrandName /></Link><span className="text-gray-300">|</span><h1 className="text-sm font-medium text-gray-700">面接結果（デモ）</h1></div>
            <Link href="/home" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← ホームに戻る</Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
          <button onClick={() => setSelectedResult(null)} className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 flex items-center gap-1 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            結果一覧に戻る
          </button>
          {/* Candidate header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-sm">{selectedResult.candidateProfile.full_name.charAt(0)}</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{selectedResult.candidateProfile.full_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedResult.candidateProfile.title}{selectedResult.candidateProfile.location ? ` · ${selectedResult.candidateProfile.location}` : ""}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedResult.jobTitle} · {formatDate(selectedResult.created_at)}</p>
              </div>
              <MatchingBadge score={selectedResult.matching_score} />
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-8 flex items-center gap-2"><svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>評価スコア</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                  <CircularScore label="総合" value={selectedResult.overall_score} delay={0} />
                  <CircularScore label="技術力" value={selectedResult.technical_score} delay={100} />
                  <CircularScore label="対話力" value={selectedResult.communication_score} delay={200} />
                  <CircularScore label="清潔感" value={selectedResult.appearance_score} delay={300} />
                  <CircularScore label="問題解決" value={selectedResult.problem_solving_score} delay={400} />
                  <CircularScore label="正答率" value={selectedResult.correct_rate} delay={500} />
                </div>
              </div>
              {selectedResult.ai_analysis && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>AI分析</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedResult.ai_analysis}</p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>強み</h3>
                  <div className="flex flex-wrap gap-2">{selectedResult.strengths.map((s, i) => <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">{s}</span>)}</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center"><svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 4h.01" /></svg></span>改善点</h3>
                  <div className="flex flex-wrap gap-2">{selectedResult.weaknesses.map((w, i) => <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">{w}</span>)}</div>
                </div>
              </div>
              {selectedResult.recommendation && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>採用推薦コメント</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedResult.recommendation}</p>
                </div>
              )}
              {selectedResult.expertAnalysis && <ExpertAnalysisPanel data={selectedResult.expertAnalysis} />}
            </div>
            <div className="space-y-6">
              <MatchingDisplay score={selectedResult.matching_score} />
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md cursor-default"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>面接録画を見る</button>
              <div className="space-y-3">
                <StatCard label="求人" value={selectedResult.jobTitle} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                <StatCard label="面接日" value={formatDate(selectedResult.created_at)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard label="送信状態" value={selectedResult.sent_to_company ? "送信済み" : "未送信"} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIST / TABLE VIEW ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center py-3 text-sm font-medium">デモモード — 企業が受け取る面接結果レポートのサンプルです</div>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3"><Link href="/home"><Logo size="header" iconOnly showBrandName /></Link><span className="text-gray-300">|</span><h1 className="text-sm font-medium text-gray-700">面接結果（デモ）</h1></div>
          <Link href="/home" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← ホームに戻る</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">面接結果</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredAndSorted.length}件の結果（全{DEMO_RESULTS.length}件中）</p>
        </div>

        {/* ─── Toolbar ─── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Job filter */}
            <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="all">全ての求人</option>
              {JOB_OPTIONS.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>

            {/* Recommendation filter */}
            <select value={recFilter} onChange={(e) => setRecFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              {RECOMMENDATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Score range filter */}
            <select value={scoreRange} onChange={(e) => setScoreRange(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              {SCORE_RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <div className="w-px h-8 bg-gray-200 mx-1" />

            {/* Sort */}
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>

            <button onClick={() => setSortAsc(!sortAsc)} className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors" title={sortAsc ? "昇順" : "降順"}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sortAsc
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />}
              </svg>
            </button>

            <div className="w-px h-8 bg-gray-200 mx-1" />

            {/* View mode toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`flex items-center justify-center w-9 h-9 transition-colors ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-400 hover:text-gray-600"}`} title="グリッド表示"><GridIcon /></button>
              <button onClick={() => setViewMode("table")} className={`flex items-center justify-center w-9 h-9 transition-colors ${viewMode === "table" ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-400 hover:text-gray-600"}`} title="テーブル表示"><TableIcon /></button>
            </div>
          </div>
        </div>

        {/* ─── Grid View ─── */}
        {viewMode === "grid" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAndSorted.map((result, index) => {
              const recBadge = getRecommendationBadge(result.recommendationLevel);
              return (
                <button key={result.id} onClick={() => setSelectedResult(result)} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-5 text-left hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 group" style={{ animationDelay: `${index * 30}ms` }}>
                  {/* Rank badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">{result.candidateProfile.full_name.charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{result.candidateProfile.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{result.jobTitle}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-300 ml-1">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <MatchingBadge score={result.matching_score} />
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${recBadge.cls}`}>{recBadge.label}</span>
                    {result.expertAnalysis && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-700 border border-violet-200">Expert</span>}
                  </div>
                  <div className="flex items-center justify-around mb-4 py-3 bg-gray-50/80 rounded-xl">
                    {[{ label: "総合", value: result.overall_score }, { label: "技術", value: result.technical_score }, { label: "対話", value: result.communication_score }].map((s) => (
                      <div key={s.label} className="flex flex-col items-center gap-1"><MiniCircle value={s.value} /><span className="text-[10px] text-gray-400">{s.label}</span></div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{formatDate(result.created_at)}</span>
                    <span className="text-xs text-indigo-500 font-medium group-hover:text-indigo-600 flex items-center gap-0.5">詳細<svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Table View ─── */}
        {viewMode === "table" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/60">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs w-8">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs">候補者</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs">求人</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none" onClick={() => handleTableSort("matching_score")}>マッチ<SortArrow col="matching_score" /></th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none" onClick={() => handleTableSort("overall_score")}>総合<SortArrow col="overall_score" /></th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none" onClick={() => handleTableSort("technical_score")}>技術<SortArrow col="technical_score" /></th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none" onClick={() => handleTableSort("communication_score")}>対話<SortArrow col="communication_score" /></th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none" onClick={() => handleTableSort("problem_solving_score")}>問題解決<SortArrow col="problem_solving_score" /></th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none" onClick={() => handleTableSort("correct_rate")}>正答率<SortArrow col="correct_rate" /></th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs">推薦</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none" onClick={() => handleTableSort("created_at")}>日付<SortArrow col="created_at" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map((result, index) => {
                    const recBadge = getRecommendationBadge(result.recommendationLevel);
                    return (
                      <tr key={result.id} onClick={() => setSelectedResult(result)} className="border-b border-gray-100 hover:bg-indigo-50/40 cursor-pointer transition-colors">
                        <td className="py-3 px-4 text-gray-400 font-bold text-xs">{index + 1}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{result.candidateProfile.full_name.charAt(0)}</div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm whitespace-nowrap">{result.candidateProfile.full_name}</p>
                              <p className="text-xs text-gray-400 whitespace-nowrap">{result.candidateProfile.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600 max-w-[140px] truncate">{result.jobTitle}</td>
                        <td className="py-3 px-3 text-center"><MatchingBadge score={result.matching_score} /></td>
                        <td className="py-3 px-3 text-center"><ScoreCell value={result.overall_score} /></td>
                        <td className="py-3 px-3 text-center"><ScoreCell value={result.technical_score} /></td>
                        <td className="py-3 px-3 text-center"><ScoreCell value={result.communication_score} /></td>
                        <td className="py-3 px-3 text-center"><ScoreCell value={result.problem_solving_score} /></td>
                        <td className="py-3 px-3 text-center"><ScoreCell value={result.correct_rate} /></td>
                        <td className="py-3 px-4 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${recBadge.cls}`}>{recBadge.label}</span></td>
                        <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(result.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredAndSorted.length === 0 && (
              <div className="text-center py-12"><p className="text-gray-400">条件に一致する結果がありません</p></div>
            )}
          </div>
        )}

        {filteredAndSorted.length === 0 && viewMode === "grid" && (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60">
            <p className="text-gray-500 font-medium">条件に一致する結果がありません</p>
            <p className="text-gray-400 text-sm mt-1">フィルタ条件を変更してください。</p>
          </div>
        )}
      </div>
    </div>
  );
}

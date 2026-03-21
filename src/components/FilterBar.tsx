"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  filters: {
    domain: string[];
    pay: string[];
    commitment: string[];
    location: string[];
    workArrangement: string[];
  };
  onFilterChange: (key: string, values: string[]) => void;
};

// Domain filter uses grouped categories for better UX
const domainGroups: { group: string; options: { value: string; label: string }[] }[] = [
  {
    group: "IT・エンジニアリング",
    options: [
      { value: "フロントエンド", label: "フロントエンド" },
      { value: "バックエンド", label: "バックエンド" },
      { value: "フルスタック", label: "フルスタック" },
      { value: "モバイル", label: "モバイル" },
      { value: "インフラ/DevOps", label: "インフラ/DevOps" },
      { value: "クラウドエンジニア", label: "クラウドエンジニア" },
      { value: "組み込み/IoT", label: "組み込み/IoT" },
      { value: "SRE", label: "SRE" },
      { value: "セキュリティ", label: "セキュリティ" },
      { value: "QA/テスト", label: "QA/テスト" },
    ],
  },
  {
    group: "データ・AI",
    options: [
      { value: "データサイエンス", label: "データサイエンス" },
      { value: "データエンジニア", label: "データエンジニア" },
      { value: "AI/機械学習", label: "AI/機械学習" },
      { value: "LLM/生成AI", label: "LLM/生成AI" },
      { value: "データアナリスト", label: "データアナリスト" },
      { value: "プロンプトエンジニア", label: "プロンプトエンジニア" },
      { value: "AIトレーナー", label: "AIトレーナー" },
    ],
  },
  {
    group: "デザイン・クリエイティブ",
    options: [
      { value: "UI/UXデザイン", label: "UI/UXデザイン" },
      { value: "グラフィックデザイン", label: "グラフィックデザイン" },
      { value: "プロダクトデザイン", label: "プロダクトデザイン" },
      { value: "動画制作/編集", label: "動画制作/編集" },
      { value: "写真/フォトグラファー", label: "写真/フォトグラファー" },
      { value: "コンテンツ制作", label: "コンテンツ制作" },
      { value: "テクニカルライター", label: "テクニカルライター" },
      { value: "翻訳/ローカライズ", label: "翻訳/ローカライズ" },
    ],
  },
  {
    group: "マーケティング・メディア",
    options: [
      { value: "マーケティング", label: "マーケティング" },
      { value: "グロースハック", label: "グロースハック" },
      { value: "SEO/SEM", label: "SEO/SEM" },
      { value: "SNS運用", label: "SNS運用" },
      { value: "インフルエンサー", label: "インフルエンサー" },
      { value: "YouTuber/配信者", label: "YouTuber/配信者" },
      { value: "音声/ポッドキャスト", label: "音声/ポッドキャスト" },
      { value: "広報/PR", label: "広報/PR" },
    ],
  },
  {
    group: "ビジネス・営業",
    options: [
      { value: "営業", label: "営業" },
      { value: "事業開発/BizDev", label: "事業開発/BizDev" },
      { value: "カスタマーサクセス", label: "カスタマーサクセス" },
      { value: "カスタマーサポート", label: "カスタマーサポート" },
      { value: "コンサルティング", label: "コンサルティング" },
      { value: "Eコマース", label: "Eコマース" },
    ],
  },
  {
    group: "マネジメント",
    options: [
      { value: "プロダクトマネジメント", label: "プロダクトマネジメント" },
      { value: "プロジェクトマネジメント", label: "プロジェクトマネジメント" },
      { value: "エンジニアリングマネージャー", label: "エンジニアリングマネージャー" },
      { value: "CTO/VPoE", label: "CTO/VPoE" },
      { value: "コミュニティマネージャー", label: "コミュニティマネージャー" },
    ],
  },
  {
    group: "コーポレート・管理",
    options: [
      { value: "人事/採用", label: "人事/採用" },
      { value: "経理/財務", label: "経理/財務" },
      { value: "法務", label: "法務" },
      { value: "総務/事務", label: "総務/事務" },
      { value: "リサーチ", label: "リサーチ" },
    ],
  },
  {
    group: "金融・保険",
    options: [
      { value: "金融アナリスト", label: "金融アナリスト" },
      { value: "投資/ファンド", label: "投資/ファンド" },
      { value: "保険", label: "保険" },
      { value: "フィンテック", label: "フィンテック" },
      { value: "会計/税務", label: "会計/税務" },
      { value: "不動産", label: "不動産" },
    ],
  },
  {
    group: "医療・ヘルスケア",
    options: [
      { value: "医療/ヘルスケア", label: "医療/ヘルスケア" },
      { value: "看護", label: "看護" },
      { value: "薬剤師", label: "薬剤師" },
      { value: "介護/福祉", label: "介護/福祉" },
      { value: "メンタルヘルス", label: "メンタルヘルス" },
      { value: "医療IT", label: "医療IT" },
    ],
  },
  {
    group: "教育・研究",
    options: [
      { value: "教育", label: "教育" },
      { value: "EdTech", label: "EdTech" },
      { value: "講師/トレーナー", label: "講師/トレーナー" },
      { value: "研究員", label: "研究員" },
      { value: "学術/アカデミア", label: "学術/アカデミア" },
    ],
  },
  {
    group: "新領域・先端技術",
    options: [
      { value: "ブロックチェーン/Web3", label: "ブロックチェーン/Web3" },
      { value: "ゲーム開発", label: "ゲーム開発" },
      { value: "ノーコード/ローコード", label: "ノーコード/ローコード" },
      { value: "DX推進", label: "DX推進" },
    ],
  },
];

// Flat list of all domain options (for filter logic compatibility)
const allDomainOptions = domainGroups.flatMap((g) => g.options);

const filterOptions: {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "domain",
    label: "分野",
    options: allDomainOptions,
  },
  {
    key: "pay",
    label: "報酬（時給）",
    options: [
      { value: "0-2500", label: "〜¥2,500" },
      { value: "2500-5000", label: "¥2,500〜5,000" },
      { value: "5000-7500", label: "¥5,000〜7,500" },
      { value: "7500-10000", label: "¥7,500〜10,000" },
      { value: "10000-15000", label: "¥10,000〜15,000" },
      { value: "15000+", label: "¥15,000+" },
    ],
  },
  {
    key: "commitment",
    label: "雇用形態",
    options: [
      { value: "fulltime", label: "正社員" },
      { value: "contract_employee", label: "契約社員" },
      { value: "parttime", label: "パートタイム" },
      { value: "contract", label: "業務委託" },
      { value: "freelance", label: "フリーランス" },
      { value: "internship", label: "インターン" },
      { value: "dispatch", label: "派遣" },
    ],
  },
  {
    key: "location",
    label: "勤務地",
    options: [
      { value: "japan", label: "日本全国" },
      { value: "hokkaido", label: "北海道" },
      { value: "aomori", label: "青森" },
      { value: "iwate", label: "岩手" },
      { value: "miyagi", label: "宮城" },
      { value: "akita", label: "秋田" },
      { value: "yamagata", label: "山形" },
      { value: "fukushima", label: "福島" },
      { value: "ibaraki", label: "茨城" },
      { value: "tochigi", label: "栃木" },
      { value: "gunma", label: "群馬" },
      { value: "saitama", label: "埼玉" },
      { value: "chiba", label: "千葉" },
      { value: "tokyo", label: "東京" },
      { value: "kanagawa", label: "神奈川" },
      { value: "niigata", label: "新潟" },
      { value: "toyama", label: "富山" },
      { value: "ishikawa", label: "石川" },
      { value: "fukui", label: "福井" },
      { value: "yamanashi", label: "山梨" },
      { value: "nagano", label: "長野" },
      { value: "gifu", label: "岐阜" },
      { value: "shizuoka", label: "静岡" },
      { value: "aichi", label: "愛知" },
      { value: "mie", label: "三重" },
      { value: "shiga", label: "滋賀" },
      { value: "kyoto", label: "京都" },
      { value: "osaka", label: "大阪" },
      { value: "hyogo", label: "兵庫" },
      { value: "nara", label: "奈良" },
      { value: "wakayama", label: "和歌山" },
      { value: "tottori", label: "鳥取" },
      { value: "shimane", label: "島根" },
      { value: "okayama", label: "岡山" },
      { value: "hiroshima", label: "広島" },
      { value: "yamaguchi", label: "山口" },
      { value: "tokushima", label: "徳島" },
      { value: "kagawa", label: "香川" },
      { value: "ehime", label: "愛媛" },
      { value: "kochi", label: "高知" },
      { value: "fukuoka", label: "福岡" },
      { value: "saga", label: "佐賀" },
      { value: "nagasaki", label: "長崎" },
      { value: "kumamoto", label: "熊本" },
      { value: "oita", label: "大分" },
      { value: "miyazaki", label: "宮崎" },
      { value: "kagoshima", label: "鹿児島" },
      { value: "okinawa", label: "沖縄" },
      { value: "global", label: "海外" },
    ],
  },
  {
    key: "workArrangement",
    label: "勤務形態",
    options: [
      { value: "full_remote", label: "フルリモート" },
      { value: "remote", label: "リモート可" },
      { value: "hybrid", label: "ハイブリッド" },
      { value: "onsite", label: "オンサイト" },
      { value: "flex", label: "フレックス" },
    ],
  },
];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filters,
  onFilterChange,
}: FilterBarProps) {
  const { user } = useAuth();
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sortLabels: Record<string, string> = {
    newest: "新着順",
    trending: "注目順",
    pay: "報酬順",
    urgency: "緊急度順",
  };

  const activeFilterCount = Object.values(filters).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const handleCheckboxChange = (key: string, value: string) => {
    const current = filters[key as keyof typeof filters];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(key, next);
  };

  const clearAllFilters = () => {
    for (const opt of filterOptions) {
      onFilterChange(opt.key, []);
    }
  };

  const referralLink = user
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/ref/${user.id}`
    : null;

  const handleCopyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5 mb-6">
        {/* Filter button */}
        <div ref={filterRef} className="relative flex-shrink-0">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`group relative flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filterOpen || activeFilterCount > 0
                ? "bg-indigo-700 text-white shadow-md shadow-indigo-300/50"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200/40"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span className="hidden sm:inline">フィルター</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1 bg-white text-indigo-700 text-[10px] font-bold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Filter panel */}
          {filterOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 w-[560px] p-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900">フィルター</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors px-3 py-1 rounded-full hover:bg-indigo-50"
                  >
                    すべてクリア
                  </button>
                )}
              </div>
              <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                {/* Domain filter - grouped */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    分野
                  </h4>
                  <div className="space-y-3">
                    {domainGroups.map((group) => (
                      <div key={group.group}>
                        <p className="text-[11px] font-semibold text-gray-500 mb-1.5 pl-1">
                          {group.group}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.options.map((opt) => {
                            const checked = filters.domain.includes(opt.value);
                            return (
                              <label
                                key={opt.value}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer border-2 transition-all duration-150 select-none ${
                                  checked
                                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    handleCheckboxChange("domain", opt.value)
                                  }
                                  className="sr-only"
                                />
                                {checked && (
                                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                {opt.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other filters - flat */}
                {filterOptions.slice(1).map((section) => (
                  <div key={section.key}>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      {section.label}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((opt) => {
                        const checked = filters[
                          section.key as keyof typeof filters
                        ].includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer border-2 transition-all duration-150 select-none ${
                              checked
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                handleCheckboxChange(section.key, opt.value)
                              }
                              className="sr-only"
                            />
                            {checked && (
                              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="求人タイトルで検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200 placeholder:text-gray-400"
          />
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative flex-shrink-0">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 h-11 px-4 text-sm bg-white border border-gray-200 rounded-xl hover:border-gray-300 text-gray-600 transition-all duration-200 whitespace-nowrap font-medium hover:shadow-sm"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4V4" />
            </svg>
            <span>{sortLabels[sortBy] ?? "新着順"}</span>
            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {sortOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 min-w-[160px] py-2 overflow-hidden">
              {Object.entries(sortLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    onSortChange(key);
                    setSortOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left transition-all duration-150 ${
                    sortBy === key
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {sortBy === key && (
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={sortBy !== key ? "ml-6" : ""}>{label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refer & Earn button - gradient */}
        <button
          onClick={() => setReferralOpen(true)}
          className="hidden sm:flex items-center gap-2.5 h-11 px-6 text-sm bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 text-white rounded-full hover:from-orange-500 hover:via-pink-600 hover:to-rose-600 transition-all duration-200 font-bold flex-shrink-0 whitespace-nowrap shadow-lg shadow-pink-300/40 hover:shadow-xl hover:shadow-pink-300/50 hover:-translate-y-0.5 tracking-wide"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.7 10.7 6.6-3.4M8.7 13.3l6.6 3.4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </svg>
          紹介して報酬GET
        </button>
      </div>

      {/* Referral Modal */}
      {referralOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative overflow-hidden">
            {/* Gradient header */}
            <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-500 p-6 pb-8">
              <button
                onClick={() => setReferralOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.7 10.7 6.6-3.4M8.7 13.3l6.6 3.4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">紹介して報酬GET</h2>
                <p className="text-sm text-white/80 mt-1">
                  友達を紹介して、採用されると紹介報酬を獲得できます
                </p>
              </div>
            </div>

            <div className="p-6 -mt-3">
              {/* Referral link or login prompt */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">
                  あなたの紹介リンク
                </label>
                {referralLink ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="flex-1 h-11 px-4 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 select-all focus:outline-none focus:border-indigo-300"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`h-11 px-4 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
                        copied
                          ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200/50"
                      }`}
                    >
                      {copied ? "コピー済み" : "コピー"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-amber-800 font-medium">ログインしてください</p>
                    <a
                      href="/login"
                      className="ml-auto text-sm font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                    >
                      ログイン
                    </a>
                  </div>
                )}
              </div>

              {/* Share options - only show when logged in */}
              {referralLink && (
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-500 mb-2.5 block uppercase tracking-wider">
                    共有する
                  </label>
                  <div className="flex gap-2">
                    {/* LINE */}
                    <a
                      href={`https://line.me/R/share?text=${encodeURIComponent("Michibikiで一緒に働きませんか？ " + referralLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 h-11 text-sm font-semibold bg-[#06C755] text-white rounded-xl hover:opacity-90 transition-all duration-200 shadow-sm"
                    >
                      <span className="font-bold text-xs">LINE</span>
                    </a>
                    {/* Twitter/X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Michibikiで一緒に働きませんか？ " + referralLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 h-11 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:opacity-90 transition-all duration-200 shadow-sm"
                    >
                      <span className="font-bold text-xs">X</span>
                    </a>
                    {/* Email */}
                    <a
                      href={`mailto:?subject=${encodeURIComponent("Michibikiへの招待")}&body=${encodeURIComponent("Michibikiで一緒に働きませんか？\n\n" + referralLink)}`}
                      className="flex-1 flex items-center justify-center gap-1.5 h-11 text-sm font-semibold bg-gray-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">メール</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Bonus explanation */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                  </svg>
                  紹介報酬について
                </h4>
                <ul className="text-xs text-indigo-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    紹介した方が登録すると <strong>¥1,000</strong> のボーナス
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    紹介した方が採用されると <strong>¥50,000</strong> のボーナス
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    紹介人数に上限はありません
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

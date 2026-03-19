"use client";

import { useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/ExploreHeader";

const interviewTypes = [
  {
    title: "ソフトウェアエンジニアリング",
    category: "software_engineering",
    duration: "20分",
    format: ["ビデオ", "コーディング"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    description: "アルゴリズム、システム設計、コーディング実技を含む総合的な技術面接です。",
  },
  {
    title: "データサイエンス",
    category: "data_science",
    duration: "25分",
    format: ["ビデオ", "ケーススタディ"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description: "統計分析、機械学習、データ可視化に関するケーススタディ形式の面接です。",
  },
  {
    title: "プロダクトマネジメント",
    category: "product_management",
    duration: "20分",
    format: ["ビデオ", "ケーススタディ"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    description: "プロダクト戦略、優先順位付け、ユーザー理解力を評価する面接です。",
  },
  {
    title: "デザイン",
    category: "design",
    duration: "15分",
    format: ["ビデオ", "ポートフォリオレビュー"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    description: "UI/UXデザインの思考プロセスとポートフォリオについて議論する面接です。",
  },
  {
    title: "ビジネス・コンサルティング",
    category: "business_consulting",
    duration: "20分",
    format: ["ビデオ", "ケーススタディ"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: "ビジネス分析、問題解決力、コミュニケーション力を評価する面接です。",
  },
  {
    title: "医療・ヘルスケア",
    category: "healthcare",
    duration: "25分",
    format: ["ビデオ", "専門知識テスト"],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    description: "医療知識、臨床判断力、ヘルスケア業界の理解を評価する面接です。",
  },
];

export default function InterviewPage() {
  const router = useRouter();

  const handlePractice = (category: string) => {
    router.push(`/interview/practice?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="interview" />
      <TopBar />

      {/* Main content */}
      <main className="md:ml-[96px] pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">面接練習</h1>
            <p className="text-sm text-gray-500">
              あなたの専門分野に合わせた面接を練習できます。それぞれの面接は専門家が設計した質問で構成されています。
            </p>
          </div>

          {/* Interview type cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {interviewTypes.map((type) => (
              <div
                key={type.title}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="text-indigo-600 mb-4">{type.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{type.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{type.description}</p>
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{type.duration}</span>
                  {type.format.map((f) => (
                    <span key={f} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handlePractice(type.category)}
                  className="w-full text-center text-sm bg-indigo-600 text-white px-3 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  練習する
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

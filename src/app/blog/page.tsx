"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ExploreHeader";
import Link from "next/link";

type Category = "すべて" | "AI・テクノロジー" | "キャリア" | "企業事例" | "プラットフォーム更新";

const categories: Category[] = ["すべて", "AI・テクノロジー", "キャリア", "企業事例", "プラットフォーム更新"];

const articles = [
  {
    id: 1,
    title: "AIスキル評価の未来：APEXスコアが変える採用プロセス",
    excerpt:
      "従来の書類選考や面接だけでは見抜けなかったスキルを、AIがどのように可視化し、公平な採用を実現するのか。APEXスコアの仕組みと活用事例を詳しく解説します。",
    date: "2026年3月10日",
    category: "AI・テクノロジー" as Category,
    readTime: "8分",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "リモートワーク時代のキャリア戦略：グローバル人材として活躍するために",
    excerpt:
      "場所を選ばない働き方が主流になる中、国際的なプロジェクトに参画するために必要なスキルセットとマインドセット。成功者のインタビューを交えてお伝えします。",
    date: "2026年3月3日",
    category: "キャリア" as Category,
    readTime: "6分",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    title: "導入企業インタビュー：株式会社テックフォワードの採用改革",
    excerpt:
      "Michibikiの導入により採用コストを40%削減し、採用期間を半分に短縮した株式会社テックフォワード。人事責任者に聞く、AI人材マッチングの実力とは。",
    date: "2026年2月25日",
    category: "企業事例" as Category,
    readTime: "10分",
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "プラットフォーム更新：新機能「チームマッチング」をリリース",
    excerpt:
      "個人だけでなく、プロジェクトに最適なチーム全体をAIが提案する新機能を公開しました。機能の使い方と、チーム構成のベストプラクティスをご紹介します。",
    date: "2026年2月18日",
    category: "プラットフォーム更新" as Category,
    readTime: "5分",
    color: "bg-orange-500",
  },
  {
    id: 5,
    title: "2026年のテック人材市場：需要が高まるスキルTOP10",
    excerpt:
      "当社の採用データを分析し、2026年に特に需要が高まるスキルをランキング形式で発表。生成AI、クラウドネイティブ、サイバーセキュリティなど注目分野を解説。",
    date: "2026年2月10日",
    category: "AI・テクノロジー" as Category,
    readTime: "7分",
    color: "bg-blue-500",
  },
  {
    id: 6,
    title: "フリーランスエンジニアの確定申告ガイド2026年版",
    excerpt:
      "Michibikiで活躍するフリーランスエンジニア向けに、確定申告のポイントを税理士監修のもとわかりやすく解説。インボイス制度対応についても最新情報をお届けします。",
    date: "2026年2月1日",
    category: "キャリア" as Category,
    readTime: "12分",
    color: "bg-emerald-500",
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("すべて");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = articles.filter((a) => {
    const matchCategory = activeCategory === "すべて" || a.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <Sidebar />
      <main className="ml-[96px] min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">ホーム</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">ブログ</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ブログ</h1>
            <p className="text-gray-600">AI採用、キャリア、テクノロジーに関する最新情報をお届けします。</p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="記事を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">該当する記事が見つかりませんでした。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  {/* Thumbnail placeholder */}
                  <div className={`h-44 ${article.color} flex items-center justify-center`}>
                    <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-400">{article.readTime}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">{article.excerpt}</p>
                    <p className="text-xs text-gray-400">{article.date}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

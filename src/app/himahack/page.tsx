"use client";

import { Sidebar, TopBar } from "@/components/ExploreHeader";

export default function HimahackPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="himahack" />

      <div className="flex-1 md:ml-[72px]">
        <TopBar />

        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          {/* Gift box icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-8">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Coming Soon
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            HIMAHACK — 暇を、趣味に。
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            毎月、新しい趣味を始められるキット（材料＋説明書）をお届けする
            <br />
            サブスク型の趣味キット配送サービスです。
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl mb-2">📦</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">毎月届くキット</h3>
              <p className="text-gray-400 text-xs">材料と説明書がセットで届く</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">新しい趣味</h3>
              <p className="text-gray-400 text-xs">毎月違うジャンルに挑戦</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl mb-2">🤝</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">コミュニティ</h3>
              <p className="text-gray-400 text-xs">同じ趣味の仲間と繋がる</p>
            </div>
          </div>

          {/* Coming soon note */}
          <p className="text-gray-400 text-sm mt-12">
            サービス開始時にお知らせします。お楽しみに！
          </p>
        </main>
      </div>
    </div>
  );
}

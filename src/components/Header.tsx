"use client";

import { useState } from "react";
import { LogoDark } from "@/components/Logo";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <LogoDark size="sm" showBrandName />

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">
              特徴
            </a>
            <a href="#jobs" className="text-gray-300 hover:text-white transition-colors text-sm">
              求人情報
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm">
              仕組み
            </a>
            <a href="#talent" className="text-gray-300 hover:text-white transition-colors text-sm">
              人材ストーリー
            </a>
            <a href="#enterprise" className="text-gray-300 hover:text-white transition-colors text-sm">
              企業向け
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-gray-300 hover:text-white transition-colors text-sm px-4 py-2">
              ログイン
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-5 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-500/25">
              働き始める
            </button>
          </div>

          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-300 hover:text-white text-sm py-2">特徴</a>
            <a href="#jobs" className="block text-gray-300 hover:text-white text-sm py-2">求人情報</a>
            <a href="#how-it-works" className="block text-gray-300 hover:text-white text-sm py-2">仕組み</a>
            <a href="#talent" className="block text-gray-300 hover:text-white text-sm py-2">人材ストーリー</a>
            <a href="#enterprise" className="block text-gray-300 hover:text-white text-sm py-2">企業向け</a>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button className="text-gray-300 text-sm py-2">ログイン</button>
              <button className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg">働き始める</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

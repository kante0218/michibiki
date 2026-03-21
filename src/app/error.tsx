"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30 flex flex-col">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center px-4 py-3 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="header" iconOnly showBrandName />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-600 mb-2">エラー</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">問題が発生しました</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            予期しないエラーが発生しました。もう一度お試しいただくか、問題が続く場合はサポートまでお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-indigo-500/25"
            >
              もう一度試す
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition-all"
            >
              トップページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

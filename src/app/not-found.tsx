import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
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
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 3v.01" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-indigo-600 mb-2">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">ページが見つかりません</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            お探しのページは移動または削除された可能性があります。URLをお確かめの上、もう一度お試しください。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-indigo-500/25"
            >
              トップページへ
            </Link>
            <Link
              href="/help"
              className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition-all"
            >
              ヘルプセンター
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

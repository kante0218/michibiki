import Link from "next/link";
import Logo from "@/components/Logo";

export default function PublicHeader() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="header" iconOnly showBrandName />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/for-companies" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
              企業向け
            </Link>
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
              料金プラン
            </Link>
            <Link href="/cases" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
              導入事例
            </Link>
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
              ブログ
            </Link>
            <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors">
              ヘルプ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/contact" className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
            お問い合わせ
          </Link>
          <Link href="/login" className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md transition-colors font-medium">
            ログイン
          </Link>
        </div>
      </div>
    </header>
  );
}

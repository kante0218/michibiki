import { LogoDark } from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#0b1633] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <LogoDark size="header" iconOnly showBrandName />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              AIが最適な人材と企業をマッチング。
              日本の働き方を変える、次世代プラットフォーム。
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">求職者向け</h4>
            <ul className="space-y-2.5">
              <li><a href="/explore" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">求人を探す</a></li>
              <li><a href="/interview" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">スキル評価を受ける</a></li>
              <li><a href="/interview" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">APEX スコア</a></li>
              <li><a href="/help" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">ヘルプセンター</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">企業向け</h4>
            <ul className="space-y-2.5">
              <li><a href="/for-companies" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">AI採用支援</a></li>
              <li><a href="/pricing" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">料金プラン</a></li>
              <li><a href="/cases" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">導入事例</a></li>
              <li><a href="/roi-calculator" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">ROI計算ツール</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">会社情報</h4>
            <ul className="space-y-2.5">
              <li><a href="/about" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">私たちについて</a></li>
              <li><a href="/blog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">ブログ</a></li>
              <li><a href="/careers" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">採用情報</a></li>
              <li><a href="/contact" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">お問い合わせ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            &copy; 2026 Michibiki 導 株式会社. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              利用規約
            </a>
            <a href="/privacy" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              プライバシーポリシー
            </a>
            <a href="/legal" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              特定商取引法
            </a>
            <a href="/security" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              セキュリティ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "リモートワーク求人 - 在宅勤務・フルリモートの仕事を探す",
  description:
    "リモートワーク・在宅勤務・フルリモートの求人をAIマッチングで探す。エンジニア、デザイナー、マーケターなど幅広い職種のリモート求人を掲載。場所を選ばない自由な働き方を実現。",
  keywords: [
    "リモートワーク 求人", "在宅勤務 求人", "フルリモート 求人", "テレワーク 求人",
    "リモート エンジニア", "在宅 エンジニア", "リモートワーク 転職",
    "フリーランス リモート", "副業 リモート", "海外 リモートワーク",
  ],
  openGraph: {
    title: "リモートワーク求人 | みちびき 導",
    description: "フルリモート・在宅勤務の求人をAIマッチングで探す。",
  },
  alternates: {
    canonical: "https://michibiki.tech/remote-jobs",
  },
};

export default function RemoteJobsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2"><Logo size="header" iconOnly showBrandName /></Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">ログイン</Link>
            <Link href="/signup" className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-medium">無料で始める</Link>
          </div>
        </div>
      </header>

      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            リモートワーク求人を<br className="md:hidden" />AIで見つける
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            フルリモート・在宅勤務・ハイブリッドワークの求人をAIが最適マッチング。
            場所を選ばない自由な働き方を実現しましょう。
          </p>
          <Link href="/signup" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            リモート求人を探す
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">リモートワーク求人の職種</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "エンジニア", d: "フロントエンド、バックエンド、フルスタック、インフラ、モバイル開発など", c: "500+" },
              { t: "デザイナー", d: "UI/UXデザイン、Webデザイン、グラフィックデザインなど", c: "100+" },
              { t: "マーケター", d: "デジタルマーケティング、SEO、コンテンツマーケティングなど", c: "80+" },
              { t: "PM/PdM", d: "プロジェクトマネージャー、プロダクトマネージャーなど", c: "60+" },
              { t: "データサイエンティスト", d: "データ分析、機械学習、BI、データエンジニアリングなど", c: "70+" },
              { t: "カスタマーサクセス", d: "カスタマーサポート、テクニカルサポート、CSMなど", c: "40+" },
            ].map((cat) => (
              <div key={cat.t} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{cat.t}</h3>
                  <span className="text-xs text-indigo-600 font-semibold">{cat.c}件</span>
                </div>
                <p className="text-sm text-gray-500">{cat.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">理想のリモートワークを見つけよう</h2>
          <p className="text-indigo-100 mb-8">AIがあなたのスキルと希望条件から最適なリモート求人をマッチング。</p>
          <Link href="/signup" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">無料で登録する</Link>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray prose-sm">
          <h2 className="text-xl font-bold text-gray-900">リモートワーク求人について</h2>
          <p className="text-gray-600">
            導（みちびき）では、フルリモート、在宅勤務、テレワーク、ハイブリッドワークなど、柔軟な働き方ができる求人を多数掲載しています。
            エンジニア、デザイナー、マーケター、プロダクトマネージャー、データサイエンティストなど、幅広い職種でリモートワークの求人が見つかります。
            日本国内はもちろん、海外企業のリモートポジション、時差を活かしたグローバルな働き方も実現できます。
            副業・フリーランス・業務委託のリモート案件も豊富に掲載。自分らしい働き方を見つけましょう。
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="header" iconOnly showBrandName />
          <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link href="/explore" className="hover:text-gray-600">求人を探す</Link>
            <Link href="/engineer-jobs" className="hover:text-gray-600">エンジニア求人</Link>
            <Link href="/ai-interview" className="hover:text-gray-600">AI面接練習</Link>
            <Link href="/for-companies" className="hover:text-gray-600">企業向け</Link>
            <Link href="/terms" className="hover:text-gray-600">利用規約</Link>
          </nav>
          <p className="text-xs text-gray-400">&copy; 2026 Michibiki</p>
        </div>
      </footer>
    </div>
  );
}

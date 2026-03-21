import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "エンジニア求人 - AIマッチングで最適な転職先を発見",
  description:
    "エンジニア・プログラマーの求人をAIマッチングで探す。フロントエンド、バックエンド、フルスタック、インフラ、SRE、機械学習エンジニアなど幅広い職種の求人を掲載。リモートワーク可、年収UP転職をAIがサポート。",
  keywords: [
    "エンジニア 求人", "エンジニア 転職", "プログラマー 求人", "IT転職",
    "Webエンジニア 求人", "フロントエンド 求人", "バックエンド 求人",
    "フルスタック 求人", "インフラエンジニア 求人", "SRE 求人",
    "機械学習エンジニア 求人", "AIエンジニア 求人", "リモート エンジニア",
    "エンジニア 年収", "エンジニア 未経験", "エンジニア転職 サイト",
  ],
  openGraph: {
    title: "エンジニア求人 - AIマッチングで最適な転職先を発見 | みちびき 導",
    description: "AIがスキルを分析し最適なエンジニア求人をマッチング。",
  },
  alternates: {
    canonical: "https://michibiki.tech/engineer-jobs",
  },
};

const jobCategories = [
  { title: "フロントエンドエンジニア", skills: "React, Vue.js, TypeScript, Next.js", count: "200+" },
  { title: "バックエンドエンジニア", skills: "Python, Go, Java, Node.js", count: "300+" },
  { title: "フルスタックエンジニア", skills: "React + Node.js, Next.js, Rails", count: "150+" },
  { title: "インフラ / SRE", skills: "AWS, GCP, Kubernetes, Terraform", count: "100+" },
  { title: "機械学習 / AIエンジニア", skills: "Python, TensorFlow, PyTorch", count: "80+" },
  { title: "モバイルエンジニア", skills: "Swift, Kotlin, Flutter, React Native", count: "120+" },
  { title: "データエンジニア", skills: "Spark, Airflow, BigQuery, dbt", count: "90+" },
  { title: "セキュリティエンジニア", skills: "ペネトレーションテスト, SIEM, SOC", count: "50+" },
];

export default function EngineerJobsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="header" iconOnly showBrandName />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">ログイン</Link>
            <Link href="/signup" className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-medium">無料で始める</Link>
          </div>
        </div>
      </header>

      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            エンジニア求人を<br className="md:hidden" />AIで見つける
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            あなたのスキル・経験・希望条件をAIが分析し、最適なエンジニア求人をマッチング。
            リモートワーク可、年収UP転職も。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-center">
              無料で求人を探す
            </Link>
            <Link href="/explore" className="w-full sm:w-auto text-indigo-600 border border-indigo-200 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors text-center">
              求人一覧を見る
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">職種別エンジニア求人</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {jobCategories.map((cat) => (
              <div key={cat.title} className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{cat.title}</h3>
                  <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-full">{cat.count}件</span>
                </div>
                <p className="text-sm text-gray-500">{cat.skills}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">AIマッチングの特徴</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "スキルベースマッチング", d: "履歴書だけでなく、AI面接で測定した実際のスキルレベルで求人をマッチング。" },
              { t: "年収レンジの透明化", d: "すべての求人に年収レンジを明示。年収UP転職をサポートします。" },
              { t: "リモート求人多数", d: "フルリモート、ハイブリッドなど柔軟な働き方の求人を多数掲載。" },
            ].map((f) => (
              <div key={f.t} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">{f.t}</h3>
                <p className="text-sm text-gray-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">エンジニア転職を始めよう</h2>
          <p className="text-indigo-100 mb-8">AIがあなたに最適な求人を見つけます。まずは無料登録から。</p>
          <Link href="/signup" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
            無料で登録する
          </Link>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray prose-sm">
          <h2 className="text-xl font-bold text-gray-900">エンジニア転職をAIがサポート</h2>
          <p className="text-gray-600">
            導（みちびき）は、エンジニア・プログラマー専門のAI転職プラットフォームです。
            Python、JavaScript、TypeScript、Go、Rust、Java、Swiftなど、あなたが使用するプログラミング言語や
            React、Vue.js、Next.js、Django、Spring Boot、Kubernetesなどのフレームワーク・ツールのスキルをAIが正確に評価。
            フロントエンドエンジニア、バックエンドエンジニア、フルスタックエンジニア、SRE、DevOps、
            機械学習エンジニア、データエンジニアなど、あなたの専門分野に最適な求人を提案します。
            未経験からのエンジニア転職、年収600万円以上のシニアポジション、CTO候補など、キャリアステージに合わせた求人をご用意しています。
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="header" iconOnly showBrandName />
          <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link href="/explore" className="hover:text-gray-600">求人を探す</Link>
            <Link href="/ai-interview" className="hover:text-gray-600">AI面接練習</Link>
            <Link href="/remote-jobs" className="hover:text-gray-600">リモート求人</Link>
            <Link href="/for-companies" className="hover:text-gray-600">企業向け</Link>
            <Link href="/terms" className="hover:text-gray-600">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-600">プライバシー</Link>
          </nav>
          <p className="text-xs text-gray-400">&copy; 2026 Michibiki</p>
        </div>
      </footer>
    </div>
  );
}

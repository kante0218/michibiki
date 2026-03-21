import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "企業向けAI採用支援 - 採用コスト削減・ミスマッチ防止",
  description:
    "導（みちびき）の企業向けAI採用支援。AIが候補者のスキルを客観的に評価し、最適な人材をマッチング。採用コスト削減、選考時間短縮、ミスマッチ防止を実現。エンジニア採用・グローバル人材採用に最適。",
  keywords: [
    "AI採用", "AI人材マッチング", "エンジニア採用", "採用支援", "採用コスト削減",
    "人材マッチング", "スキル評価", "適性検査 AI", "採用効率化", "ミスマッチ防止",
    "グローバル人材 採用", "リモート人材 採用", "IT人材 採用",
  ],
  openGraph: {
    title: "企業向けAI採用支援 | みちびき 導",
    description: "AIで採用コスト削減・ミスマッチ防止。エンジニア採用に最適。",
  },
  alternates: {
    canonical: "https://michibiki.tech/for-companies",
  },
};

const benefits = [
  {
    title: "採用コスト最大70%削減",
    description: "AIによる一次スクリーニングで、書類選考・一次面接の工数を大幅に削減。人事担当者は最終判断に集中できます。",
    stat: "70%",
    label: "コスト削減",
  },
  {
    title: "選考期間を半分に短縮",
    description: "AIが24時間365日、候補者の面接を実施。従来数週間かかっていた選考プロセスを大幅に短縮します。",
    stat: "50%",
    label: "時間短縮",
  },
  {
    title: "ミスマッチ率を大幅改善",
    description: "AIが技術スキル・コミュニケーション力・カルチャーフィットを多角的に評価。入社後のミスマッチを防止します。",
    stat: "3x",
    label: "定着率向上",
  },
];

export default function ForCompaniesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-600 font-semibold text-sm mb-4">企業向けAI採用支援</p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            AIで採用を変革する
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            AIが候補者のスキルを客観的に評価し、御社に最適な人材をマッチング。
            採用コスト削減・選考時間短縮・ミスマッチ防止を同時に実現します。
          </p>
          <Link href="/signup" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            企業アカウントを作成する
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">導入効果</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="text-center bg-gray-50 rounded-2xl p-8">
                <div className="text-4xl font-bold text-indigo-600 mb-1">{b.stat}</div>
                <div className="text-sm text-indigo-500 font-medium mb-4">{b.label}</div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">AI採用の仕組み</h2>
          <div className="space-y-6">
            {[
              { n: "1", t: "求人情報を登録", d: "必要なスキル・経験・条件を入力するだけ。AIが最適な候補者を自動で探します。" },
              { n: "2", t: "AIが候補者を評価", d: "技術テスト＋ビデオ面接でスキルを多角的に評価。バイアスのない客観的な評価を提供します。" },
              { n: "3", t: "マッチング結果を確認", d: "スキルスコア・面接動画・評価レポートを確認。気になる候補者にすぐコンタクトできます。" },
            ].map((s) => (
              <div key={s.n} className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">{s.n}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.t}</h3>
                  <p className="text-gray-600 text-sm">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">AI採用を始めませんか？</h2>
          <p className="text-indigo-100 mb-8">まずは無料でお試しください。専門スタッフが導入をサポートします。</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
              無料で始める
            </Link>
            <Link href="/cases" className="text-white border border-white/30 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              導入事例を見る
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray prose-sm">
          <h2 className="text-xl font-bold text-gray-900">AI採用支援とは</h2>
          <p className="text-gray-600">
            AI採用支援とは、人工知能を活用して採用プロセスを効率化するサービスです。導（みちびき）では、AIが候補者の技術スキル、
            問題解決能力、コミュニケーション力を客観的に評価し、企業の求める人材像と自動マッチングします。
            エンジニア採用、データサイエンティスト採用、プロダクトマネージャー採用など、専門職の採用に特に効果を発揮します。
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8">対応する採用ニーズ</h2>
          <p className="text-gray-600">
            正社員採用、契約社員採用、業務委託、フリーランス人材の調達、リモートワーク人材の採用、グローバル人材の採用など、
            幅広い採用ニーズに対応しています。IT企業、スタートアップ、大手企業、コンサルティングファームなど、
            業種を問わずご利用いただけます。
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

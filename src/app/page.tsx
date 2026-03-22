"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

/* ─── Scroll-triggered reveal ─── */
function Reveal({ children, className = "", delay = 0, direction = "up" }: { children: ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "scale" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const transforms = { up: "translateY(40px)", left: "translateX(-40px)", right: "translateX(40px)", scale: "scale(0.95)" };
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0, transform: visible ? "none" : transforms[direction],
      transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    }}>{children}</div>
  );
}

/* ─── Mouse glow effect ─── */
function MouseGlow({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      ref.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      ref.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
    }
  }, []);
  return <div ref={ref} onMouseMove={handleMouseMove} className={`absolute inset-0 pointer-events-none ${className}`}
    style={{ background: "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(99,102,241,0.04), transparent 60%)" }} />;
}

const interviewGroups = [
  { group: "IT・エンジニアリング", categories: [
    { title: "ソフトウェアエンジニアリング", category: "software_engineering", description: "アルゴリズム、システム設計、コーディング実技を含む総合的な技術面接です。" },
    { title: "データサイエンス", category: "data_science", description: "統計分析、機械学習、データ可視化に関する実践的な面接です。" },
    { title: "AI・機械学習エンジニア", category: "ai_ml_engineer", description: "深層学習、NLP、LLMの知識と実装力を評価する面接です。" },
    { title: "インフラ・DevOps", category: "infra_devops", description: "クラウド、CI/CD、コンテナ技術の知識を評価する面接です。" },
    { title: "セキュリティエンジニア", category: "security_engineer", description: "脆弱性分析、ネットワークセキュリティの専門面接です。" },
    { title: "モバイルアプリ開発", category: "mobile_development", description: "iOS/Android開発、React Native、Flutterの実践面接です。" },
  ]},
  { group: "デザイン・クリエイティブ", categories: [
    { title: "UI/UXデザイン", category: "design", description: "デザイン思考、ユーザーリサーチ、プロトタイピング力を評価します。" },
    { title: "グラフィックデザイン", category: "graphic_design", description: "ビジュアルデザイン、タイポグラフィ、ブランディングの面接です。" },
    { title: "動画制作・映像", category: "video_production", description: "映像編集、企画力、ストーリーテリングを評価する面接です。" },
  ]},
  { group: "ビジネス・マネジメント", categories: [
    { title: "プロダクトマネジメント", category: "product_management", description: "プロダクト戦略、優先順位付け、ユーザー理解力を評価します。" },
    { title: "ビジネスコンサルティング", category: "business_consulting", description: "ケーススタディ、問題解決力、コミュニケーション力を評価します。" },
    { title: "営業・セールス", category: "sales", description: "提案力、交渉力、顧客対応スキルを評価する面接です。" },
    { title: "マーケティング", category: "marketing", description: "デジタルマーケティング、分析、戦略立案の面接です。" },
  ]},
  { group: "金融・ファイナンス", categories: [
    { title: "金融アナリスト", category: "financial_analyst", description: "財務分析、バリュエーション、リスク管理の専門面接です。" },
    { title: "投資・ファンドマネジメント", category: "investment_fund", description: "ポートフォリオ理論、投資戦略、市場分析の面接です。" },
    { title: "フィンテック", category: "fintech", description: "決済技術、ブロックチェーン、金融規制の面接です。" },
    { title: "会計・税務", category: "accounting_tax", description: "簿記、税法、監査手法の知識を評価する面接です。" },
  ]},
  { group: "医療・ヘルスケア", categories: [
    { title: "医療・臨床", category: "healthcare", description: "臨床知識、診断力、患者対応スキルを評価する面接です。" },
    { title: "看護・介護", category: "nursing_care", description: "ケアプランニング、患者観察、チーム連携の面接です。" },
    { title: "薬剤師・製薬", category: "pharmacy", description: "調剤、薬理学、服薬指導の専門面接です。" },
    { title: "医療IT・ヘルステック", category: "health_tech", description: "電子カルテ、遠隔医療、医療データ分析の面接です。" },
  ]},
  { group: "教育・研究", categories: [
    { title: "教育・講師", category: "education", description: "教育理論、授業設計、生徒指導力を評価する面接です。" },
    { title: "EdTech", category: "edtech", description: "教育テクノロジー、LMS、オンライン教材開発の面接です。" },
    { title: "研究員・アカデミア", category: "research_academia", description: "研究計画、論文作成、学術発表の能力を評価する面接です。" },
  ]},
  { group: "クリエイター・インフルエンサー", categories: [
    { title: "インフルエンサー・SNS", category: "influencer_sns", description: "コンテンツ企画、エンゲージメント、ブランド構築の面接です。" },
    { title: "YouTuber・配信者", category: "youtuber_streamer", description: "動画企画、視聴者分析、収益化戦略の面接です。" },
    { title: "コンテンツクリエイター", category: "content_creator", description: "ライティング、編集、マルチメディア制作の面接です。" },
  ]},
  { group: "コーポレート・管理", categories: [
    { title: "人事・採用", category: "hr_recruitment", description: "採用戦略、労務管理、組織開発の面接です。" },
    { title: "経理・財務", category: "accounting_finance", description: "財務諸表、予算管理、資金調達の面接です。" },
    { title: "法務・コンプライアンス", category: "legal_compliance", description: "契約法、知的財産、コンプライアンス管理の面接です。" },
  ]},
  { group: "新領域・先端技術", categories: [
    { title: "ブロックチェーン・Web3", category: "blockchain_web3", description: "スマートコントラクト、DeFi、NFTの専門面接です。" },
    { title: "ゲーム開発", category: "game_development", description: "Unity/Unreal、ゲームデザイン、3Dモデリングの面接です。" },
    { title: "DX推進・コンサルタント", category: "dx_consultant", description: "デジタル変革、業務改善、テクノロジー導入の面接です。" },
  ]},
];

const steps = [
  { step: "01", title: "準備", description: "面接タイプを選択し、カメラ・マイクの動作確認を行います。練習モードで何度でもリハーサルできます。" },
  { step: "02", title: "面接実施", description: "AIが構造化された質問を行います。ビデオ通話形式で、自然な会話のように進行します。" },
  { step: "03", title: "結果確認", description: "面接終了後、AIがスキルを分析。詳細なフィードバックとスコアを確認できます。" },
];

const features = [
  { title: "再受験可能（最大2回）", description: "結果に満足できなければ、同じ案件で最大2回まで再挑戦できます。",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
  { title: "練習モード無制限", description: "本番前に何度でも練習できます。評価には影響しません。",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /> },
  { title: "AIフィードバック", description: "面接後に詳細なフィードバックとスキル評価を受け取れます。",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
  { title: "日本語完全対応", description: "質問・回答・フィードバックすべて日本語で完結します。",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /> },
];

const faqs = [
  { q: "AI面接はどのように行われますか？", a: "Webブラウザ上でAIとビデオ通話形式で行います。AIが質問を出し、あなたが回答する形式です。自然な会話のように進行し、追加質問もAIが自動で行います。" },
  { q: "面接の結果はどのように使われますか？", a: "面接結果はスキルスコアとしてプロフィールに反映され、企業があなたを見つけやすくなります。スコアが高いほど、より多くの企業からオファーを受ける可能性が高まります。" },
  { q: "不合格になることはありますか？", a: "合格・不合格という概念はありません。あなたのスキルレベルを正確に測定し、そのレベルに合った求人をマッチングします。結果に満足できなければ再受験も可能です。" },
  { q: "どのような環境で受験すべきですか？", a: "安定したインターネット接続、静かな環境、Webカメラとマイクが必要です。Chrome またはEdgeブラウザの最新版を推奨します。" },
  { q: "練習モードと本番の違いは何ですか？", a: "練習モードは何度でも利用でき、結果はプロフィールに反映されません。本番は同じ案件で最大2回まで受験でき、最高スコアがプロフィールに反映されます。" },
];

export default function RootPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => { setTimeout(() => setHeroLoaded(true), 100); }, []);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePractice = (category?: string) => {
    router.push(`/interview/practice${category ? `?category=${category}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-24 pb-10 px-4 overflow-hidden">
        <MouseGlow />
        {/* Parallax gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500 opacity-[0.06] blur-[120px]"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-400 opacity-[0.04] blur-[100px]"
            style={{ transform: `translateY(${scrollY * -0.06}px)` }} />
        </div>
        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-indigo-400/10 animate-pulse pointer-events-none"
            style={{ width: `${16 + i * 10}px`, height: `${16 + i * 10}px`, left: `${12 + i * 18}%`, top: `${20 + (i % 3) * 20}%`, animationDuration: `${3 + i * 0.7}s`, animationDelay: `${i * 0.5}s` }} />
        ))}

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="transition-all duration-700" style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)", transitionDelay: "200ms" }}>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-indigo-100">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              AI搭載の次世代面接
            </div>
          </div>

          {/* Title with shimmer effect */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6 transition-all duration-700"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)", transitionDelay: "400ms" }}>
            AI面接で、あなたの
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto]"
              style={{ animation: "shimmer 3s linear infinite" }}>
              実力を証明
            </span>
            しよう
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10 transition-all duration-700"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)", transitionDelay: "600ms" }}>
            20分間の構造化されたAI面接で、あなたのスキルを客観的に評価。
            面接結果は世界中の企業に共有され、あなたに最適な求人とマッチングされます。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)", transitionDelay: "800ms" }}>
            <button onClick={() => handlePractice()}
              className="group inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 text-base">
              練習を始める
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-8 py-3.5 rounded-xl font-semibold hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 text-base">
              詳しく見る
            </button>
          </div>
        </div>

      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px",
        }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal direction="scale">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">AI面接の流れ</h2>
            <p className="text-gray-500 text-center mb-14 max-w-md mx-auto">3つのステップで、あなたのスキルを客観的に評価します</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 150}>
                <div className="relative group cursor-default bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                  <div className="text-4xl font-bold text-indigo-100 group-hover:text-indigo-500 transition-colors duration-500 mb-3">{s.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-700 transition-colors duration-300">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
                  {/* Connecting line */}
                  {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gray-200" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INTERVIEW TYPES ═══ */}
      <section className="py-20 px-4 relative">
        <MouseGlow />
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="flex items-center gap-2 justify-center mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">Interview Types</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">面接タイプを選ぶ</h2>
            <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
              あなたの専門分野に合わせた面接を受験できます
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {interviewTypes.map((type, i) => (
              <Reveal key={type.title} delay={i * 80}>
                <div className="group border border-gray-200 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{type.icon}</svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">{type.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">{type.description}</p>
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{type.duration}</span>
                      {type.format.map((f) => (
                        <span key={f} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{f}</span>
                      ))}
                    </div>
                    <button onClick={() => handlePractice(type.category)}
                      className="w-full text-center text-sm bg-indigo-600 text-white px-3 py-2.5 rounded-xl hover:bg-indigo-700 transition-all duration-300 font-semibold group-hover:shadow-md">
                      練習する
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(99,102,241,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">AI面接の特長</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="group bg-white rounded-2xl p-6 border border-white hover:border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{f.icon}</svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">よくある質問</h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="border border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-200 transition-colors duration-300">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex items-center justify-between w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-6 pb-5">
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl font-bold text-white mb-4">面接を始めましょう</h2>
            <p className="text-indigo-100/80 mb-10 text-base lg:text-lg leading-relaxed">
              まずは練習モードで体験してみませんか？<br />登録不要で、すぐに始められます。
            </p>
            <button onClick={() => handlePractice()}
              className="group inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-10 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all duration-300 hover:shadow-xl text-base">
              練習を始める
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </Reveal>
        </div>
      </section>

      {/* SEO Content */}
      <section className="sr-only" aria-label="導（みちびき）について">
        <h2>導（みちびき）- AI面接練習・AI人材マッチングプラットフォーム</h2>
        <p>導（みちびき / Michibiki）は、AIを活用した面接練習と人材マッチングのプラットフォームです。ソフトウェアエンジニアリング、データサイエンス、プロダクトマネジメント、デザイン、マーケティングなど33分野のAI面接練習を無料で提供しています。</p>
        <h3>AI面接練習の特徴</h3>
        <p>技術テスト（選択問題5問＋記述問題5問）とAIビデオ面接を組み合わせた実践的な模擬面接です。AIがあなたの弱点を分析し、的確なフィードバックを提供します。</p>
        <h3>企業向けAI採用支援</h3>
        <p>AIが候補者のスキルを客観的に評価し、企業の求める人材像と自動マッチングします。採用コストの削減、選考時間の短縮、ミスマッチの防止を実現します。</p>
      </section>

      <Footer />
    </div>
  );
}

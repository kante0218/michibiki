"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { interviewGroups } from "@/lib/interviewCategories";

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

const steps = [
  { step: "01", title: "プロフィール登録", description: "学校名・専攻・研究テーマなどを登録。あなたの強みをAIが分析します。" },
  { step: "02", title: "AI面接を受ける", description: "専門分野に合わせたAI面接を受験。技術テスト+ビデオ面接で総合評価します。" },
  { step: "03", title: "企業とマッチング", description: "あなたのスキルと志向に合った企業からオファーが届きます。" },
];

const features = [
  { title: "高専生・大学院生に特化", description: "理系学生の専門知識・研究力を正しく評価できる面接を提供します。",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /> },
  { title: "新卒・インターン特化", description: "新卒採用・インターンシップに特化した求人マッチングを実現します。",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /> },
  { title: "AIフィードバック", description: "面接後に詳細なフィードバックとスキル評価を受け取れます。",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
  { title: "学生は完全無料", description: "登録からAI面接、企業マッチングまで、学生は一切費用がかかりません。",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" /> },
];

const faqs = [
  { q: "高専生・大学院生以外も使えますか？", a: "現在は高専生（本科・専攻科）と大学院生（修士・博士）を対象としたサービスです。理系の専門知識を正しく評価するために特化しています。" },
  { q: "AI面接はどのように行われますか？", a: "Webブラウザ上でAIとビデオ通話形式で行います。専門分野に合わせた技術テスト（選択5問+記述5問）とAIビデオ面接を組み合わせた実践的な面接です。" },
  { q: "面接の結果はどのように使われますか？", a: "面接結果はスキルスコアとしてプロフィールに反映され、あなたの専門性に合った企業からオファーが届きます。" },
  { q: "どのような企業が登録していますか？", a: "高専卒・大学院卒を積極採用するメーカー、IT企業、インフラ企業、研究機関などが登録しています。新卒採用・インターンシップの求人が中心です。" },
  { q: "費用はかかりますか？", a: "学生は完全無料です。プロフィール登録、AI面接、企業マッチング、すべて無料でご利用いただけます。" },
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

  const handleStart = (category?: string) => {
    router.push(`/interview/live${category ? `?category=${category}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-24 pb-10 px-4 overflow-hidden">
        <MouseGlow />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500 opacity-[0.06] blur-[120px]"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-400 opacity-[0.04] blur-[100px]"
            style={{ transform: `translateY(${scrollY * -0.06}px)` }} />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-indigo-400/10 animate-pulse pointer-events-none"
            style={{ width: `${16 + i * 10}px`, height: `${16 + i * 10}px`, left: `${12 + i * 18}%`, top: `${20 + (i % 3) * 20}%`, animationDuration: `${3 + i * 0.7}s`, animationDelay: `${i * 0.5}s` }} />
        ))}

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="transition-all duration-700" style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)", transitionDelay: "200ms" }}>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-indigo-100">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              高専生・大学院生のための就活プラットフォーム
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6 transition-all duration-700"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)", transitionDelay: "400ms" }}>
            研究も、就活も、
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto]"
              style={{ animation: "shimmer 3s linear infinite" }}>
              妥協しない
            </span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10 transition-all duration-700"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)", transitionDelay: "600ms" }}>
            AI面接があなたの専門性・研究力・ポテンシャルを正しく評価。
            高専生・大学院生を求める企業と最適にマッチングします。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)", transitionDelay: "800ms" }}>
            <button onClick={() => router.push("/signup")}
              className="group inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 text-base">
              無料で始める
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

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-4 border-y border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "22+", label: "専門分野" },
            { value: "6", label: "面接カテゴリ" },
            { value: "100%", label: "学生無料" },
            { value: "AI", label: "面接・評価" },
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 100}>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px",
        }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal direction="scale">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">就活の流れ</h2>
            <p className="text-gray-500 text-center mb-14 max-w-md mx-auto">3つのステップで、あなたに最適な企業と出会えます</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 150}>
                <div className="relative group cursor-default bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                  <div className="text-4xl font-bold text-indigo-100 group-hover:text-indigo-500 transition-colors duration-500 mb-3">{s.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-700 transition-colors duration-300">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
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
              <span className="text-sm font-semibold text-indigo-600">22+分野対応</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">AI面接の分野を選ぶ</h2>
            <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
              高専・大学院の専門分野に合わせた面接を受験できます
            </p>
          </Reveal>
          <div className="space-y-6">
            {interviewGroups.map((group, gi) => (
              <Reveal key={group.group} delay={gi * 60}>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-indigo-200 hover:shadow-lg transition-all duration-500">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-sm">{group.group}
                      <span className="ml-2 text-xs font-normal text-gray-400">{group.categories.length}分野</span>
                    </h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
                    {group.categories.map((cat) => (
                      <button key={cat.category} onClick={() => handleStart(cat.category)}
                        className="group bg-white p-5 text-left hover:bg-indigo-50/50 transition-colors duration-300">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors mb-1">{cat.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{cat.description}</p>
                        <span className="inline-block mt-2 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">面接を受ける →</span>
                      </button>
                    ))}
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
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">選ばれる理由</h2>
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

      {/* ═══ TARGET AUDIENCE ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">こんな方におすすめ</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            <Reveal delay={0}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.657-5.657a8 8 0 1111.314 0l-5.657 5.657zm0 0L12 21" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">高専生</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">-</span>本科4-5年生で就活を始めたい</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">-</span>専攻科から就職を考えている</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">-</span>高専で学んだ技術力を正しく評価してほしい</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">-</span>メーカーやIT企業でエンジニアとして働きたい</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">大学院生</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-purple-600 mt-0.5">-</span>修士・博士課程で研究と就活を両立したい</li>
                  <li className="flex items-start gap-2"><span className="text-purple-600 mt-0.5">-</span>研究スキルを企業にアピールしたい</li>
                  <li className="flex items-start gap-2"><span className="text-purple-600 mt-0.5">-</span>専門性を活かせる企業を見つけたい</li>
                  <li className="flex items-start gap-2"><span className="text-purple-600 mt-0.5">-</span>研究発表の経験を就活に活かしたい</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">よくある質問</h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="border border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-200 transition-colors duration-300 bg-white">
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
            <h2 className="text-3xl font-bold text-white mb-4">あなたの専門性を、正しく評価する就活を</h2>
            <p className="text-indigo-100/80 mb-10 text-base lg:text-lg leading-relaxed">
              高専・大学院で培った力を活かせる企業と出会いましょう。<br />学生は完全無料です。
            </p>
            <button onClick={() => router.push("/signup")}
              className="group inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-10 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all duration-300 hover:shadow-xl text-base">
              無料で始める
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </Reveal>
        </div>
      </section>

      {/* SEO Content */}
      <section className="sr-only" aria-label="導（みちびき）について">
        <h2>導（みちびき）- 高専生・大学院生の就活・採用プラットフォーム</h2>
        <p>導（みちびき / Michibiki）は、高専生と大学院生に特化したAI面接・採用マッチングプラットフォームです。機械工学、電気電子工学、情報工学、化学工学など22以上の専門分野に対応したAI面接を提供し、理系学生の専門知識・研究力を正しく評価します。</p>
        <h3>高専生・大学院生向けAI面接の特徴</h3>
        <p>技術テスト（選択問題5問＋記述問題5問）とAIビデオ面接を組み合わせた実践的な面接です。研究プレゼンテーション、論文ディスカッション、専門技術の評価を通じて、あなたの強みを可視化します。</p>
        <h3>企業向け高専・大学院生採用支援</h3>
        <p>AIが候補者の専門性・研究力・ポテンシャルを客観的に評価し、企業の求める人材像と自動マッチングします。理系人材の採用に強い、次世代の採用プラットフォームです。</p>
      </section>

      <Footer />
    </div>
  );
}

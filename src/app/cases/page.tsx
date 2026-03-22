"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import Link from "next/link";

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)",
      transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    }}>{children}</div>
  );
}

const visionItems = [
  {
    title: "採用コストを半分以下に",
    description: "面接官の人件費、エージェント手数料、工数 ── AI面接によって採用にかかるコストを大幅に削減し、より多くの候補者と出会える環境を実現します。",
    target: "目標: 導入企業の採用コスト50%削減",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />,
  },
  {
    title: "採用のミスマッチをなくす",
    description: "AIが候補者のスキルを客観的に評価し、企業の求める人材像と精密にマッチング。入社後のギャップを最小限にし、定着率の向上を目指します。",
    target: "目標: マッチング精度90%以上",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />,
  },
  {
    title: "面接プロセスの完全自動化",
    description: "一次面接をAIが完全に代行。録画・評価・レポートまで自動で完了するため、人事担当者はより重要な判断に集中できるようになります。",
    target: "目標: 一次面接の100%自動化",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />,
  },
  {
    title: "グローバル人材へのアクセス",
    description: "言語・時差・地理的制約を超えて、世界中の優秀な人材とつながる。多言語AI面接により、国境を越えた採用を可能にします。",
    target: "目標: 5カ国以上からの人材マッチング",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />,
  },
];

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Header */}
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-indigo-100">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                Vision
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">導が目指すこと</h1>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                導はまだ始まったばかりのサービスです。
                これから一社一社と向き合いながら、以下の未来を実現していきます。
              </p>
            </div>
          </Reveal>

          {/* Current Status */}
          <Reveal>
            <div className="bg-indigo-50 rounded-2xl p-8 mb-16 border border-indigo-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                現在の状況
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-indigo-600">1社</p>
                  <p className="text-xs text-gray-500 mt-1">導入企業</p>
                </div>
                <div className="bg-white rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-gray-400">準備中</p>
                  <p className="text-xs text-gray-500 mt-1">AI面接実績</p>
                </div>
                <div className="bg-white rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-indigo-600">2025年</p>
                  <p className="text-xs text-gray-500 mt-1">サービス開始</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Vision Cards */}
          <div className="space-y-6">
            {visionItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="group bg-white rounded-2xl border border-gray-200 p-8 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.description}</p>
                      <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-100">
                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                        </svg>
                        {item.target}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal>
            <div className="mt-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-3">一緒に採用の未来をつくりませんか？</h2>
                <p className="text-indigo-100/80 mb-8 max-w-lg mx-auto leading-relaxed">
                  導はまだ小さなサービスですが、だからこそ一社一社に丁寧に向き合います。
                  まずはお気軽にご相談ください。
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/contact"
                    className="px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-300 hover:shadow-xl text-sm">
                    お問い合わせ
                  </Link>
                  <Link href="/interview"
                    className="px-8 py-3.5 text-white/80 font-semibold rounded-xl border border-white/20 hover:bg-white/10 transition-all duration-300 text-sm">
                    面接を体験する
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}

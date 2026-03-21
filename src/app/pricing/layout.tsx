import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン - 無料から始めるAI採用",
  description:
    "導（みちびき）の料金プラン。AI面接練習は無料で利用可能。企業向けのAI人材マッチング・採用支援プランもご用意しています。",
  openGraph: {
    title: "料金プラン | みちびき 導",
    description: "AI面接練習は無料。企業向けAI採用支援プランの詳細はこちら。",
  },
  alternates: {
    canonical: "https://michibiki.tech/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

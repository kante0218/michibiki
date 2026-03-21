import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI面接練習 - 33分野対応の模擬面接",
  description:
    "導（みちびき）のAI面接練習で、ソフトウェアエンジニアリング・データサイエンス・マーケティングなど33分野の模擬面接が無料で受けられます。AIが弱点を分析し、実践的なフィードバックを提供します。",
  openGraph: {
    title: "AI面接練習 - 33分野対応の模擬面接 | みちびき 導",
    description:
      "33分野のAI面接練習が無料。技術テスト＋ビデオ面接でスキルを評価し、AIが実践的なフィードバックを提供します。",
  },
  alternates: {
    canonical: "https://michibiki.tech/interview",
  },
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

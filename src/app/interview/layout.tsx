import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI面接練習 | 33分野対応・無料で模擬面接",
  description:
    "導（みちびき）のAI面接練習。IT・金融・医療・教育・デザインなど33分野に対応。選択5問+記述5問のテスト後、AIビデオ面接で実力を評価。完全無料で何度でも練習可能。",
  keywords: [
    "AI面接",
    "面接練習",
    "模擬面接",
    "AI面接対策",
    "技術面接",
    "面接準備",
    "オンライン面接練習",
    "無料面接練習",
  ],
  openGraph: {
    title: "AI面接練習 | 33分野対応・無料で模擬面接",
    description:
      "33分野に対応したAI面接練習。技術テストとAIビデオ面接で実践的な面接対策ができます。",
  },
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

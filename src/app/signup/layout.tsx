import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新規登録",
  description:
    "導（みちびき）に無料登録して、AI面接練習・AIマッチングを体験しましょう。求職者も企業も簡単に登録できます。",
  openGraph: {
    title: "新規登録 | みちびき 導",
    description: "無料登録してAI面接練習・AIマッチングを体験。",
  },
  alternates: {
    canonical: "https://michibiki.tech/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

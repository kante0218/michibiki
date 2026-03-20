import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブログ | AI採用・面接・キャリアの最新情報",
  description:
    "導（みちびき）のブログ。AI面接、人材マッチング、キャリアアップ、転職活動のヒントなど、最新の採用トレンド情報をお届けします。",
  openGraph: {
    title: "ブログ | AI採用・面接・キャリアの最新情報",
    description: "AI面接、人材マッチング、キャリアアップの最新情報をお届け。",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

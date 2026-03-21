import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブログ - AI面接・採用の最新情報",
  description:
    "導（みちびき）公式ブログ。AI面接のコツ、転職・就職活動のアドバイス、AI採用の最新トレンドなど、キャリアに役立つ情報を発信しています。",
  openGraph: {
    title: "ブログ - AI面接・採用の最新情報 | みちびき 導",
    description: "AI面接のコツ、転職活動のアドバイス、AI採用トレンドをお届け。",
  },
  alternates: {
    canonical: "https://michibiki.tech/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

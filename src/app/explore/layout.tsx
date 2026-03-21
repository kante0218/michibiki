import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "求人を探す - AIマッチングで最適な仕事を発見",
  description:
    "導（みちびき）のAIマッチングで、あなたのスキル・経験・志向に合った最適な求人を見つけましょう。エンジニア、データサイエンティスト、デザイナーなど幅広い職種の求人を掲載。",
  openGraph: {
    title: "求人を探す - AIマッチングで最適な仕事を発見 | みちびき 導",
    description: "AIがあなたのスキルを分析し、最適な求人をマッチング。",
  },
  alternates: {
    canonical: "https://michibiki.tech/explore",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

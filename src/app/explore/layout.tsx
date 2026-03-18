import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "求人を探す",
  description: "AIが厳選した求人情報を閲覧。スキルや経験に最適な仕事が見つかります。リモートワーク・フリーランス案件も豊富。",
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}

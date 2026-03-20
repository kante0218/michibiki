import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "導入事例 | AI採用で成果を上げた企業のストーリー",
  description:
    "導（みちびき）を活用してAI人材マッチングで採用成功した企業の事例を紹介。どのように最適な人材を見つけたかをご覧ください。",
  openGraph: {
    title: "導入事例 | AI採用で成果を上げた企業",
    description: "AI人材マッチングで採用成功した企業の事例集。",
  },
};

export default function CasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

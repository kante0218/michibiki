import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "導入事例 - AI採用の成功事例",
  description:
    "導（みちびき）を導入した企業の成功事例をご紹介。AI面接・AIマッチングによる採用効率化、コスト削減、ミスマッチ防止の実績をご覧いただけます。",
  openGraph: {
    title: "導入事例 - AI採用の成功事例 | みちびき 導",
    description: "AI面接・AIマッチングで採用を効率化した企業事例をご紹介。",
  },
  alternates: {
    canonical: "https://michibiki.tech/cases",
  },
};

export default function CasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

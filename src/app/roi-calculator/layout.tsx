import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI計算ツール - AI採用のコスト削減効果を試算",
  description:
    "導（みちびき）のAI採用支援を導入した場合のコスト削減効果をシミュレーション。年間採用人数や現在の採用コストを入力するだけで、削減額を即座に試算できます。",
  keywords: [
    "AI採用 コスト削減", "採用コスト 計算", "ROI 採用", "採用効率化 試算",
    "人材採用 コスト", "AI面接 効果", "採用コスト削減 シミュレーション",
  ],
  openGraph: {
    title: "ROI計算ツール | みちびき 導",
    description: "AI採用のコスト削減効果を無料で試算",
  },
  alternates: {
    canonical: "https://michibiki.tech/roi-calculator",
  },
};

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

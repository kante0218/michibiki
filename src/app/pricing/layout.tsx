import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "みちびきの料金プランをご確認ください。求職者は完全無料。企業向けプランも豊富にご用意しています。",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

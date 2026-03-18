import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "みちびきのプライバシーポリシーです。お客様の個人情報の取り扱いについて説明しています。",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

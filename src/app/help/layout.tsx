import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ヘルプ・よくある質問",
  description:
    "導（みちびき）のヘルプセンター。AI面接の受け方、アカウント設定、企業向け機能の使い方など、よくある質問にお答えします。",
  openGraph: {
    title: "ヘルプ・よくある質問 | みちびき 導",
    description: "導（みちびき）の使い方・よくある質問はこちら。",
  },
  alternates: {
    canonical: "https://michibiki.tech/help",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

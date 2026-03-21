import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "採用情報 - みちびきで働く",
  description:
    "導（みちびき）の採用情報。AI・機械学習エンジニア、プロダクトマネージャーなど、AIで採用を変革するチームメンバーを募集しています。",
  openGraph: {
    title: "採用情報 | みちびき 導",
    description: "AIで採用を変革するチームで働きませんか？導（みちびき）の求人情報はこちら。",
  },
  alternates: {
    canonical: "https://michibiki.tech/careers",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "採用情報 | 導（みちびき）で一緒に働きませんか",
  description:
    "導（みちびき）の採用情報。AI・機械学習エンジニア、プロダクトマネージャーなど、AIで採用の未来を変える仲間を募集しています。",
  openGraph: {
    title: "採用情報 | 導（みちびき）",
    description: "AIで採用の未来を変える仲間を募集中。",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

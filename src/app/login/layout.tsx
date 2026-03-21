import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description:
    "導（みちびき）にログインして、AI面接練習・求人検索・AIマッチングをご利用ください。",
  openGraph: {
    title: "ログイン | みちびき 導",
    description: "導（みちびき）へのログインはこちら。",
  },
  alternates: {
    canonical: "https://michibiki.tech/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description: "みちびきにログインして、AIマッチングで最適な仕事を見つけましょう。",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

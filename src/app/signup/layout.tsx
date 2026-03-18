import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新規登録",
  description: "みちびきに無料登録して、AIが最適な仕事をマッチング。グローバルな求人に出会えます。",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

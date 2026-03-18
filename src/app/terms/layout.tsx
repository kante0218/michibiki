import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description: "みちびきの利用規約です。サービスをご利用いただく前にお読みください。",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

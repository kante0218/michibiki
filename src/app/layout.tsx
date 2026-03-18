import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "Michibiki 導 | AIが見つける、最適な仕事と人材",
  description:
    "Michibikiは、AIを活用して世界中の優秀な人材と企業を最適にマッチングするプラットフォームです。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&family=Yuji+Boku&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

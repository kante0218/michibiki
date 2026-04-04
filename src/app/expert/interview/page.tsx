"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExpertInterviewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-500 text-sm">リダイレクト中...</p>
    </div>
  );
}

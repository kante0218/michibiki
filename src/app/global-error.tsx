"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ textAlign: "center", maxWidth: 400, padding: "0 16px" }}>
            <div style={{ width: 80, height: 80, background: "#fee2e2", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: 8 }}>システムエラー</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 12 }}>問題が発生しました</h1>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
              システムに問題が発生しました。もう一度お試しください。
            </p>
            <button
              onClick={reset}
              style={{ padding: "10px 24px", background: "#4f46e5", color: "#fff", fontSize: 14, fontWeight: 500, borderRadius: 12, border: "none", cursor: "pointer" }}
            >
              もう一度試す
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

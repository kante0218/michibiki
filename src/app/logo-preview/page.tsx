"use client";

import { useEffect } from "react";

export default function LogoPreview() {
  useEffect(() => {
    // Load Google Fonts for brush/calligraphy styles
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Zen+Antique&family=Shippori+Mincho+B1:wght@800&family=Yuji+Boku&family=Yuji+Mai&family=Yuji+Syuku&family=Hina+Mincho&family=Kaisei+Opti:wght@700&family=Kaisei+Tokumin:wght@700&family=Kaisei+HarunoUmi:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
          Michibiki 導 ロゴ案 v2
        </h1>
        <p className="text-center text-gray-500 mb-4 text-sm">
          筆文字・書道風 × インディゴ/パープルカラー
        </p>
        <p className="text-center text-gray-400 mb-16 text-xs">
          「燈 AKARI」のような伝統的な筆のテイストを、Webの色味と統合
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

          {/* ── 案1: 筆文字 × インディゴ角丸 ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-indigo-600 to-purple-700 blur-lg opacity-30" />
              <div className="relative w-24 h-24 rounded-[22px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-2xl">
                <span
                  className="text-white text-[42px] leading-none"
                  style={{ fontFamily: "'Yuji Boku', serif" }}
                >
                  導
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案1</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Yuji Boku（毛筆）</p>
              <p className="text-[10px] text-gray-400">インディゴグラデ</p>
            </div>
          </div>

          {/* ── 案2: 書道風 × ダークネイビー ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-[22px] bg-indigo-950 flex items-center justify-center shadow-2xl shadow-indigo-950/40">
              <span
                className="text-[42px] leading-none"
                style={{
                  fontFamily: "'Yuji Syuku', serif",
                  background: "linear-gradient(180deg, #e0e7ff, #a5b4fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                導
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案2</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Yuji Syuku（楷書）</p>
              <p className="text-[10px] text-gray-400">ダークネイビー × 淡グラデ文字</p>
            </div>
          </div>

          {/* ── 案3: 白抜き筆文字 × 円形 ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-md opacity-25" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-xl">
                <span
                  className="text-white text-[40px] leading-none"
                  style={{ fontFamily: "'Yuji Mai', serif" }}
                >
                  導
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案3</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Yuji Mai（行書）</p>
              <p className="text-[10px] text-gray-400">円形 × パープルグラデ</p>
            </div>
          </div>

          {/* ── 案4: 枠線筆文字 × ミニマル ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-[22px] border-2 border-indigo-700 bg-white flex items-center justify-center shadow-sm">
              <span
                className="text-[42px] leading-none"
                style={{
                  fontFamily: "'Yuji Boku', serif",
                  background: "linear-gradient(135deg, #4338ca, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                導
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案4</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Yuji Boku（毛筆）</p>
              <p className="text-[10px] text-gray-400">白地 × インディゴ枠</p>
            </div>
          </div>

          {/* ── 案5: 和紙風テクスチャ ── */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative w-24 h-24 rounded-[22px] flex items-center justify-center shadow-xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #312e81 0%, #3730a3 40%, #4338ca 100%)",
              }}
            >
              {/* Washi texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <span
                className="relative text-white text-[42px] leading-none"
                style={{
                  fontFamily: "'Kaisei HarunoUmi', serif",
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                導
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案5</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Kaisei HarunoUmi</p>
              <p className="text-[10px] text-gray-400">和紙風テクスチャ × 深藍</p>
            </div>
          </div>

          {/* ── 案6: グラデ枠 × 書道 ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-[22px] bg-gradient-to-br from-indigo-500 to-purple-600 p-[3px] shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full rounded-[19px] bg-white flex items-center justify-center">
                <span
                  className="text-[42px] leading-none"
                  style={{
                    fontFamily: "'Yuji Boku', serif",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  導
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案6</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Yuji Boku（毛筆）</p>
              <p className="text-[10px] text-gray-400">グラデ枠 × グラデ文字</p>
            </div>
          </div>

          {/* ── 案7: 印鑑風モダン ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-700/30" />
              <div className="absolute inset-[5px] rounded-full border-[2.5px] border-indigo-700 flex items-center justify-center">
                <span
                  className="text-indigo-800 text-[34px] leading-none"
                  style={{ fontFamily: "'Kaisei Tokumin', serif", fontWeight: 700 }}
                >
                  導
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案7</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Kaisei Tokumin</p>
              <p className="text-[10px] text-gray-400">モダン印鑑 × インディゴ</p>
            </div>
          </div>

          {/* ── 案8: iOS風光沢 × 筆 ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-[22px] bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-800 flex items-center justify-center shadow-xl shadow-indigo-600/30 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-[22px]" />
              <span
                className="relative text-white text-[42px] leading-none"
                style={{
                  fontFamily: "'Yuji Syuku', serif",
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                導
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案8</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Yuji Syuku（楷書）</p>
              <p className="text-[10px] text-gray-400">光沢 × 深いグラデ</p>
            </div>
          </div>

          {/* ── 案9: ネオンブラシ ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-[22px] bg-gray-950 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.25)]">
              <span
                className="text-[42px] leading-none"
                style={{
                  fontFamily: "'Yuji Boku', serif",
                  color: "#c7d2fe",
                  textShadow: "0 0 25px rgba(129,140,248,0.5), 0 0 50px rgba(129,140,248,0.25)",
                }}
              >
                導
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案9</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Yuji Boku（毛筆）</p>
              <p className="text-[10px] text-gray-400">ダーク × ネオングロー</p>
            </div>
          </div>

          {/* ── 案10: ソフトシャドウ書道 ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-[22px] bg-white flex items-center justify-center shadow-[0_8px_40px_rgba(79,70,229,0.2)] border border-indigo-100">
              <span
                className="text-[42px] leading-none"
                style={{
                  fontFamily: "'Yuji Mai', serif",
                  background: "linear-gradient(180deg, #4338ca, #6d28d9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                導
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">案10</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Yuji Mai（行書）</p>
              <p className="text-[10px] text-gray-400">白地 × ソフトシャドウ</p>
            </div>
          </div>
        </div>

        {/* ── サイズ比較 ── */}
        <div className="mt-20">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-3">サイズ比較（サイドバー用 40px）</h2>
          <p className="text-center text-gray-400 text-xs mb-10">実際のサイドバーで使用するサイズでの見え方</p>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-6 justify-items-center">
            {/* 1 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-lg mx-auto">
                <span className="text-white text-[18px] leading-none" style={{ fontFamily: "'Yuji Boku', serif" }}>導</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案1</p>
            </div>
            {/* 2 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 flex items-center justify-center shadow-lg mx-auto">
                <span className="text-[18px] leading-none" style={{ fontFamily: "'Yuji Syuku', serif", background: "linear-gradient(180deg, #e0e7ff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>導</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案2</p>
            </div>
            {/* 3 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg mx-auto">
                <span className="text-white text-[17px] leading-none" style={{ fontFamily: "'Yuji Mai', serif" }}>導</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案3</p>
            </div>
            {/* 4 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl border-2 border-indigo-700 bg-white flex items-center justify-center mx-auto">
                <span className="text-[18px] leading-none" style={{ fontFamily: "'Yuji Boku', serif", background: "linear-gradient(135deg, #4338ca, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>導</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案4</p>
            </div>
            {/* 5 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg mx-auto" style={{ background: "linear-gradient(135deg, #312e81, #4338ca)" }}>
                <span className="text-white text-[18px] leading-none" style={{ fontFamily: "'Kaisei HarunoUmi', serif" }}>導</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案5</p>
            </div>
            {/* 6 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg mx-auto">
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
                  <span className="text-[18px] leading-none" style={{ fontFamily: "'Yuji Boku', serif", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>導</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案6</p>
            </div>
            {/* 7 */}
            <div className="text-center">
              <div className="relative w-10 h-10 mx-auto">
                <div className="absolute inset-0 rounded-full border-[2px] border-indigo-700/30" />
                <div className="absolute inset-[3px] rounded-full border-[1.5px] border-indigo-700 flex items-center justify-center">
                  <span className="text-indigo-800 text-[14px] leading-none" style={{ fontFamily: "'Kaisei Tokumin', serif", fontWeight: 700 }}>導</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案7</p>
            </div>
            {/* 8 */}
            <div className="text-center">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-800 flex items-center justify-center shadow-lg overflow-hidden mx-auto">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                <span className="relative text-white text-[18px] leading-none" style={{ fontFamily: "'Yuji Syuku', serif" }}>導</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案8</p>
            </div>
            {/* 9 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] mx-auto">
                <span className="text-[18px] leading-none" style={{ fontFamily: "'Yuji Boku', serif", color: "#c7d2fe", textShadow: "0 0 10px rgba(129,140,248,0.5)" }}>導</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案9</p>
            </div>
            {/* 10 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.2)] border border-indigo-100 mx-auto">
                <span className="text-[18px] leading-none" style={{ fontFamily: "'Yuji Mai', serif", background: "linear-gradient(180deg, #4338ca, #6d28d9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>導</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">案10</p>
            </div>
          </div>
        </div>

        {/* ── ダーク背景プレビュー ── */}
        <div className="mt-20">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10">ダーク背景での見え方</h2>
          <div className="bg-gray-900 rounded-3xl p-10">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-6 justify-items-center">
              {/* 1 */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center">
                <span className="text-white text-[24px] leading-none" style={{ fontFamily: "'Yuji Boku', serif" }}>導</span>
              </div>
              {/* 2 */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center">
                <span className="text-[24px] leading-none" style={{ fontFamily: "'Yuji Syuku', serif", background: "linear-gradient(180deg, #e0e7ff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>導</span>
              </div>
              {/* 3 */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center">
                <span className="text-white text-[22px] leading-none" style={{ fontFamily: "'Yuji Mai', serif" }}>導</span>
              </div>
              {/* 4 */}
              <div className="w-14 h-14 rounded-2xl border-2 border-indigo-400 flex items-center justify-center">
                <span className="text-indigo-300 text-[24px] leading-none" style={{ fontFamily: "'Yuji Boku', serif" }}>導</span>
              </div>
              {/* 5 */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #312e81, #4338ca)" }}>
                <span className="text-white text-[24px] leading-none" style={{ fontFamily: "'Kaisei HarunoUmi', serif" }}>導</span>
              </div>
              {/* 6 */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-[14px] bg-gray-900 flex items-center justify-center">
                  <span className="text-[24px] leading-none" style={{ fontFamily: "'Yuji Boku', serif", background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>導</span>
                </div>
              </div>
              {/* 7 */}
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[2px] border-indigo-400/30" />
                <div className="absolute inset-[4px] rounded-full border-[1.5px] border-indigo-400 flex items-center justify-center">
                  <span className="text-indigo-300 text-[18px] leading-none" style={{ fontFamily: "'Kaisei Tokumin', serif", fontWeight: 700 }}>導</span>
                </div>
              </div>
              {/* 8 */}
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-800 flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                <span className="relative text-white text-[24px] leading-none" style={{ fontFamily: "'Yuji Syuku', serif" }}>導</span>
              </div>
              {/* 9 */}
              <div className="w-14 h-14 rounded-2xl bg-gray-950 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                <span className="text-[24px] leading-none" style={{ fontFamily: "'Yuji Boku', serif", color: "#c7d2fe", textShadow: "0 0 15px rgba(129,140,248,0.5)" }}>導</span>
              </div>
              {/* 10 */}
              <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.3)] border border-indigo-500/20">
                <span className="text-[24px] leading-none" style={{ fontFamily: "'Yuji Mai', serif", background: "linear-gradient(180deg, #c7d2fe, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>導</span>
              </div>
            </div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-6 justify-items-center mt-3">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <p key={n} className="text-[10px] text-gray-500 text-center">案{n}</p>
              ))}
            </div>
          </div>
        </div>

        {/* ── ヘッダーバー実装イメージ ── */}
        <div className="mt-20">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10">ヘッダーでの実装イメージ</h2>
          <div className="space-y-4">
            {/* With 案1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-md">
                <span className="text-white text-[16px] leading-none" style={{ fontFamily: "'Yuji Boku', serif" }}>導</span>
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">Michibiki</span>
            </div>
            {/* With 案2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-950 flex items-center justify-center shadow-md">
                <span className="text-[16px] leading-none" style={{ fontFamily: "'Yuji Syuku', serif", background: "linear-gradient(180deg, #e0e7ff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>導</span>
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">Michibiki</span>
            </div>
            {/* With 案5 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #312e81, #4338ca)" }}>
                <span className="text-white text-[16px] leading-none" style={{ fontFamily: "'Kaisei HarunoUmi', serif" }}>導</span>
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">Michibiki</span>
            </div>
            {/* With 案8 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-800 flex items-center justify-center shadow-md overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                <span className="relative text-white text-[16px] leading-none" style={{ fontFamily: "'Yuji Syuku', serif" }}>導</span>
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">Michibiki</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

function formatYen(n: number): string {
  if (n >= 10000) {
    return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}万円`;
  }
  return `${n.toLocaleString()}円`;
}

export default function ROICalculatorPage() {
  const [annualHires, setAnnualHires] = useState(20);
  const [costPerHire, setCostPerHire] = useState(500000);
  const [daysToHire, setDaysToHire] = useState(45);
  const [hrHourlyRate, setHrHourlyRate] = useState(3000);
  const [hoursPerScreening, setHoursPerScreening] = useState(2);

  // Calculations
  const costReductionRate = 0.55;
  const timeReductionRate = 0.50;
  const screeningAutomationRate = 0.80;

  const currentTotalCost = annualHires * costPerHire;
  const savedCostPerHire = costPerHire * costReductionRate;
  const annualSavings = annualHires * savedCostPerHire;
  const newDaysToHire = Math.round(daysToHire * (1 - timeReductionRate));
  const daysSaved = daysToHire - newDaysToHire;
  const hrHoursSavedPerHire = hoursPerScreening * screeningAutomationRate;
  const totalHrHoursSaved = Math.round(annualHires * hrHoursSavedPerHire);
  const hrCostSaved = totalHrHoursSaved * hrHourlyRate;

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white";

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-indigo-600 font-semibold text-sm mb-2">ROI計算ツール</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">AI採用のコスト削減効果を試算</h1>
            <p className="text-gray-600 max-w-xl mx-auto">現在の採用状況を入力するだけで、導（みちびき）導入後の削減効果をリアルタイムで試算できます。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">現在の採用状況</h2>
              <div className="space-y-5">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    年間採用人数
                    <span className="text-indigo-600 font-bold">{annualHires}人</span>
                  </label>
                  <input
                    type="range" min={1} max={200} value={annualHires}
                    onChange={(e) => setAnnualHires(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1人</span><span>200人</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">平均採用単価（1人あたり）</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <input
                      type="number" value={costPerHire}
                      onChange={(e) => setCostPerHire(Number(e.target.value))}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">平均選考期間（日数）</label>
                  <input
                    type="number" value={daysToHire}
                    onChange={(e) => setDaysToHire(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">人事担当者の時給</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <input
                      type="number" value={hrHourlyRate}
                      onChange={(e) => setHrHourlyRate(Number(e.target.value))}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">一次面接にかかる時間（時間/件）</label>
                  <input
                    type="number" value={hoursPerScreening} step={0.5}
                    onChange={(e) => setHoursPerScreening(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="bg-indigo-600 rounded-2xl p-6 md:p-8 text-white">
                <p className="text-indigo-200 text-sm font-medium mb-1">年間コスト削減額（推定）</p>
                <p className="text-3xl md:text-4xl font-bold mb-2">{formatYen(annualSavings)}</p>
                <p className="text-indigo-200 text-sm">
                  現在の年間採用コスト {formatYen(currentTotalCost)} → {formatYen(currentTotalCost - annualSavings)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-gray-500 text-xs font-medium mb-1">選考期間の短縮</p>
                  <p className="text-2xl font-bold text-gray-900">{daysSaved}日</p>
                  <p className="text-gray-400 text-xs">{daysToHire}日 → {newDaysToHire}日</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-gray-500 text-xs font-medium mb-1">人事工数の削減</p>
                  <p className="text-2xl font-bold text-gray-900">{totalHrHoursSaved}時間</p>
                  <p className="text-gray-400 text-xs">年間 / {formatYen(hrCostSaved)}相当</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-gray-500 text-xs font-medium mb-3">コスト比較</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">現在</span>
                      <span className="font-semibold text-gray-900">{formatYen(currentTotalCost)}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-indigo-600">AI導入後</span>
                      <span className="font-semibold text-indigo-600">{formatYen(currentTotalCost - annualSavings)}</span>
                    </div>
                    <div className="w-full h-3 bg-indigo-100 rounded-full">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(1 - costReductionRate) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                ※ 試算値は導入効果の目安です。実際の削減効果は企業の状況により異なります。
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">この削減効果を実現しませんか？</h2>
            <p className="text-gray-600 text-sm mb-6">まずは無料でお試しいただけます。専門スタッフが導入をサポートします。</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                お問い合わせ
              </Link>
              <Link href="/for-companies" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                企業向けページを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

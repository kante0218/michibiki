"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ContactPage() {
  const [form, setForm] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    employees: "",
    plan: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, open mailto with pre-filled info
    const subject = encodeURIComponent(`【導】${form.plan || "お問い合わせ"}: ${form.companyName}`);
    const body = encodeURIComponent(
      `会社名: ${form.companyName}\n担当者名: ${form.name}\nメール: ${form.email}\n電話番号: ${form.phone}\n従業員数: ${form.employees}\nご希望プラン: ${form.plan}\n\nお問い合わせ内容:\n${form.message}`
    );
    window.open(`mailto:t.kante@michibiki.tech?subject=${subject}&body=${body}`);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">お問い合わせありがとうございます</h1>
          <p className="text-gray-600 mb-6">1営業日以内にご連絡いたします。</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">トップページに戻る</Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300";

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2"><Logo size="header" iconOnly showBrandName /></Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">料金プラン</Link>
            <Link href="/signup" className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-medium">無料で始める</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">お問い合わせ</h1>
            <p className="text-gray-600 mb-8">
              導（みちびき）の企業向けプランについて、お気軽にご相談ください。
              専任の担当者が1営業日以内にご連絡いたします。
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">メール</h3>
                  <p className="text-gray-600 text-sm">t.kante@michibiki.tech</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">対応時間</h3>
                  <p className="text-gray-600 text-sm">平日 10:00〜18:00</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">無料トライアル</h3>
                  <p className="text-gray-600 text-sm">ビジネスプランを14日間無料でお試しいただけます</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">会社名 *</label>
                <input type="text" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="株式会社〇〇" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ご担当者名 *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="山田 太郎" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.co.jp" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">電話番号</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03-1234-5678" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">従業員数</label>
                <select value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} className={inputClass}>
                  <option value="">選択してください</option>
                  <option value="1-10">1〜10名</option>
                  <option value="11-50">11〜50名</option>
                  <option value="51-200">51〜200名</option>
                  <option value="201-1000">201〜1,000名</option>
                  <option value="1001+">1,001名以上</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ご希望プラン</label>
                <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className={inputClass}>
                  <option value="">選択してください</option>
                  <option value="ビジネスプラン（月額15万円）">ビジネスプラン（月額15万円）</option>
                  <option value="エンタープライズプラン（月額30万円〜）">エンタープライズプラン（月額30万円〜）</option>
                  <option value="まずは相談したい">まずは相談したい</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">お問い合わせ内容</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="ご質問やご要望をお聞かせください" className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors">
                送信する
              </button>
              <p className="text-xs text-gray-400 text-center">1営業日以内にご連絡いたします</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

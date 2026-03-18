"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signInWithGoogle } from "@/lib/auth";
import Logo from "@/components/Logo";
import TermsModal from "@/components/TermsModal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("メールアドレスまたはパスワードが正しくありません");
        } else {
          setError(authError.message);
        }
        return;
      }
      router.push("/home");
    } catch {
      setError("ログイン中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch {
      setError("Google認証中にエラーが発生しました。");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link href="/" className="group">
              <Logo size="sm" iconOnly showBrandName />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-5">
                <Logo size="lg" iconOnly />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                おかえりなさい
              </h1>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                アカウントにログインして、最適な求人を見つけましょう。
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2.5">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth - placed first for prominence */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Googleで続ける
            </button>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-gray-400 uppercase tracking-wider">または</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 disabled:opacity-50 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 disabled:opacity-50 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                />
              </div>

              {/* Terms & Privacy - must read before agreeing */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      termsRead ? "text-emerald-600" : "text-indigo-500 hover:text-indigo-600"
                    }`}
                  >
                    {termsRead ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    利用規約を読む{termsRead ? "（確認済み）" : ""}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPrivacyModalOpen(true)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      privacyRead ? "text-emerald-600" : "text-indigo-500 hover:text-indigo-600"
                    }`}
                  >
                    {privacyRead ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                    プライバシーポリシーを読む{privacyRead ? "（確認済み）" : ""}
                  </button>
                </div>

                {/* Agreement checkbox — only enabled after reading both */}
                <div className="flex items-start gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => termsRead && privacyRead && setAgreedToTerms(!agreedToTerms)}
                    disabled={loading || !termsRead || !privacyRead}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      agreedToTerms
                        ? "bg-gradient-to-br from-indigo-500 to-purple-500 border-transparent"
                        : !termsRead || !privacyRead
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                          : "border-gray-300 hover:border-indigo-400 bg-white cursor-pointer"
                    }`}
                  >
                    {agreedToTerms && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm leading-relaxed select-none ${
                    termsRead && privacyRead ? "text-gray-600 cursor-pointer" : "text-gray-400"
                  }`}
                    onClick={() => termsRead && privacyRead && !loading && setAgreedToTerms(!agreedToTerms)}
                  >
                    利用規約およびプライバシーポリシーに同意します
                    {(!termsRead || !privacyRead) && (
                      <span className="block text-xs text-amber-500 mt-0.5">
                        ※ 両方をお読みいただくとチェックできます
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading || !agreedToTerms}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-indigo-500/25 disabled:shadow-none hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "ログイン"
                  )}
                </button>
                <Link
                  href="/signup"
                  className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 text-center shadow-sm"
                >
                  新規登録
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Terms & Privacy Modals */}
      <TermsModal
        type="terms"
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAgree={() => {
          setTermsRead(true);
          setTermsModalOpen(false);
        }}
      />
      <TermsModal
        type="privacy"
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        onAgree={() => {
          setPrivacyRead(true);
          setPrivacyModalOpen(false);
        }}
      />
    </div>
  );
}

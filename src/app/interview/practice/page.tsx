"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

const sampleQuestions = [
  "あなたのこれまでのキャリアで最も困難だったプロジェクトについて教えてください。",
  "チームで意見が対立した際、どのように解決しましたか？具体的な例を挙げてください。",
  "最近学んだ新しい技術やスキルについて教えてください。どのように学習しましたか？",
  "あなたの強みと、それがどのようにチームに貢献できるか教えてください。",
  "リモートワーク環境でのコミュニケーションについて、あなたが心がけていることは何ですか？",
  "過去に失敗した経験と、そこから学んだことを教えてください。",
  "3年後のキャリア目標と、それに向けて現在取り組んでいることを教えてください。",
  "最後に、何か質問や伝えたいことはありますか？",
];

export default function PracticeInterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}>
      <PracticeInterviewContent />
    </Suspense>
  );
}

function PracticeInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const assessmentId = searchParams.get("assessmentId");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [started, setStarted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const handleStart = () => {
    setStarted(true);
    setIsRunning(true);
  };

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
    }
  };

  const handleEnd = async () => {
    setIsRunning(false);
    const time = timerSeconds;
    const answered = currentQuestion + 1;
    setFinalTime(time);
    setAnsweredCount(answered);

    // Calculate score based on answered questions and time
    const completionRatio = answered / sampleQuestions.length;
    const calculatedScore = Math.round(completionRatio * 100);
    setScore(calculatedScore);

    // If there's an assessment ID, update the record in Supabase
    if (assessmentId && user) {
      setSaving(true);
      try {
        await (supabase.from("assessments") as any)
          .update({
            score: calculatedScore,
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", assessmentId)
          .eq("user_id", user.id);
      } catch (err) {
        console.error("Failed to update assessment:", err);
      }
      setSaving(false);
    }

    setShowEndModal(true);
  };

  const handleGoHome = () => {
    router.push("/home");
  };

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  // Show nothing while checking auth
  if (authLoading || !user) {
    return null;
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-3">
              <a href="/interview" className="flex items-center gap-2">
                <Logo size="xs" />
                <span className="font-semibold text-gray-900 text-sm">Michibiki</span>
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{assessmentId ? "本番モード" : "練習モード"}</span>
            </div>
            <a href="/interview" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              戻る
            </a>
          </div>
        </header>

        {/* Pre-start screen */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {assessmentId ? "面接を始めましょう" : "練習面接を始めましょう"}
            </h1>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              {assessmentId
                ? `${sampleQuestions.length}つの質問に回答します。結果はプロフィールに反映されます。`
                : `練習モードでは${sampleQuestions.length}つの質問に回答します。結果はプロフィールには反映されません。リラックスして取り組んでください。`
              }
            </p>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">開始前の確認</h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">カメラとマイクの使用を許可してください</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">静かな環境で受験してください</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">所要時間：約20分</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStart}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              面接を開始する
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* End Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">お疲れ様でした！</h2>
            <p className="text-gray-500 mb-6 text-sm">
              {assessmentId ? "面接が完了しました。結果がプロフィールに反映されます。" : "練習面接が完了しました。"}
            </p>

            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">パフォーマンスサマリー</h3>
              <div className={`grid ${score !== null && assessmentId ? "grid-cols-3" : "grid-cols-2"} gap-4`}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{answeredCount}/{sampleQuestions.length}</p>
                  <p className="text-xs text-gray-500 mt-1">回答した質問数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{formatTime(finalTime)}</p>
                  <p className="text-xs text-gray-500 mt-1">所要時間</p>
                </div>
                {score !== null && assessmentId && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{score}</p>
                    <p className="text-xs text-gray-500 mt-1">スコア</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleGoHome}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? "保存中..." : "ホームに戻る"}
              {!saving && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/interview" className="flex items-center gap-2">
              <Logo size="xs" />
              <span className="font-semibold text-gray-900 text-sm">Michibiki</span>
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{assessmentId ? "本番モード" : "練習モード"}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
              assessmentId
                ? "bg-indigo-50 text-indigo-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${assessmentId ? "bg-indigo-500" : "bg-amber-500"}`}></span>
              {assessmentId ? "本番モード - 結果がプロフィールに反映されます" : "練習モード - 評価には影響しません"}
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <span className="text-xs text-gray-500 flex-shrink-0">
            質問 {currentQuestion + 1} / {sampleQuestions.length}
          </span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-gray-500 flex-shrink-0">
            {formatTime(timerSeconds)} / 20:00
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-0 max-w-screen-xl mx-auto w-full p-4 lg:p-6">
        {/* Left - Video area */}
        <div className="flex-1 flex flex-col gap-4 lg:mr-6">
          <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
            {cameraOn ? (
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm">カメラプレビュー</p>
              </div>
            ) : (
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="text-gray-500 text-sm">カメラオフ</p>
              </div>
            )}
            {/* Recording indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              録画中
            </div>
            {/* Mic status indicator */}
            {!micOn && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/80 text-white text-xs px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                ミュート中
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                micOn
                  ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {micOn ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
              {micOn ? "マイクON" : "マイクOFF"}
            </button>
            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                cameraOn
                  ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {cameraOn ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
              {cameraOn ? "カメラON" : "カメラOFF"}
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestion >= sampleQuestions.length - 1}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              次の質問
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={handleEnd}
              className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              終了
            </button>
          </div>
        </div>

        {/* Right - Question display */}
        <div className="w-full lg:w-96 flex-shrink-0 mt-4 lg:mt-0">
          <div className="bg-white border border-gray-200 rounded-xl p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">質問 {currentQuestion + 1} / {sampleQuestions.length}</p>
                <p className="text-xs text-gray-500">AIインタビュアー</p>
              </div>
            </div>
            <p className="text-base text-gray-900 leading-relaxed font-medium">
              {sampleQuestions[currentQuestion]}
            </p>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3">回答のヒント</p>
              <ul className="space-y-2">
                <li className="text-xs text-gray-500 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">&#8226;</span>
                  具体的なエピソードを交えて回答してください
                </li>
                <li className="text-xs text-gray-500 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">&#8226;</span>
                  STAR形式（状況・課題・行動・結果）を意識しましょう
                </li>
                <li className="text-xs text-gray-500 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">&#8226;</span>
                  1〜2分程度で簡潔に回答しましょう
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

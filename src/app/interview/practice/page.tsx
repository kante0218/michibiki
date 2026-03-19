"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

// Types
interface TestQuestion {
  id: number;
  type: "multiple_choice" | "coding" | "short_answer" | "case_study";
  question: string;
  options?: string[];
  correctAnswer?: string;
  hint: string;
  difficulty: string;
  timeLimit: number;
  points: number;
}

interface TestResult {
  questionId: number;
  question: string;
  answer: string;
  correct?: boolean;
  points: number;
}

interface InterviewEvaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
  detailedFeedback: string;
}

type Phase = "loading" | "test" | "test_result" | "interview_prep" | "interview" | "evaluating" | "result";

// Message type for conversation
interface Message {
  role: "ai" | "user";
  content: string;
}

export default function PracticeInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-sm text-gray-500">読み込み中...</p>
          </div>
        </div>
      }
    >
      <PracticeInterviewContent />
    </Suspense>
  );
}

function PracticeInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const assessmentId = searchParams.get("assessmentId");
  const category = searchParams.get("category") || "software_engineering";
  const jobTitle = searchParams.get("jobTitle") || "";

  // Phase management
  const [phase, setPhase] = useState<Phase>("loading");

  // Test state
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentTestQ, setCurrentTestQ] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testEvaluation, setTestEvaluation] = useState<{
    totalScore: number;
    maxScore: number;
    percentage: number;
    evaluation: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);

  // Interview state
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [userInput, setUserInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [interviewQuestionCount, setInterviewQuestionCount] = useState(0);
  const maxInterviewQuestions = 8;

  // Result state
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Error
  const [error, setError] = useState("");

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  // Category display name
  const categoryNames: Record<string, string> = {
    software_engineering: "ソフトウェアエンジニアリング",
    data_science: "データサイエンス",
    product_management: "プロダクトマネジメント",
    design: "デザイン",
    business_consulting: "ビジネスコンサルティング",
    healthcare: "ヘルスケア",
  };

  // Generate test questions on mount
  useEffect(() => {
    if (user && phase === "loading") {
      generateTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, phase]);

  const generateTest = async () => {
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_test",
          category,
          jobTitle,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setTestQuestions(data.questions || []);
      setPhase("test");
      setIsTimerRunning(true);
    } catch {
      setError("テストの生成に失敗しました。もう一度お試しください。");
    }
  };

  const handleTestAnswer = (questionId: number, answer: string) => {
    setTestAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextTestQuestion = () => {
    if (currentTestQ < testQuestions.length - 1) {
      setCurrentTestQ((q) => q + 1);
    }
  };

  const handlePrevTestQuestion = () => {
    if (currentTestQ > 0) {
      setCurrentTestQ((q) => q - 1);
    }
  };

  const handleSubmitTest = async () => {
    setIsTimerRunning(false);
    setPhase("loading");

    // Build results
    const results: TestResult[] = testQuestions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: testAnswers[q.id] || "未回答",
      points: q.points,
    }));
    setTestResults(results);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_test",
          testResults: results,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setPhase("test");
        return;
      }
      setTestEvaluation(data);
      setPhase("test_result");
    } catch {
      setError("テストの評価に失敗しました。");
      setPhase("test");
    }
  };

  const handleStartInterview = async () => {
    setPhase("interview_prep");
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setAiThinking(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_question",
          category,
          jobTitle,
          testResults: testEvaluation,
          conversationHistory: [],
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setPhase("test_result");
        return;
      }
      setMessages([{ role: "ai", content: data.question }]);
      setConversationHistory(data.conversationHistory || []);
      setInterviewQuestionCount(1);
      setPhase("interview");
    } catch {
      setError("面接の開始に失敗しました。");
      setPhase("test_result");
    } finally {
      setAiThinking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || aiThinking) return;

    const userMsg = userInput.trim();
    setUserInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setAiThinking(true);

    // Get the last AI message
    const lastAiMessage = messages.filter((m) => m.role === "ai").pop()?.content || "";

    try {
      // Update conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: "assistant" as const, content: lastAiMessage },
        { role: "user" as const, content: userMsg },
      ];

      const newCount = interviewQuestionCount + 1;

      if (newCount > maxInterviewQuestions) {
        // End interview and evaluate
        setPhase("evaluating");
        setIsTimerRunning(false);

        const evalRes = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "evaluate_interview",
            category,
            conversationHistory: updatedHistory,
            testResults: testEvaluation,
          }),
        });
        const evalData = await evalRes.json();

        if (evalData.error) {
          setError(evalData.error);
          setPhase("interview");
          return;
        }

        setEvaluation(evalData);

        // Save to Supabase if formal assessment
        if (assessmentId && user) {
          try {
            await (supabase.from("assessments") as ReturnType<typeof supabase.from>)
              .update({
                score: evalData.overallScore,
                status: "completed",
                completed_at: new Date().toISOString(),
              } as Record<string, unknown>)
              .eq("id", assessmentId)
              .eq("user_id", user.id);
          } catch (err) {
            console.error("Failed to update assessment:", err);
          }
        }

        setPhase("result");
        return;
      }

      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_question",
          category,
          jobTitle,
          testResults: testEvaluation,
          conversationHistory: updatedHistory,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setMessages((prev) => [...prev, { role: "ai", content: data.question }]);
      setConversationHistory(data.conversationHistory || updatedHistory);
      setInterviewQuestionCount(newCount);
    } catch {
      setError("AIからの応答に失敗しました。");
    } finally {
      setAiThinking(false);
    }
  };

  const handleEndInterview = async () => {
    setPhase("evaluating");
    setIsTimerRunning(false);
    setAiThinking(true);

    try {
      const evalRes = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_interview",
          category,
          conversationHistory,
          testResults: testEvaluation,
        }),
      });
      const evalData = await evalRes.json();

      if (evalData.error) {
        setError(evalData.error);
        setPhase("interview");
        return;
      }

      setEvaluation(evalData);

      if (assessmentId && user) {
        try {
          await (supabase.from("assessments") as ReturnType<typeof supabase.from>)
            .update({
              score: evalData.overallScore,
              status: "completed",
              completed_at: new Date().toISOString(),
            } as Record<string, unknown>)
            .eq("id", assessmentId)
            .eq("user_id", user.id);
        } catch (err) {
          console.error("Failed to update assessment:", err);
        }
      }

      setPhase("result");
    } catch {
      setError("評価の生成に失敗しました。");
      setPhase("interview");
    } finally {
      setAiThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading || !user) return null;

  // Header component
  const Header = ({ subtitle }: { subtitle: string }) => (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <a href="/interview" className="flex items-center gap-2">
            <Logo size="xs" />
          </a>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">{subtitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
            {formatTime(timerSeconds)}
          </span>
          {phase === "interview" && (
            <span className="text-xs text-gray-400">
              質問 {interviewQuestionCount}/{maxInterviewQuestions}
            </span>
          )}
        </div>
      </div>
    </header>
  );

  // Error display
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle="エラー" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setError(""); setPhase("loading"); }}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                再試行
              </button>
              <button
                onClick={() => router.push("/interview")}
                className="bg-white text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50"
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading phase
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle={categoryNames[category] || category} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">テストを準備中...</h2>
            <p className="text-sm text-gray-500">AIが{categoryNames[category] || category}の問題を生成しています</p>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 1: Online Test
  if (phase === "test") {
    const q = testQuestions[currentTestQ];
    if (!q) return null;

    const answeredCount = Object.keys(testAnswers).length;
    const progress = ((currentTestQ + 1) / testQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle={`オンラインテスト - ${categoryNames[category] || category}`} />

        {/* Progress */}
        <div className="bg-white border-b border-gray-100 px-4 py-2">
          <div className="max-w-screen-lg mx-auto flex items-center gap-4">
            <span className="text-xs text-gray-500">問題 {currentTestQ + 1}/{testQuestions.length}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-500">{answeredCount}/{testQuestions.length} 回答済み</span>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Difficulty badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                q.difficulty === "easy" ? "bg-emerald-50 text-emerald-700" :
                q.difficulty === "medium" ? "bg-amber-50 text-amber-700" :
                "bg-red-50 text-red-700"
              }`}>
                {q.difficulty === "easy" ? "基本" : q.difficulty === "medium" ? "標準" : "応用"}
              </span>
              <span className="text-xs text-gray-400">{q.points}点</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{q.type === "multiple_choice" ? "選択問題" : q.type === "coding" ? "コーディング" : q.type === "case_study" ? "ケーススタディ" : "記述問題"}</span>
            </div>

            {/* Question */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">{q.question}</h3>

              {/* Multiple choice */}
              {q.type === "multiple_choice" && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleTestAnswer(q.id, opt)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all text-sm ${
                        testAnswers[q.id] === opt
                          ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium mr-3">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Text answer */}
              {(q.type === "short_answer" || q.type === "case_study") && (
                <textarea
                  value={testAnswers[q.id] || ""}
                  onChange={(e) => handleTestAnswer(q.id, e.target.value)}
                  placeholder="回答を入力してください..."
                  rows={q.type === "case_study" ? 8 : 4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                />
              )}

              {/* Coding */}
              {q.type === "coding" && (
                <textarea
                  value={testAnswers[q.id] || ""}
                  onChange={(e) => handleTestAnswer(q.id, e.target.value)}
                  placeholder="コードを入力してください..."
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none font-mono bg-gray-900 text-green-400 placeholder-gray-600"
                />
              )}
            </div>

            {/* Hint */}
            {q.hint && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-amber-700">💡 ヒント: {q.hint}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevTestQuestion}
                disabled={currentTestQ === 0}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← 前の問題
              </button>

              <div className="flex gap-2">
                {testQuestions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestQ(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      i === currentTestQ
                        ? "bg-indigo-600 text-white"
                        : testAnswers[testQuestions[i]?.id]
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {currentTestQ < testQuestions.length - 1 ? (
                <button
                  onClick={handleNextTestQuestion}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  次の問題 →
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  テストを提出
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2: Test Results
  if (phase === "test_result" && testEvaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle="テスト結果" />
        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Score card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">{testEvaluation.percentage}%</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">テスト完了！</h2>
              <p className="text-gray-500 text-sm mb-4">
                {testEvaluation.totalScore}/{testEvaluation.maxScore}点
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">{testEvaluation.evaluation}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  強み
                </h3>
                <ul className="space-y-2">
                  {testEvaluation.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                  改善点
                </h3>
                <ul className="space-y-2">
                  {testEvaluation.weaknesses?.map((w, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next step */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
              <h3 className="text-base font-semibold text-indigo-900 mb-2">次のステップ：AI面接</h3>
              <p className="text-sm text-indigo-700 mb-4">
                テスト結果を踏まえて、AIがあなたに面接を行います。{maxInterviewQuestions}つの質問に回答してください。
              </p>
              <button
                onClick={handleStartInterview}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                AI面接を開始する
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3: Interview (Chat-based)
  if (phase === "interview" || phase === "interview_prep") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle="AI面接" />

        {/* Interview progress */}
        <div className="bg-white border-b border-gray-100 px-4 py-2">
          <div className="max-w-screen-lg mx-auto flex items-center gap-4">
            <span className="text-xs text-gray-500">面接進行</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${(interviewQuestionCount / maxInterviewQuestions) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{interviewQuestionCount}/{maxInterviewQuestions}</span>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${msg.role === "user" ? "" : "flex gap-3"}`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {aiThinking && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="回答を入力してください... (Enterで送信、Shift+Enterで改行)"
              rows={2}
              disabled={aiThinking}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none disabled:opacity-50"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || aiThinking}
                className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                送信
              </button>
              <button
                onClick={handleEndInterview}
                disabled={aiThinking}
                className="text-red-500 text-xs hover:text-red-600 transition-colors disabled:opacity-40"
              >
                面接終了
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: Evaluating
  if (phase === "evaluating") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle="評価中" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">AIが評価中...</h2>
            <p className="text-sm text-gray-500">テスト結果と面接の回答を総合的に分析しています</p>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 4: Final Results
  if (phase === "result" && evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle="評価結果" />
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Overall Score */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center">
              <h2 className="text-sm font-medium text-gray-500 mb-4">総合評価</h2>
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold">{evaluation.overallScore}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">{evaluation.recommendation}</p>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">{evaluation.summary}</p>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "技術力", score: evaluation.technicalScore, color: "indigo" },
                { label: "コミュニケーション", score: evaluation.communicationScore, color: "emerald" },
                { label: "問題解決力", score: evaluation.problemSolvingScore, color: "amber" },
              ].map(({ label, score, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                  <p className="text-xs text-gray-500 mb-2">{label}</p>
                  <p className={`text-3xl font-bold text-${color}-600`}>{score}</p>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${color}-500 rounded-full transition-all duration-1000`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-emerald-700 mb-3">✨ あなたの強み</h3>
                <ul className="space-y-2">
                  {evaluation.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-amber-700 mb-3">📈 改善ポイント</h3>
                <ul className="space-y-2">
                  {evaluation.improvements?.map((w, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed feedback */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">詳細フィードバック</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{evaluation.detailedFeedback}</p>
            </div>

            {/* Test score if available */}
            {testEvaluation && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">オンラインテスト結果</h3>
                <p className="text-sm text-gray-500">
                  スコア: {testEvaluation.totalScore}/{testEvaluation.maxScore}点
                  ({testEvaluation.percentage}%)
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/home")}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                ホームに戻る
              </button>
              <button
                onClick={() => router.push("/interview")}
                className="bg-white text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                別の面接を受ける
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

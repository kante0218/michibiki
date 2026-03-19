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

type Phase = "loading" | "test" | "test_evaluating" | "test_result" | "camera_setup" | "interview" | "evaluating" | "result";

interface InterviewQuestion {
  question: string;
  questionNumber: number;
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

  // Video interview state
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interviewQuestionCount, setInterviewQuestionCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);
  const maxInterviewQuestions = 8;

  // Result state
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Error
  const [error, setError] = useState("");

  // Screen recording state
  const [isScreenRecording, setIsScreenRecording] = useState(false);
  const [screenRecordingUrl, setScreenRecordingUrl] = useState<string | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const screenChunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopRecognition();
      stopScreenRecording();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraDenied(true);
      setCameraReady(true); // Allow proceeding with text-only mode
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  // Speech Recognition
  const startRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      // Fallback: allow text input if speech recognition is not available
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interim += t;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        try { recognition.stop(); } catch {}
        setTimeout(() => {
          try { recognition.start(); } catch {}
        }, 100);
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {}
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  };

  // Recording control
  const handleStartRecording = () => {
    setTranscript("");
    setIsRecording(true);
    setRecordingSeconds(0);
    startRecognition();

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopRecognition();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  // Screen recording functions
  const startScreenRecording = async () => {
    try {
      // Request screen + audio capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080 },
        audio: true,
      });

      // If we have a camera mic stream, mix its audio in
      let combinedStream = displayStream;
      if (streamRef.current) {
        const audioTracks = streamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
          const audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();

          // Add microphone audio
          const micSource = audioContext.createMediaStreamSource(
            new MediaStream(audioTracks)
          );
          micSource.connect(destination);

          // Add display audio if available
          const displayAudioTracks = displayStream.getAudioTracks();
          if (displayAudioTracks.length > 0) {
            const displaySource = audioContext.createMediaStreamSource(
              new MediaStream(displayAudioTracks)
            );
            displaySource.connect(destination);
          }

          // Combine video from display + mixed audio
          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ]);
        }
      }

      screenStreamRef.current = displayStream; // Keep reference for cleanup
      screenChunksRef.current = [];

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          screenChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(screenChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setScreenRecordingUrl(url);
        setIsScreenRecording(false);
      };

      // Stop recording if user stops screen share via browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        stopScreenRecording();
      };

      recorder.start(1000); // Collect data every second
      screenRecorderRef.current = recorder;
      setIsScreenRecording(true);
    } catch (err) {
      console.error("Screen recording error:", err);
      // User cancelled or permission denied — just ignore
    }
  };

  const stopScreenRecording = () => {
    if (screenRecorderRef.current && screenRecorderRef.current.state !== "inactive") {
      screenRecorderRef.current.stop();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    screenRecorderRef.current = null;
  };

  const downloadScreenRecording = () => {
    if (!screenRecordingUrl) return;
    const a = document.createElement("a");
    a.href = screenRecordingUrl;
    a.download = `michibiki-interview-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        body: JSON.stringify({ action: "generate_test", category, jobTitle }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
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
    if (currentTestQ < testQuestions.length - 1) setCurrentTestQ((q) => q + 1);
  };

  const handlePrevTestQuestion = () => {
    if (currentTestQ > 0) setCurrentTestQ((q) => q - 1);
  };

  const handleSubmitTest = async () => {
    setIsTimerRunning(false);
    setPhase("test_evaluating");

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
        body: JSON.stringify({ action: "evaluate_test", testResults: results }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setPhase("test"); return; }
      setTestEvaluation(data);
      setPhase("test_result");
    } catch {
      setError("テストの評価に失敗しました。");
      setPhase("test");
    }
  };

  // Camera setup & start interview
  const handleStartCameraSetup = async () => {
    setPhase("camera_setup");
    await startCamera();
  };

  const handleStartVideoInterview = async () => {
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setAiThinking(true);
    setPhase("interview");

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
      if (data.error) { setError(data.error); setPhase("test_result"); return; }
      setCurrentQuestion({ question: data.question, questionNumber: 1 });
      setConversationHistory(data.conversationHistory || []);
      setInterviewQuestionCount(1);
    } catch {
      setError("面接の開始に失敗しました。");
      setPhase("test_result");
    } finally {
      setAiThinking(false);
    }
  };

  // Submit video answer (using transcript)
  const handleSubmitAnswer = async () => {
    if (!transcript.trim() && !fallbackText.trim()) return;

    handleStopRecording();
    const answerText = transcript.trim() || fallbackText.trim();
    setAiThinking(true);
    setFallbackText("");

    const lastAiMessage = currentQuestion?.question || "";
    const updatedHistory = [
      ...conversationHistory,
      { role: "assistant" as const, content: lastAiMessage },
      { role: "user" as const, content: answerText },
    ];

    const newCount = interviewQuestionCount + 1;

    try {
      if (newCount > maxInterviewQuestions) {
        // End interview
        setPhase("evaluating");
        setIsTimerRunning(false);
        stopCamera();
        stopScreenRecording();

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
        if (evalData.error) { setError(evalData.error); setPhase("interview"); return; }
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
        return;
      }

      // Get next question
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
      if (data.error) { setError(data.error); return; }

      setCurrentQuestion({ question: data.question, questionNumber: newCount });
      setConversationHistory(data.conversationHistory || updatedHistory);
      setInterviewQuestionCount(newCount);
      setTranscript("");
    } catch {
      setError("AIからの応答に失敗しました。");
    } finally {
      setAiThinking(false);
    }
  };

  const handleEndInterview = async () => {
    handleStopRecording();
    stopScreenRecording();
    setPhase("evaluating");
    setIsTimerRunning(false);
    stopCamera();
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
      if (evalData.error) { setError(evalData.error); setPhase("interview"); return; }
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

  // Fallback text input (for browsers without speech recognition)
  const [fallbackText, setFallbackText] = useState("");

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
          {(phase === "interview") && (
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

  // PHASE: Test Evaluating
  if (phase === "test_evaluating") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle="テスト評価中" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">テストを評価中...</h2>
            <p className="text-sm text-gray-500">AIが回答を分析しています</p>
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

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">{q.question}</h3>

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

              {(q.type === "short_answer" || q.type === "case_study") && (
                <textarea
                  value={testAnswers[q.id] || ""}
                  onChange={(e) => handleTestAnswer(q.id, e.target.value)}
                  placeholder="回答を入力してください..."
                  rows={q.type === "case_study" ? 8 : 4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                />
              )}

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

            {q.hint && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-amber-700">💡 ヒント: {q.hint}</p>
              </div>
            )}

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

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
              <h3 className="text-base font-semibold text-indigo-900 mb-2">次のステップ：ビデオ面接</h3>
              <p className="text-sm text-indigo-700 mb-2">
                テスト結果を踏まえて、AIがビデオ面接を行います。
              </p>
              <p className="text-xs text-indigo-500 mb-4">
                カメラとマイクを使用します。質問が画面に表示されたら、声に出して回答してください。
              </p>
              <button
                onClick={handleStartCameraSetup}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                ビデオ面接を開始する
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: Camera Setup
  if (phase === "camera_setup") {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header subtitle="カメラ設定" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="relative rounded-2xl overflow-hidden bg-black mb-8 aspect-video max-w-lg mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: "scaleX(-1)" }}
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3" />
                    <p className="text-white text-sm">カメラを起動中...</p>
                  </div>
                </div>
              )}
            </div>

            {cameraReady && (
              <div className="space-y-4">
                {cameraDenied ? (
                  <>
                    <div className="bg-amber-900/50 border border-amber-600/50 rounded-xl p-4 max-w-md mx-auto">
                      <h3 className="text-amber-300 text-sm font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        カメラへのアクセスが拒否されました
                      </h3>
                      <p className="text-amber-200/80 text-xs mb-3">カメラを有効にするには：</p>
                      <ol className="text-amber-200/80 text-xs space-y-1 text-left list-decimal list-inside">
                        <li>アドレスバー左の🔒アイコンをクリック</li>
                        <li>「カメラ」と「マイク」を「許可」に変更</li>
                        <li>ページをリロードしてください</li>
                      </ol>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => { setCameraDenied(false); setCameraReady(false); startCamera(); }}
                          className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-amber-700"
                        >
                          再試行
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">カメラなしでもテキスト入力で面接を続行できます</p>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-6 text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm">カメラ OK</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm">マイク OK</span>
                    </div>
                  </div>
                )}

                <div className="bg-gray-800 rounded-xl p-4 max-w-md mx-auto">
                  <h3 className="text-white text-sm font-semibold mb-2">面接の進め方</h3>
                  <ul className="text-gray-300 text-xs space-y-1.5 text-left">
                    <li>• AIが質問を画面に表示します</li>
                    <li>• {cameraDenied ? "テキストで回答を入力してください" : "「録画開始」を押して、声に出して回答してください"}</li>
                    <li>• 回答が終わったら「回答を送信」を押してください</li>
                    <li>• 全{maxInterviewQuestions}問で終了です</li>
                  </ul>
                </div>

                <button
                  onClick={handleStartVideoInterview}
                  className="bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-lg inline-flex items-center gap-2"
                >
                  面接を始める
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3: Video Interview
  if (phase === "interview") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header subtitle="ビデオ面接" />

        {/* Progress bar */}
        <div className="bg-white border-b border-gray-100 px-4 py-2">
          <div className="max-w-screen-lg mx-auto flex items-center gap-4">
            <span className="text-xs text-gray-500">面接進行</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${(interviewQuestionCount / maxInterviewQuestions) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{interviewQuestionCount}/{maxInterviewQuestions}</span>
            {isRecording && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-500 font-mono">{formatTime(recordingSeconds)}</span>
              </div>
            )}
            {/* Screen recording toggle */}
            <button
              onClick={isScreenRecording ? stopScreenRecording : startScreenRecording}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isScreenRecording
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
              title={isScreenRecording ? "画面録画を停止" : "画面録画を開始"}
            >
              {isScreenRecording ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  録画中
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  画面録画
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="max-w-2xl w-full">
            {aiThinking ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">AIが次の質問を準備中...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Question */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    Q{currentQuestion?.questionNumber || 1}
                  </span>
                  <span className="text-gray-400 text-xs">/ {maxInterviewQuestions}</span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <p className="text-gray-900 text-lg leading-relaxed font-medium">
                    {currentQuestion?.question || ""}
                  </p>
                </div>

                {/* Transcript */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="text-xs text-gray-500">音声認識テキスト</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 min-h-[80px] max-h-[150px] overflow-y-auto border border-gray-200">
                    {transcript ? (
                      <p className="text-gray-800 text-sm leading-relaxed">{transcript}</p>
                    ) : isRecording ? (
                      <p className="text-gray-400 text-sm animate-pulse">話してください...</p>
                    ) : (
                      <p className="text-gray-400 text-sm">録画を開始して回答してください</p>
                    )}
                  </div>

                  {/* Fallback text input */}
                  {!isRecording && (
                    <div className="mt-3">
                      <textarea
                        value={fallbackText}
                        onChange={(e) => setFallbackText(e.target.value)}
                        placeholder="音声認識がうまくいかない場合はここに入力..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-4 rounded-full bg-white" />
                      録画開始
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-4 rounded bg-white" />
                      録画停止
                    </button>
                  )}

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!transcript.trim() && !fallbackText.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 flex items-center justify-center gap-2"
                  >
                    回答を送信
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleEndInterview}
                  className="w-full mt-3 text-red-400 text-xs hover:text-red-500 transition-colors py-2"
                >
                  面接を終了する
                </button>
              </>
            )}
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
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center">
              <h2 className="text-sm font-medium text-gray-500 mb-4">総合評価</h2>
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold">{evaluation.overallScore}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">{evaluation.recommendation}</p>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">{evaluation.summary}</p>
            </div>

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

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">詳細フィードバック</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{evaluation.detailedFeedback}</p>
            </div>

            {testEvaluation && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">オンラインテスト結果</h3>
                <p className="text-sm text-gray-500">
                  スコア: {testEvaluation.totalScore}/{testEvaluation.maxScore}点
                  ({testEvaluation.percentage}%)
                </p>
              </div>
            )}

            {screenRecordingUrl && (
              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5 mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-indigo-700">面接の画面録画が利用可能です</h3>
                </div>
                <button
                  onClick={downloadScreenRecording}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  録画をダウンロード
                </button>
              </div>
            )}

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


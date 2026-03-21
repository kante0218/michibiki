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

// Header extracted as a top-level component to prevent remount flicker
const InterviewHeader = ({ subtitle, timerDisplay, showQuestionCount, questionCount, maxQuestions }: {
  subtitle: string;
  timerDisplay: string;
  showQuestionCount: boolean;
  questionCount: number;
  maxQuestions: number;
}) => (
  <header className="border-b border-gray-200 bg-white sticky top-0 z-40" style={{ isolation: "isolate", transform: "translateZ(0)", backfaceVisibility: "hidden" }}>
    <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
      <div className="flex items-center gap-3">
        <a href="/interview" className="flex items-center gap-2 flex-shrink-0">
          <Logo size="xs" />
        </a>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500 whitespace-nowrap">{subtitle}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          {timerDisplay}
        </span>
        {showQuestionCount && (
          <span className="text-xs text-gray-400">
            質問 {questionCount}/{maxQuestions}
          </span>
        )}
      </div>
    </div>
  </header>
);

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
  const maxInterviewQuestions = 5;

  // Result state
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Error
  const [error, setError] = useState("");

  // Voice settings
  const [voiceProvider, setVoiceProvider] = useState<"edge" | "voicevox" | "google">("edge");
  const [edgePreset, setEdgePreset] = useState("keita-interviewer");
  const [voicevoxSpeaker, setVoicevoxSpeaker] = useState("ryusei");
  const [googleVoice, setGoogleVoice] = useState("wavenet-male-d");
  const [googleTtsAvailable, setGoogleTtsAvailable] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);



  // Screen recording state
  const [isScreenRecording, setIsScreenRecording] = useState(false);
  const [screenRecordingUrl, setScreenRecordingUrl] = useState<string | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const screenChunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Interview recording (always-on during interview phase)
  const interviewRecorderRef = useRef<MediaRecorder | null>(null);
  const interviewChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const speechSegmentsRef = useRef<{ start: number; end: number }[]>([]);
  const currentSpeechStartRef = useRef<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Check Google TTS availability
  useEffect(() => {
    fetch("/api/tts/google")
      .then(res => res.json())
      .then(data => { if (data.isConfigured) setGoogleTtsAvailable(true); })
      .catch(() => {});
  }, []);

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
    ai_ml_engineer: "AI・機械学習エンジニア",
    infra_devops: "インフラ・DevOps",
    security_engineer: "セキュリティエンジニア",
    mobile_development: "モバイルアプリ開発",
    design: "UI/UXデザイン",
    graphic_design: "グラフィックデザイン",
    video_production: "動画制作・映像",
    product_management: "プロダクトマネジメント",
    business_consulting: "ビジネスコンサルティング",
    sales: "営業・セールス",
    marketing: "マーケティング",
    financial_analyst: "金融アナリスト",
    investment_fund: "投資・ファンドマネジメント",
    fintech: "フィンテック",
    accounting_tax: "会計・税務",
    healthcare: "医療・臨床",
    nursing_care: "看護・介護",
    pharmacy: "薬剤師・製薬",
    health_tech: "医療IT・ヘルステック",
    education: "教育・講師",
    edtech: "EdTech",
    research_academia: "研究員・アカデミア",
    influencer_sns: "インフルエンサー・SNS",
    youtuber_streamer: "YouTuber・配信者",
    content_creator: "コンテンツクリエイター",
    hr_recruitment: "人事・採用",
    accounting_finance: "経理・財務",
    legal_compliance: "法務・コンプライアンス",
    blockchain_web3: "ブロックチェーン・Web3",
    game_development: "ゲーム開発",
    dx_consultant: "DX推進・コンサルタント",
  };

  // Anti-cheating: track tab switches
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (phase === "test")) {
        setTabSwitchCount((c) => {
          const newCount = c + 1;
          if (newCount >= 1) setShowTabWarning(true);
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [phase]);

  // Anti-cheating: prevent copy/paste during test
  useEffect(() => {
    if (phase !== "test") return;
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("copy", preventCopy);
    document.addEventListener("paste", preventCopy);
    document.addEventListener("contextmenu", preventContextMenu);
    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("paste", preventCopy);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [phase]);

  // Permission state for showing specific guidance
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted" | "unknown">("unknown");

  // Camera functions
  const startCamera = async () => {
    try {
      // Always try getUserMedia directly - this is the most reliable way
      // to check if camera access is actually available
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionState("granted");
      setCameraDenied(false);
      setCameraReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        setPermissionState("denied");
      } else if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
        // No camera device found
        setPermissionState("unknown");
      } else {
        setPermissionState("unknown");
      }
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
          // Close speech segment on final result
          if (currentSpeechStartRef.current !== null && recordingStartTimeRef.current > 0) {
            speechSegmentsRef.current.push({
              start: currentSpeechStartRef.current,
              end: (Date.now() - recordingStartTimeRef.current) / 1000,
            });
            currentSpeechStartRef.current = null;
          }
        } else {
          interim += t;
          // Start speech segment on first interim result
          if (currentSpeechStartRef.current === null && recordingStartTimeRef.current > 0) {
            currentSpeechStartRef.current = (Date.now() - recordingStartTimeRef.current) / 1000;
          }
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
      // Close any open speech segment
      if (currentSpeechStartRef.current !== null && recordingStartTimeRef.current > 0) {
        speechSegmentsRef.current.push({
          start: currentSpeechStartRef.current,
          end: (Date.now() - recordingStartTimeRef.current) / 1000,
        });
        currentSpeechStartRef.current = null;
      }
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

  // SessionStorage key for this category
  const storageKey = `michibiki_test_${category}`;
  const sessionKey = `michibiki_session_${category}`;

  // Save full session state to sessionStorage (all phases)
  useEffect(() => {
    if (phase === "loading") return;
    try {
      const sessionData: Record<string, unknown> = {
        phase,
        timerSeconds,
        testQuestions,
        testAnswers,
        currentTestQ,
        testEvaluation,
        testResults,
        conversationHistory,
        currentQuestion,
        interviewQuestionCount,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
    } catch {}
  }, [phase, timerSeconds, testQuestions, testAnswers, currentTestQ, testEvaluation, testResults, conversationHistory, currentQuestion, interviewQuestionCount, sessionKey]);

  // Also keep the old test-specific storage for backward compat
  useEffect(() => {
    if (testQuestions.length > 0 && phase === "test") {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({
          questions: testQuestions,
          answers: testAnswers,
          timerSeconds,
          currentQ: currentTestQ,
        }));
      } catch {}
    }
  }, [testQuestions, testAnswers, currentTestQ, timerSeconds, storageKey, phase]);

  // Auto-start camera when test phase begins
  useEffect(() => {
    if (phase === "test" && !streamRef.current) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Restore session on mount
  useEffect(() => {
    if (user && phase === "loading") {
      // Try full session restore first
      try {
        const savedSession = sessionStorage.getItem(sessionKey);
        if (savedSession) {
          const data = JSON.parse(savedSession);
          const savedPhase = data.phase as Phase;

          // Restore based on saved phase
          if (savedPhase === "test" && data.testQuestions?.length > 0) {
            setTestQuestions(data.testQuestions);
            setTestAnswers(data.testAnswers || {});
            setCurrentTestQ(data.currentTestQ || 0);
            setTimerSeconds(data.timerSeconds || 0);
            setPhase("test");
            setIsTimerRunning(true);
            return;
          }

          if (savedPhase === "test_result" && data.testEvaluation) {
            setTestQuestions(data.testQuestions || []);
            setTestAnswers(data.testAnswers || {});
            setTestResults(data.testResults || []);
            setTestEvaluation(data.testEvaluation);
            setTimerSeconds(data.timerSeconds || 0);
            setPhase("test_result");
            return;
          }

          if (savedPhase === "camera_setup" && data.testEvaluation) {
            setTestQuestions(data.testQuestions || []);
            setTestEvaluation(data.testEvaluation);
            setTestResults(data.testResults || []);
            setTimerSeconds(data.timerSeconds || 0);
            setPhase("camera_setup");
            startCamera();
            return;
          }

          if (savedPhase === "interview" && data.conversationHistory) {
            setTestQuestions(data.testQuestions || []);
            setTestEvaluation(data.testEvaluation);
            setTestResults(data.testResults || []);
            setConversationHistory(data.conversationHistory || []);
            setCurrentQuestion(data.currentQuestion);
            setInterviewQuestionCount(data.interviewQuestionCount || 1);
            setTimerSeconds(data.timerSeconds || 0);
            setPhase("interview");
            setIsTimerRunning(true);
            // Restart camera for interview
            startCamera().then(() => {
              setTimeout(() => {
                if (videoRef.current && streamRef.current) {
                  videoRef.current.srcObject = streamRef.current;
                }
              }, 200);
            });
            return;
          }

          if ((savedPhase === "result" || savedPhase === "evaluating") && data.testEvaluation) {
            // For result/evaluating, go back to test_result to allow re-entering interview
            setTestQuestions(data.testQuestions || []);
            setTestEvaluation(data.testEvaluation);
            setTestResults(data.testResults || []);
            setTimerSeconds(data.timerSeconds || 0);
            setPhase("test_result");
            return;
          }
        }
      } catch {}

      // Fallback: try old test-only storage
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          if (data.questions && data.questions.length > 0) {
            setTestQuestions(data.questions);
            setTestAnswers(data.answers || {});
            setCurrentTestQ(data.currentQ || 0);
            setTimerSeconds(data.timerSeconds || 0);
            setPhase("test");
            setIsTimerRunning(true);
            return;
          }
        }
      } catch {}

      // No saved data — generate fresh questions
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
      if (data.error) {
        const msg = data.error.includes("Overloaded") ? "AIサーバーが混雑しています。しばらく待ってから再試行してください。" : data.error;
        setError(msg); return;
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
    if (currentTestQ < testQuestions.length - 1) setCurrentTestQ((q) => q + 1);
  };

  const handlePrevTestQuestion = () => {
    if (currentTestQ > 0) setCurrentTestQ((q) => q - 1);
  };

  const handleSubmitTest = async () => {
    setIsTimerRunning(false);
    setPhase("test_evaluating");
    // Clear saved test data since test is now submitted
    try { sessionStorage.removeItem(storageKey); } catch {}

    const results: TestResult[] = testQuestions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: testAnswers[q.id] || "未回答",
      correct: q.type === "multiple_choice" ? testAnswers[q.id] === q.correctAnswer : undefined,
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
      if (data.error) {
        const msg = data.error.includes("Overloaded") ? "AIサーバーが混雑しています。しばらく待ってから再試行してください。" : data.error;
        setError(msg); setPhase("test"); return;
      }
      setTestEvaluation(data);
      setPhase("test_result");
    } catch {
      setError("テストの評価に失敗しました。もう一度お試しください。");
      setPhase("test");
    }
  };

  // Camera setup & start interview
  const handleStartCameraSetup = async () => {
    setPhase("camera_setup");
    // If camera is already running from test phase, just reassign to new video element
    if (streamRef.current) {
      // Wait for next render so videoRef points to the camera_setup video element
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
      }, 100);
    } else {
      // Reset denied state and try fresh — user may have changed browser permissions
      setCameraDenied(false);
      setCameraReady(false);
      await startCamera();
    }
  };

  // Text-to-Speech with provider selection
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakQuestion = useCallback(async (text: string) => {
    try {
      // Stop any currently playing audio
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
      setIsSpeaking(true);

      let res: Response;

      if (voiceProvider === "google") {
        res = await fetch("/api/tts/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: googleVoice }),
        });
      } else if (voiceProvider === "voicevox") {
        res = await fetch("/api/tts/voicevox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speaker: voicevoxSpeaker }),
        });
      } else {
        res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, preset: edgePreset }),
        });
      }

      if (!res.ok) {
        // Fallback to browser TTS
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "ja-JP";
          u.rate = 0.95;
          u.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(u);
        }
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        ttsAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        ttsAudioRef.current = null;
      };
      await audio.play();
    } catch {
      setIsSpeaking(false);
      // Fallback to browser TTS
      try {
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "ja-JP";
          u.rate = 0.95;
          u.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(u);
        }
      } catch {}
    }
  }, [voiceProvider, edgePreset, voicevoxSpeaker, googleVoice]);

  const stopSpeaking = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    try { window.speechSynthesis?.cancel(); } catch {}
    setIsSpeaking(false);
  }, []);

  // Interview recording functions
  const startInterviewRecording = useCallback(() => {
    if (!streamRef.current) return;
    interviewChunksRef.current = [];
    speechSegmentsRef.current = [];
    recordingStartTimeRef.current = Date.now();

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

    try {
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType,
        videoBitsPerSecond: 500000, // ~500kbps to keep file size reasonable
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) interviewChunksRef.current.push(e.data);
      };
      recorder.start(1000); // chunk every second
      interviewRecorderRef.current = recorder;
      console.log("Interview recording started:", mimeType);
    } catch (err) {
      console.error("Failed to start interview recording:", err);
    }
  }, []);

  const stopInterviewRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = interviewRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(interviewChunksRef.current.length > 0
          ? new Blob(interviewChunksRef.current, { type: recorder?.mimeType || "video/webm" })
          : null);
        interviewRecorderRef.current = null;
        return;
      }

      // Close any open speech segment
      if (currentSpeechStartRef.current !== null) {
        speechSegmentsRef.current.push({
          start: currentSpeechStartRef.current,
          end: (Date.now() - recordingStartTimeRef.current) / 1000,
        });
        currentSpeechStartRef.current = null;
      }

      recorder.onstop = () => {
        const blob = interviewChunksRef.current.length > 0
          ? new Blob(interviewChunksRef.current, { type: recorder.mimeType })
          : null;
        interviewRecorderRef.current = null;
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  const uploadInterviewRecording = useCallback(async (blob: Blob) => {
    if (!user || !blob) return;
    setIsUploading(true);
    try {
      const fileId = crypto.randomUUID();
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const fileName = `${user.id}/${fileId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("interview-recordings")
        .upload(fileName, blob, { contentType: blob.type, upsert: false });

      if (uploadError) {
        console.error("Recording upload failed:", uploadError);
        return;
      }

      const duration = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
      await (supabase.from("interview_recordings") as ReturnType<typeof supabase.from>)
        .insert({
          user_id: user.id,
          assessment_id: assessmentId || null,
          category,
          storage_path: fileName,
          duration_seconds: duration,
          speech_segments: speechSegmentsRef.current,
          file_size_bytes: blob.size,
          mime_type: blob.type,
          status: "ready",
        } as Record<string, unknown>);

      console.log("Interview recording uploaded:", fileName, `${(blob.size / 1024 / 1024).toFixed(1)}MB`, `${speechSegmentsRef.current.length} segments`);
    } catch (err) {
      console.error("Failed to upload recording:", err);
    } finally {
      setIsUploading(false);
    }
  }, [user, assessmentId, category]);

  const handleStartVideoInterview = async () => {
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setAiThinking(true);
    setPhase("interview");

    // Reassign stream to the new video element after render
    setTimeout(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      // Start automatic interview recording from the very beginning
      startInterviewRecording();
      // Auto-start speech recognition so user doesn't need to press anything
      handleStartRecording();
    }, 200);

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
        const msg = data.error.includes("Overloaded") ? "AIサーバーが混雑しています。しばらく待ってから再試行してください。" : data.error;
        setError(msg); setPhase("test_result"); return;
      }
      setCurrentQuestion({ question: data.question, questionNumber: 1 });
      setConversationHistory(data.conversationHistory || []);
      setInterviewQuestionCount(1);
      // Auto-read the first question aloud
      speakQuestion(data.question);
    } catch {
      setError("面接の開始に失敗しました。もう一度お試しください。");
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
        // End interview - stop recording and upload in background
        const recordingBlob = await stopInterviewRecording();
        setPhase("evaluating");
        setIsTimerRunning(false);
        stopCamera();
        stopScreenRecording();
        if (recordingBlob) uploadInterviewRecording(recordingBlob);

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
      if (data.error) {
        const msg = data.error.includes("Overloaded") ? "AIサーバーが混雑しています。しばらく待ってから再試行してください。" : data.error;
        setError(msg); return;
      }

      setCurrentQuestion({ question: data.question, questionNumber: newCount });
      setConversationHistory(data.conversationHistory || updatedHistory);
      setInterviewQuestionCount(newCount);
      setTranscript("");
      setFallbackText("");
      // Auto-read the next question aloud
      speakQuestion(data.question);
      // Auto-restart speech recognition for continuous recording
      handleStartRecording();
    } catch {
      setError("AIからの応答に失敗しました。");
    } finally {
      setAiThinking(false);
    }
  };

  const handleEndInterview = async () => {
    handleStopRecording();
    stopScreenRecording();
    stopSpeaking();
    const recordingBlob = await stopInterviewRecording();
    setPhase("evaluating");
    setIsTimerRunning(false);
    stopCamera();
    if (recordingBlob) uploadInterviewRecording(recordingBlob);
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

  // Show loading spinner while auth is checking (instead of blank page)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  // Use top-level InterviewHeader to avoid re-mount flicker
  const timerDisplay = formatTime(timerSeconds);

  // Error display
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <InterviewHeader subtitle="エラー" timerDisplay={timerDisplay} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
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
        <InterviewHeader subtitle={categoryNames[category] || category} timerDisplay={timerDisplay} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
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
        <InterviewHeader subtitle="テスト評価中" timerDisplay={timerDisplay} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
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
    const isMultipleChoiceSection = q.type === "multiple_choice";
    const mcCount = testQuestions.filter((t) => t.type === "multiple_choice").length;
    const sectionLabel = isMultipleChoiceSection
      ? `選択問題 ${currentTestQ + 1}/${mcCount}`
      : `記述問題 ${currentTestQ + 1 - mcCount}/${testQuestions.length - mcCount}`;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <InterviewHeader subtitle={`オンラインテスト - ${categoryNames[category] || category}`} timerDisplay={timerDisplay} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />

        {/* Tab switch warning overlay */}
        {showTabWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">タブ切り替えを検知しました</h3>
              <p className="text-sm text-gray-500 mb-2">テスト中に別のタブやアプリに切り替えることは禁止されています。</p>
              <p className="text-xs text-red-600 mb-4 font-medium">切り替え回数: {tabSwitchCount}回（記録されます）</p>
              <button
                onClick={() => setShowTabWarning(false)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                テストに戻る
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border-b border-gray-100 px-4 py-2">
          <div className="max-w-screen-lg mx-auto flex items-center gap-4">
            <span className="text-xs text-gray-500">問題 {currentTestQ + 1}/{testQuestions.length}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium text-indigo-600">{sectionLabel}</span>
            <span className="text-xs text-gray-500">{answeredCount}/{testQuestions.length} 回答済み</span>
            {tabSwitchCount > 0 && (
              <span className="text-[10px] text-red-500 font-medium">離脱{tabSwitchCount}回</span>
            )}
          </div>
        </div>

        {/* Camera PiP overlay */}
        {!cameraDenied && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80 bg-black" style={{ width: 200, height: 150 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              </div>
            )}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white/80 font-medium drop-shadow">REC</span>
            </div>
          </div>
        )}

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
    const pct = testEvaluation.percentage;
    const gradeColor = pct >= 80 ? "emerald" : pct >= 60 ? "indigo" : pct >= 40 ? "amber" : "red";
    const gradeLabel = pct >= 80 ? "優秀" : pct >= 60 ? "良好" : pct >= 40 ? "平均" : "要改善";
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (pct / 100) * circumference;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <InterviewHeader subtitle="テスト結果" timerDisplay={timerDisplay} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Score Hero Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
              <div className="flex items-center justify-center gap-8">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke={gradeColor === "emerald" ? "#10b981" : gradeColor === "indigo" ? "#6366f1" : gradeColor === "amber" ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{pct}%</span>
                    <span className={`text-xs font-semibold text-${gradeColor}-600`}>{gradeLabel}</span>
                  </div>
                </div>

                {/* Score Details */}
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">テスト完了</h2>
                  <p className="text-sm text-gray-500 mb-3">
                    {testEvaluation.totalScore}/{testEvaluation.maxScore}点 獲得
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{testEvaluation.evaluation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
                  <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    あなたの強み
                  </h3>
                </div>
                <ul className="p-5 space-y-3">
                  {testEvaluation.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
                <div className="bg-amber-50 px-5 py-3 border-b border-amber-100">
                  <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                    改善ポイント
                  </h3>
                </div>
                <ul className="p-5 space-y-3">
                  {testEvaluation.weaknesses?.map((w, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Step CTA */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">次のステップ：ビデオ面接</h3>
                <p className="text-sm text-white/80 mb-1">
                  テスト結果を踏まえて、AIがあなたに合わせた面接を行います
                </p>
                <p className="text-xs text-white/60 mb-5">
                  カメラ・マイクを使用 / 全{maxInterviewQuestions}問 / 録画は自動で開始されます
                </p>
                <button
                  onClick={handleStartCameraSetup}
                  className="bg-white text-indigo-700 px-10 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  ビデオ面接に進む
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: Camera Setup
  if (phase === "camera_setup") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <InterviewHeader subtitle="面接準備" timerDisplay={timerDisplay} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-2xl w-full">
            {!cameraDenied && (
              <div className="relative rounded-2xl overflow-hidden bg-black mb-6 aspect-video max-w-lg mx-auto">
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
            )}

            {cameraReady && !cameraDenied && (
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-gray-700">カメラ OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-gray-700">マイク OK</span>
                </div>
              </div>
            )}

            {cameraDenied && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 max-w-lg mx-auto">
                <h3 className="text-amber-800 text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  カメラに接続できませんでした
                </h3>

                {permissionState === "denied" ? (
                  <>
                    <p className="text-amber-800 text-xs font-semibold mb-2">ブラウザでカメラがブロックされています</p>
                    <p className="text-amber-700 text-xs mb-2">以前「拒否」を選択したため、再度許可するには手動で設定を変更する必要があります：</p>
                    <div className="bg-white/60 rounded-lg p-3 mb-3">
                      <p className="text-amber-900 text-xs font-semibold mb-1.5">Chrome の場合：</p>
                      <ol className="text-amber-800 text-xs space-y-1 text-left list-decimal list-inside">
                        <li>アドレスバー左の <span className="font-mono bg-amber-100 px-1 rounded">🔒</span> または <span className="font-mono bg-amber-100 px-1 rounded">ⓘ</span> アイコンをクリック</li>
                        <li>「サイトの設定」をクリック</li>
                        <li>「カメラ」と「マイク」を「許可」に変更</li>
                        <li>このページに戻って <strong>リロード</strong>（⌘+R）</li>
                      </ol>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 mb-3">
                      <p className="text-amber-900 text-xs font-semibold mb-1.5">Safari の場合：</p>
                      <ol className="text-amber-800 text-xs space-y-1 text-left list-decimal list-inside">
                        <li>メニューバー「Safari」→「設定」→「Webサイト」</li>
                        <li>左側の「カメラ」「マイク」を選択</li>
                        <li>このサイトの設定を「許可」に変更</li>
                        <li>ページをリロード</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-amber-700 text-xs mb-2">カメラの接続に問題が発生しました。以下をお試しください：</p>
                    <ul className="text-amber-700 text-xs space-y-1 text-left mb-3">
                      <li>• 他のアプリがカメラを使用していないか確認</li>
                      <li>• ブラウザのカメラ許可ポップアップで「許可」を選択</li>
                      <li>• ページをリロードして再試行</li>
                    </ul>
                  </>
                )}

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    カメラなしでもテキスト入力で面接を受けられます
                  </p>
                </div>
              </div>
            )}

            {/* Voice Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 max-w-lg mx-auto">
              <h3 className="text-gray-900 text-sm font-semibold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                面接官の声を選択
              </h3>

              {/* Provider toggle */}
              <div className="flex gap-1.5 mb-4">
                <button
                  onClick={() => setVoiceProvider("edge")}
                  className={`flex-1 text-[11px] py-2 px-2 rounded-lg border transition-colors ${
                    voiceProvider === "edge"
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  Edge TTS
                </button>
                <button
                  onClick={() => setVoiceProvider("voicevox")}
                  className={`flex-1 text-[11px] py-2 px-2 rounded-lg border transition-colors ${
                    voiceProvider === "voicevox"
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  VOICEVOX
                </button>
                {googleTtsAvailable && (
                  <button
                    onClick={() => setVoiceProvider("google")}
                    className={`flex-1 text-[11px] py-2 px-2 rounded-lg border transition-colors ${
                      voiceProvider === "google"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    Google HD
                  </button>
                )}
              </div>

              {/* Voice selection */}
              {voiceProvider === "edge" ? (
                <div className="space-y-2">
                  {[
                    { id: "keita-interviewer", label: "男性面接官（落ち着いた声）", desc: "低めのトーン・ゆっくり" },
                    { id: "nanami-interviewer", label: "女性面接官（丁寧な声）", desc: "落ち着いたトーン" },
                    { id: "keita-casual", label: "男性（カジュアル）", desc: "標準的な男性の声" },
                    { id: "nanami-casual", label: "女性（カジュアル）", desc: "標準的な女性の声" },
                  ].map((v) => (
                    <label
                      key={v.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        edgePreset === v.id
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="edgePreset"
                        value={v.id}
                        checked={edgePreset === v.id}
                        onChange={() => setEdgePreset(v.id)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="text-xs font-medium text-gray-800">{v.label}</span>
                        <p className="text-[10px] text-gray-500">{v.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : voiceProvider === "voicevox" ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 mb-2">
                    VOICEVOXは日本製の高品質音声合成エンジンです。より自然で表情豊かな声が特徴です。
                    <br />※ 生成に数秒かかる場合があります
                  </p>
                  {[
                    { id: "ryusei", label: "青山龍星", desc: "落ち着いた男性の声・面接官向き", gender: "male" },
                    { id: "takehiro", label: "玄野武宏", desc: "穏やかな男性の声", gender: "male" },
                    { id: "shikoku-normal", label: "四国めたん", desc: "はっきりした女性の声", gender: "female" },
                    { id: "tsumugi", label: "春日部つむぎ", desc: "明るい女性の声", gender: "female" },
                    { id: "himari", label: "冥鳴ひまり", desc: "柔らかい女性の声", gender: "female" },
                  ].map((v) => (
                    <label
                      key={v.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        voicevoxSpeaker === v.id
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="voicevoxSpeaker"
                        value={v.id}
                        checked={voicevoxSpeaker === v.id}
                        onChange={() => setVoicevoxSpeaker(v.id)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-800">{v.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          v.gender === "male" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
                        }`}>
                          {v.gender === "male" ? "男性" : "女性"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 ml-auto">{v.desc}</p>
                    </label>
                  ))}
                </div>
              ) : voiceProvider === "google" ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 mb-2">
                    Google Cloud TTSは最高品質の音声合成エンジンです。WaveNet・Neural2音声が利用できます。
                  </p>
                  {[
                    { id: "wavenet-male-d", label: "男性B（落ち着いた声）", desc: "面接官向き", gender: "male" },
                    { id: "wavenet-male-c", label: "男性A（深みのある声）", desc: "重厚なトーン", gender: "male" },
                    { id: "neural2-male", label: "男性（Neural2）", desc: "最高品質", gender: "male" },
                    { id: "wavenet-female-a", label: "女性A（落ち着いた声）", desc: "プロフェッショナル", gender: "female" },
                    { id: "wavenet-female-b", label: "女性B（ハキハキした声）", desc: "明るいトーン", gender: "female" },
                    { id: "neural2-female", label: "女性（Neural2）", desc: "最高品質", gender: "female" },
                  ].map((v) => (
                    <label
                      key={v.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        googleVoice === v.id
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="googleVoice"
                        value={v.id}
                        checked={googleVoice === v.id}
                        onChange={() => setGoogleVoice(v.id)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-800">{v.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          v.gender === "male" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
                        }`}>
                          {v.gender === "male" ? "男性" : "女性"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 ml-auto">{v.desc}</p>
                    </label>
                  ))}
                </div>
              ) : null}

              {/* Test voice button */}
              <button
                onClick={async () => {
                  setIsTestingVoice(true);
                  await speakQuestion("こんにちは。本日は面接にお越しいただきありがとうございます。リラックスしてお答えください。");
                  setIsTestingVoice(false);
                }}
                disabled={isTestingVoice || isSpeaking}
                className="mt-3 w-full text-xs py-2 px-4 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isTestingVoice || isSpeaking ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600" />
                    再生中...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    声をテスト再生
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 max-w-lg mx-auto">
              <h3 className="text-gray-900 text-sm font-semibold mb-3">面接の進め方</h3>
              <ul className="text-gray-600 text-xs space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">1.</span>
                  面接開始と同時に録画・音声認識が自動で始まります
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">2.</span>
                  {cameraDenied ? "テキストで回答を入力してください" : "AIの質問に声で回答、またはテキストで入力"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">3.</span>
                  回答が終わったら「回答を送信」を押してください
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">4.</span>
                  全{maxInterviewQuestions}問で終了、AIが総合評価します
                </li>
              </ul>
            </div>

            {/* Data sharing notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 max-w-lg mx-auto">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-blue-800 mb-1">録画データについて</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    面接中の映像・音声・回答内容は全て記録され、応募先企業の採用判断に使用されます。
                    面接開始後は最初から最後まで継続的に録画されます。
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3 max-w-lg mx-auto">
              <button
                onClick={handleStartVideoInterview}
                className="w-full bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-lg inline-flex items-center justify-center gap-2"
              >
                {cameraDenied ? "テキストモードで面接を始める" : "面接を始める"}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {cameraDenied && (
                <button
                  onClick={() => { setCameraDenied(false); setCameraReady(false); startCamera(); }}
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  カメラ接続を再試行する
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3: Video Interview
  if (phase === "interview") {
    const answeredInterviewCount = interviewQuestionCount - 1;
    const interviewProgress = (answeredInterviewCount / maxInterviewQuestions) * 100;

    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Header - same white style as other pages */}
        <header className="border-b border-gray-200 bg-white px-4 py-2 z-40 flex-shrink-0" style={{ isolation: "isolate", transform: "translateZ(0)", backfaceVisibility: "hidden" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/interview" className="flex items-center gap-2 flex-shrink-0">
                <Logo size="xs" />
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500 whitespace-nowrap">ビデオ面接</span>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-[10px] text-gray-400">面接進行</span>
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${interviewProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{answeredInterviewCount}/{maxInterviewQuestions} 回答済み</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Always-on recording indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-red-600 font-semibold">REC</span>
                <span className="text-[10px] text-red-500 font-mono">{formatTime(timerSeconds)}</span>
              </div>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                {formatTime(timerSeconds)}
              </span>
              <span className="text-[10px] text-gray-400">
                質問 {interviewQuestionCount}/{maxInterviewQuestions}
              </span>
              {/* Screen recording toggle */}
              <button
                onClick={isScreenRecording ? stopScreenRecording : startScreenRecording}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                  isScreenRecording
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {isScreenRecording ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    録画中
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    画面録画
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main content: Left 2/3 camera, Right 1/3 AI */}
        <div className="flex-1 flex min-h-0">
          {/* Left: Camera feed (2/3) */}
          <div className="w-2/3 relative bg-gray-900 flex items-center justify-center">
            {!cameraDenied && streamRef.current ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {/* Continuous recording indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1.5 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="text-xs text-white font-medium">録画中</span>
                </div>
                {/* Data notice */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[10px] text-white/80">面接の全録画データは応募先企業に提供されます</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">カメラが無効です</p>
                <p className="text-gray-500 text-xs mt-1">テキスト入力で回答できます</p>
              </div>
            )}
          </div>

          {/* Right: AI Question panel (1/3) */}
          <div className="w-1/3 bg-white flex flex-col min-h-0 border-l border-gray-200">
            {aiThinking ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-xs">AIが次の質問を準備中...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Question area */}
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Q{currentQuestion?.questionNumber || 1}
                    </span>
                    <span className="text-gray-400 text-[10px]">/ {maxInterviewQuestions}</span>
                    {/* Speaker icon to replay TTS */}
                    <button
                      onClick={() => {
                        if (isSpeaking) {
                          stopSpeaking();
                        } else if (currentQuestion?.question) {
                          speakQuestion(currentQuestion.question);
                        }
                      }}
                      className={`ml-auto flex items-center gap-1 text-[10px] transition-colors ${
                        isSpeaking ? "text-red-500 hover:text-red-700" : "text-indigo-500 hover:text-indigo-700"
                      }`}
                      title={isSpeaking ? "読み上げを停止" : "質問を読み上げる"}
                    >
                      {isSpeaking ? (
                        <>
                          <div className="w-3.5 h-3.5 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-sm bg-red-500" />
                          </div>
                          停止
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l4.2-3.15A1 1 0 0112 6.5v11a1 1 0 01-1.3.95L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z" />
                          </svg>
                          再生
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-indigo-50 rounded-xl p-4 mb-4 border border-indigo-100">
                    <p className="text-gray-900 text-sm leading-7 font-medium whitespace-pre-line">
                      {currentQuestion?.question || ""}
                    </p>
                  </div>

                  {/* Transcript */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span className="text-[10px] text-gray-500">あなたの回答</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] max-h-[120px] overflow-y-auto border border-gray-100">
                      {transcript ? (
                        <p className="text-gray-800 text-xs leading-relaxed">{transcript}</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            <div className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                            <div className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                            <div className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                          </div>
                          <p className="text-gray-400 text-xs">音声を聞き取っています...</p>
                        </div>
                      )}
                    </div>

                    {/* Fallback text input - always available */}
                    <div className="mt-2">
                      <textarea
                        value={fallbackText}
                        onChange={(e) => setFallbackText(e.target.value)}
                        placeholder="テキストでも入力できます..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Controls - fixed at bottom */}
                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!transcript.trim() && !fallbackText.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-2"
                  >
                    回答を送信
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleEndInterview}
                    className="w-full text-red-400 text-[10px] hover:text-red-500 transition-colors py-1"
                  >
                    面接を終了する
                  </button>
                </div>
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
        <InterviewHeader subtitle="評価中" timerDisplay={timerDisplay} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
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
    const overallScore = evaluation.overallScore;
    const resultCircumference = 2 * Math.PI * 54;
    const resultStrokeDashoffset = resultCircumference - (overallScore / 100) * resultCircumference;
    const resultColor = overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#6366f1" : overallScore >= 40 ? "#f59e0b" : "#ef4444";

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <InterviewHeader subtitle="評価結果" timerDisplay={timerDisplay} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Hero Score Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className="relative w-36 h-36 flex-shrink-0">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke={resultColor}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={resultCircumference}
                      strokeDashoffset={resultStrokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{overallScore}</span>
                    <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="text-center md:text-left flex-1">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ backgroundColor: `${resultColor}20`, color: resultColor }}>
                    {evaluation.recommendation}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{evaluation.summary}</p>
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "技術力", score: evaluation.technicalScore, icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", bg: "from-indigo-500 to-blue-500" },
                { label: "コミュニケーション", score: evaluation.communicationScore, icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", bg: "from-emerald-500 to-teal-500" },
                { label: "問題解決力", score: evaluation.problemSolvingScore, icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", bg: "from-amber-500 to-orange-500" },
              ].map(({ label, score, icon, bg }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center mx-auto mb-3`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-3">{score}<span className="text-sm text-gray-400 font-normal">/100</span></p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${bg} rounded-full transition-all duration-1000`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
                  <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    あなたの強み
                  </h3>
                </div>
                <ul className="p-5 space-y-3">
                  {evaluation.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
                <div className="bg-amber-50 px-5 py-3 border-b border-amber-100">
                  <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                    改善ポイント
                  </h3>
                </div>
                <ul className="p-5 space-y-3">
                  {evaluation.improvements?.map((w, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  詳細フィードバック
                </h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{evaluation.detailedFeedback}</p>
              </div>
            </div>

            {/* Test Results Summary */}
            {testEvaluation && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">オンラインテスト結果</h3>
                      <p className="text-xs text-gray-500">{testEvaluation.totalScore}/{testEvaluation.maxScore}点 獲得</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{testEvaluation.percentage}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recording Download */}
            {screenRecordingUrl && (
              <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">面接の画面録画</h3>
                      <p className="text-xs text-gray-500">ダウンロードして復習できます</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadScreenRecording}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ダウンロード
                  </button>
                </div>
              </div>
            )}

            {/* Data Sharing Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700">
                  この面接結果（評価スコア・録画データ・回答内容）は応募先企業に提供されます。
                  企業はこのデータを採用判断の参考として使用します。
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/home")}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                ホームに戻る
              </button>
              <button
                onClick={() => router.push("/interview")}
                className="bg-white text-gray-700 px-8 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
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


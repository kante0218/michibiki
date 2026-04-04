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
  hint?: string;
  difficulty: string;
  timeLimit: number;
  points: number;
}

interface InterviewQuestion {
  question: string;
  questionNumber: number;
}

interface ProductionInterview {
  id: string;
  candidate_id: string;
  job_posting_id: string;
  company_id: string;
  status: "pending" | "in_progress" | "completed" | "analyzed";
  questions: TestQuestion[];
  answers: unknown[];
  conversation_log: unknown[];
  recording_path: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface JobInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  company_id: string;
}

interface CompanyInfo {
  id: string;
  name: string;
}

type Phase =
  | "loading"
  | "already_completed"
  | "instructions"
  | "camera_setup"
  | "test"
  | "interview"
  | "submitting"
  | "completed";

// Header component
const LiveInterviewHeader = ({
  subtitle,
  timerDisplay,
  showRec,
  showQuestionCount,
  questionCount,
  maxQuestions,
}: {
  subtitle: string;
  timerDisplay: string;
  showRec: boolean;
  showQuestionCount: boolean;
  questionCount: number;
  maxQuestions: number;
}) => (
  <header
    className="border-b border-gray-200 bg-white sticky top-0 z-40"
    style={{ isolation: "isolate", transform: "translateZ(0)", backfaceVisibility: "hidden" }}
  >
    <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
      <div className="flex items-center gap-3">
        <a href="/home" className="flex items-center gap-2 flex-shrink-0">
          <Logo size="xs" />
        </a>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500 whitespace-nowrap">{subtitle}</span>
      </div>
      <div className="flex items-center gap-3">
        {showRec && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-600 font-medium">REC</span>
          </div>
        )}
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          {timerDisplay}
        </span>
        {showQuestionCount && (
          <span className="text-xs text-gray-400">
            {questionCount}/{maxQuestions}
          </span>
        )}
      </div>
    </div>
  </header>
);

export default function LiveInterviewPage() {
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
      <LiveInterviewContent />
    </Suspense>
  );
}

function LiveInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const interviewId = searchParams.get("interviewId");

  // Phase management
  const [phase, setPhase] = useState<Phase>("loading");

  // Interview data
  const [interview, setInterview] = useState<ProductionInterview | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  // Test state
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentTestQ, setCurrentTestQ] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});

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

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Error
  const [error, setError] = useState("");

  // Interview recording (always-on during interview phase)
  const interviewRecorderRef = useRef<MediaRecorder | null>(null);
  const interviewChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const speechSegmentsRef = useRef<{ start: number; end: number }[]>([]);
  const currentSpeechStartRef = useRef<number | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Permission state
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted" | "unknown">("unknown");

  // TTS
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fallback text input
  const [fallbackText, setFallbackText] = useState("");

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
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  // -------------------------------------------------------
  // Camera functions
  // -------------------------------------------------------
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
      setPermissionState("granted");
      setCameraDenied(false);
      setCameraReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        setPermissionState("denied");
      } else {
        setPermissionState("unknown");
      }
      setCameraDenied(true);
      setCameraReady(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  // -------------------------------------------------------
  // Speech Recognition
  // -------------------------------------------------------
  const startRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

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
          if (currentSpeechStartRef.current !== null && recordingStartTimeRef.current > 0) {
            speechSegmentsRef.current.push({
              start: currentSpeechStartRef.current,
              end: (Date.now() - recordingStartTimeRef.current) / 1000,
            });
            currentSpeechStartRef.current = null;
          }
        } else {
          interim += t;
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
        try { recognition.stop(); } catch { /* ignore */ }
        setTimeout(() => {
          try { recognition.start(); } catch { /* ignore */ }
        }, 100);
      }
    };

    recognition.onend = () => {
      if (currentSpeechStartRef.current !== null && recordingStartTimeRef.current > 0) {
        speechSegmentsRef.current.push({
          start: currentSpeechStartRef.current,
          end: (Date.now() - recordingStartTimeRef.current) / 1000,
        });
        currentSpeechStartRef.current = null;
      }
      if (isRecording) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch { /* ignore */ }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
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

  // -------------------------------------------------------
  // TTS
  // -------------------------------------------------------
  const speakQuestion = useCallback(async (text: string) => {
    try {
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
      setIsSpeaking(true);

      // Fish Audio TTS: returns audio blob directly
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
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
      try {
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "ja-JP";
          u.rate = 0.95;
          u.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(u);
        }
      } catch { /* ignore */ }
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    setIsSpeaking(false);
  }, []);

  // -------------------------------------------------------
  // Interview recording functions
  // -------------------------------------------------------
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
        videoBitsPerSecond: 500000,
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) interviewChunksRef.current.push(e.data);
      };
      recorder.start(1000);
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
        resolve(
          interviewChunksRef.current.length > 0
            ? new Blob(interviewChunksRef.current, { type: recorder?.mimeType || "video/webm" })
            : null
        );
        interviewRecorderRef.current = null;
        return;
      }

      if (currentSpeechStartRef.current !== null) {
        speechSegmentsRef.current.push({
          start: currentSpeechStartRef.current,
          end: (Date.now() - recordingStartTimeRef.current) / 1000,
        });
        currentSpeechStartRef.current = null;
      }

      recorder.onstop = () => {
        const blob =
          interviewChunksRef.current.length > 0
            ? new Blob(interviewChunksRef.current, { type: recorder.mimeType })
            : null;
        interviewRecorderRef.current = null;
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  const uploadInterviewRecording = useCallback(
    async (blob: Blob) => {
      if (!user || !blob || !interviewId) return;
      try {
        const fileId = crypto.randomUUID();
        const ext = blob.type.includes("mp4") ? "mp4" : "webm";
        const fileName = `${user.id}/${interviewId}/${fileId}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("interview-recordings")
          .upload(fileName, blob, { contentType: blob.type, upsert: false });

        if (uploadError) {
          console.error("Recording upload failed:", uploadError);
          return;
        }

        const duration = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);

        // Update production_interviews with recording info
        await (supabase.from("production_interviews") as ReturnType<typeof supabase.from>)
          .update({
            recording_path: fileName,
            recording_duration_seconds: duration,
            speech_segments: speechSegmentsRef.current,
          } as Record<string, unknown>)
          .eq("id", interviewId);

        console.log(
          "Interview recording uploaded:",
          fileName,
          `${(blob.size / 1024 / 1024).toFixed(1)}MB`,
          `${speechSegmentsRef.current.length} segments`
        );
      } catch (err) {
        console.error("Failed to upload recording:", err);
      }
    },
    [user, interviewId]
  );

  // -------------------------------------------------------
  // Load interview data
  // -------------------------------------------------------
  useEffect(() => {
    if (!user || !interviewId || phase !== "loading") return;

    const loadInterview = async () => {
      try {
        // Fetch production interview
        const { data: interviewData, error: interviewError } = await (
          supabase.from("production_interviews") as ReturnType<typeof supabase.from>
        )
          .select("*")
          .eq("id", interviewId)
          .single();

        if (interviewError || !interviewData) {
          setError("面接データが見つかりませんでした。URLを確認してください。");
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pi = interviewData as any as ProductionInterview;

        // Verify candidate matches current user
        if (pi.candidate_id !== user.id) {
          setError("この面接はあなたに割り当てられていません。");
          return;
        }

        // Check if already completed
        if (pi.status === "completed" || pi.status === "analyzed") {
          setInterview(pi);
          setPhase("already_completed");
          return;
        }

        if (pi.status === "in_progress") {
          // Allow resuming if it was in_progress (e.g., page refresh)
          // We'll treat it as if they can continue
        }

        setInterview(pi);

        // Parse questions
        if (Array.isArray(pi.questions) && pi.questions.length > 0) {
          setTestQuestions(pi.questions);
        }

        // Fetch job info
        const { data: jobData } = await (
          supabase.from("jobs") as ReturnType<typeof supabase.from>
        )
          .select("id, title, description, category, company_id")
          .eq("id", pi.job_posting_id)
          .single();

        if (jobData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const j = jobData as any as JobInfo;
          setJobInfo(j);

          // Fetch company info
          const { data: companyData } = await (
            supabase.from("companies") as ReturnType<typeof supabase.from>
          )
            .select("id, name")
            .eq("id", j.company_id)
            .single();

          if (companyData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setCompanyInfo(companyData as any as CompanyInfo);
          }
        }

        setPhase("instructions");
      } catch (err) {
        console.error("Failed to load interview:", err);
        setError("面接データの読み込みに失敗しました。もう一度お試しください。");
      }
    };

    loadInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, interviewId, phase]);

  // -------------------------------------------------------
  // Test navigation
  // -------------------------------------------------------
  const handleTestAnswer = (questionId: number, answer: string) => {
    setTestAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextTestQuestion = () => {
    if (currentTestQ < testQuestions.length - 1) setCurrentTestQ((q) => q + 1);
  };

  const handlePrevTestQuestion = () => {
    if (currentTestQ > 0) setCurrentTestQ((q) => q - 1);
  };

  // -------------------------------------------------------
  // Start interview flow
  // -------------------------------------------------------
  const handleStartInterview = async () => {
    if (!interviewId) return;

    try {
      // Call API to mark interview as in_progress
      const res = await fetch("/api/production-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_interview",
          productionInterviewId: interviewId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      setPhase("camera_setup");
    } catch {
      setError("面接の開始に失敗しました。もう一度お試しください。");
    }
  };

  // -------------------------------------------------------
  // Camera setup -> Test
  // -------------------------------------------------------
  const handleStartCameraSetup = async () => {
    setPhase("camera_setup");
    if (streamRef.current) {
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
      }, 100);
    } else {
      setCameraDenied(false);
      setCameraReady(false);
      await startCamera();
    }
  };

  const handleProceedToTest = () => {
    if (testQuestions.length > 0) {
      setPhase("test");
      setTimerSeconds(0);
      setIsTimerRunning(true);

      // Start recording automatically
      if (streamRef.current) {
        setTimeout(() => {
          startInterviewRecording();
        }, 200);
      }
    } else {
      // No test questions, go directly to video interview
      handleStartVideoInterview();
    }
  };

  // -------------------------------------------------------
  // Submit test -> Start video interview
  // -------------------------------------------------------
  const handleSubmitTest = async () => {
    setIsTimerRunning(false);

    // Store answers formatted for submission
    const formattedAnswers = testQuestions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: testAnswers[q.id] || "",
    }));

    // Submit answers to API
    try {
      await fetch("/api/production-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_answers",
          productionInterviewId: interviewId,
          answers: formattedAnswers,
        }),
      });
    } catch (err) {
      console.error("Failed to submit test answers:", err);
    }

    // Proceed to video interview
    handleStartVideoInterview();
  };

  // -------------------------------------------------------
  // Video interview
  // -------------------------------------------------------
  const handleStartVideoInterview = async () => {
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setAiThinking(true);
    setPhase("interview");

    setTimeout(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      // Start recording if not already started
      if (!interviewRecorderRef.current) {
        startInterviewRecording();
      }
    }, 200);

    try {
      const res = await fetch("/api/production-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_question",
          productionInterviewId: interviewId,
          questionNumber: 1,
          conversationHistory: [],
          category: jobInfo?.category || "general",
        }),
      });
      const data = await res.json();
      if (data.error) {
        const msg = data.error.includes("Overloaded")
          ? "AIサーバーが混雑しています。しばらく待ってから再試行してください。"
          : data.error;
        setError(msg);
        setPhase("instructions");
        return;
      }
      setCurrentQuestion({ question: data.question, questionNumber: 1 });
      setConversationHistory(data.conversationHistory || []);
      setInterviewQuestionCount(1);
      speakQuestion(data.question);
    } catch {
      setError("面接の開始に失敗しました。もう一度お試しください。");
      setPhase("instructions");
    } finally {
      setAiThinking(false);
    }
  };

  // Submit video answer
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
        await handleCompleteInterview(updatedHistory);
        return;
      }

      // Get next question
      const res = await fetch("/api/production-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_question",
          productionInterviewId: interviewId,
          questionNumber: newCount,
          conversationHistory: updatedHistory,
          category: jobInfo?.category || "general",
        }),
      });
      const data = await res.json();
      if (data.error) {
        const msg = data.error.includes("Overloaded")
          ? "AIサーバーが混雑しています。しばらく待ってから再試行してください。"
          : data.error;
        setError(msg);
        return;
      }

      setCurrentQuestion({ question: data.question, questionNumber: newCount });
      setConversationHistory(data.conversationHistory || updatedHistory);
      setInterviewQuestionCount(newCount);
      setTranscript("");
      speakQuestion(data.question);
    } catch {
      setError("AIからの応答に失敗しました。");
    } finally {
      setAiThinking(false);
    }
  };

  const handleEndInterview = async () => {
    handleStopRecording();
    stopSpeaking();
    await handleCompleteInterview(conversationHistory);
  };

  const handleCompleteInterview = async (finalConversation: { role: "user" | "assistant"; content: string }[]) => {
    // Stop recording and upload
    const recordingBlob = await stopInterviewRecording();
    setPhase("submitting");
    setIsTimerRunning(false);
    stopCamera();

    // Upload recording
    if (recordingBlob) {
      await uploadInterviewRecording(recordingBlob);
    }

    // Save conversation log
    try {
      await (supabase.from("production_interviews") as ReturnType<typeof supabase.from>)
        .update({
          conversation_log: finalConversation,
          status: "completed",
          completed_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq("id", interviewId);
    } catch (err) {
      console.error("Failed to update interview:", err);
    }

    // Trigger analysis in background
    try {
      fetch("/api/production-interview/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          productionInterviewId: interviewId,
        }),
      }).catch((err) => console.error("Analysis trigger failed:", err));
    } catch {
      // Analysis is async, don't block on failure
    }

    setPhase("completed");
  };

  // -------------------------------------------------------
  // Render guards
  // -------------------------------------------------------
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

  if (!interviewId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">面接IDが指定されていません</h2>
          <p className="text-gray-500 text-sm mb-6">面接のURLを確認してください。</p>
          <button
            onClick={() => router.push("/home")}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const timerDisplay = formatTime(timerSeconds);

  // Error display
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LiveInterviewHeader subtitle="エラー" timerDisplay={timerDisplay} showRec={false} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => router.push("/home")}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // PHASE: Loading
  // -------------------------------------------------------
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LiveInterviewHeader subtitle="本番面接" timerDisplay="--:--" showRec={false} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">面接データを読み込み中...</h2>
            <p className="text-sm text-gray-500">しばらくお待ちください</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // PHASE: Already completed
  // -------------------------------------------------------
  if (phase === "already_completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LiveInterviewHeader subtitle="本番面接" timerDisplay="--:--" showRec={false} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">この面接は既に完了しています</h2>
            <p className="text-gray-500 text-sm mb-8">
              面接結果は企業側に送信されています。
            </p>
            <button
              onClick={() => router.push("/home")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // PHASE: Instructions
  // -------------------------------------------------------
  if (phase === "instructions") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LiveInterviewHeader subtitle="本番面接" timerDisplay="--:--" showRec={false} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Interview info card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">本番面接</h1>
                <p className="text-gray-500 text-sm">以下の内容をご確認の上、面接を開始してください</p>
              </div>

              <div className="space-y-4 mb-8">
                {jobInfo && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">求人タイトル</p>
                      <p className="text-sm font-semibold text-gray-900">{jobInfo.title}</p>
                    </div>
                  </div>
                )}

                {companyInfo && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">企業</p>
                      <p className="text-sm font-semibold text-gray-900">{companyInfo.name}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">問題数</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {testQuestions.length > 0 ? `${testQuestions.length}問` : "なし"} + ビデオ面接{maxInterviewQuestions}問
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">所要時間目安</p>
                      <p className="text-sm font-semibold text-gray-900">約30〜45分</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-red-800 text-sm font-semibold mb-1">重要な注意事項</p>
                    <p className="text-red-700 text-sm leading-relaxed">
                      この面接は一度のみ受験可能です。開始すると中断できません。
                      安定したインターネット環境で、静かな場所から受験してください。
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-gray-50 rounded-xl p-5 mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">必要なもの</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    カメラとマイク（ビデオ面接で使用）
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    安定したインターネット接続
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    静かな環境
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={handleStartInterview}
                  className="bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-lg inline-flex items-center gap-2"
                >
                  面接を開始する
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // PHASE: Camera Setup
  // -------------------------------------------------------
  if (phase === "camera_setup") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LiveInterviewHeader subtitle="面接準備" timerDisplay={timerDisplay} showRec={false} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
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
                        <li>アドレスバー左のアイコンをクリック</li>
                        <li>「サイトの設定」をクリック</li>
                        <li>「カメラ」と「マイク」を「許可」に変更</li>
                        <li>このページをリロード</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-amber-700 text-xs mb-2">カメラの接続に問題が発生しました。以下をお試しください：</p>
                    <ul className="text-amber-700 text-xs space-y-1 text-left mb-3">
                      <li>- 他のアプリがカメラを使用していないか確認</li>
                      <li>- ブラウザのカメラ許可ポップアップで「許可」を選択</li>
                      <li>- ページをリロードして再試行</li>
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

            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 max-w-lg mx-auto">
              <h3 className="text-gray-900 text-sm font-semibold mb-3">面接の流れ</h3>
              <ul className="text-gray-600 text-xs space-y-2 text-left">
                {testQuestions.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">1.</span>
                    オンラインテスト（{testQuestions.length}問）
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">{testQuestions.length > 0 ? "2." : "1."}</span>
                  AIビデオ面接（{maxInterviewQuestions}問）
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">{testQuestions.length > 0 ? "3." : "2."}</span>
                  面接完了 - 結果は企業に送信されます
                </li>
              </ul>
            </div>

            <div className="text-center space-y-3 max-w-lg mx-auto">
              <button
                onClick={handleProceedToTest}
                className="w-full bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-lg inline-flex items-center justify-center gap-2"
              >
                {cameraDenied ? "テキストモードで進む" : testQuestions.length > 0 ? "テストを開始する" : "面接を始める"}
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

  // -------------------------------------------------------
  // PHASE: Test
  // -------------------------------------------------------
  if (phase === "test") {
    const q = testQuestions[currentTestQ];
    if (!q) return null;

    const answeredCount = Object.keys(testAnswers).length;
    const progress = (currentTestQ / testQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LiveInterviewHeader
          subtitle="オンラインテスト"
          timerDisplay={timerDisplay}
          showRec={!!interviewRecorderRef.current}
          showQuestionCount={false}
          questionCount={0}
          maxQuestions={maxInterviewQuestions}
        />

        <div className="bg-white border-b border-gray-100 px-4 py-2">
          <div className="max-w-screen-lg mx-auto flex items-center gap-4">
            <span className="text-xs text-gray-500">問題 {currentTestQ + 1}/{testQuestions.length}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-500">{answeredCount}/{testQuestions.length} 回答済み</span>
          </div>
        </div>

        {/* Camera PiP */}
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
              <span className="text-xs text-gray-400">-</span>
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none font-mono bg-gray-900 text-green-400"
                />
              )}
            </div>

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

  // -------------------------------------------------------
  // PHASE: Video Interview
  // -------------------------------------------------------
  if (phase === "interview") {
    const answeredInterviewCount = interviewQuestionCount - 1;
    const interviewProgress = (answeredInterviewCount / maxInterviewQuestions) * 100;

    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-4 py-2 z-40 flex-shrink-0" style={{ isolation: "isolate", transform: "translateZ(0)", backfaceVisibility: "hidden" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/home" className="flex items-center gap-2 flex-shrink-0">
                <Logo size="xs" />
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500 whitespace-nowrap">本番面接</span>
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
              {interviewRecorderRef.current && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-red-600 font-medium">REC</span>
                </div>
              )}
              {isRecording && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-500 font-mono">{formatTime(recordingSeconds)}</span>
                </div>
              )}
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                {formatTime(timerSeconds)}
              </span>
              <span className="text-[10px] text-gray-400">
                {interviewQuestionCount}/{maxInterviewQuestions}
              </span>
            </div>
          </div>
        </header>

        {/* Main content: Left 2/3 camera, Right 1/3 AI */}
        <div className="flex-1 flex min-h-0">
          {/* Left: Camera feed */}
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
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1.5 rounded-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span className="text-xs text-white font-medium">REC {formatTime(recordingSeconds)}</span>
                  </div>
                )}
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

          {/* Right: AI Question panel */}
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
                      ) : isRecording ? (
                        <p className="text-gray-400 text-xs animate-pulse">話してください...</p>
                      ) : (
                        <p className="text-gray-400 text-xs">録画を開始して回答してください</p>
                      )}
                    </div>

                    {/* Fallback text input */}
                    {!isRecording && (
                      <div className="mt-2">
                        <textarea
                          value={fallbackText}
                          onChange={(e) => setFallbackText(e.target.value)}
                          placeholder="テキストで入力..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    {!isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <div className="w-3 h-3 rounded-full bg-white" />
                        録画開始
                      </button>
                    ) : (
                      <button
                        onClick={handleStopRecording}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <div className="w-3 h-3 rounded bg-white" />
                        録画停止
                      </button>
                    )}

                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!transcript.trim() && !fallbackText.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      回答を送信
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
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

  // -------------------------------------------------------
  // PHASE: Submitting
  // -------------------------------------------------------
  if (phase === "submitting") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LiveInterviewHeader subtitle="処理中" timerDisplay={timerDisplay} showRec={false} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">面接結果を処理中...</h2>
            <p className="text-sm text-gray-500">録画のアップロードと結果の送信を行っています。しばらくお待ちください。</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // PHASE: Completed
  // -------------------------------------------------------
  if (phase === "completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LiveInterviewHeader subtitle="面接完了" timerDisplay={timerDisplay} showRec={false} showQuestionCount={false} questionCount={0} maxQuestions={maxInterviewQuestions} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">面接が完了しました</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              結果は企業側に送信されます。ご参加ありがとうございました。
            </p>
            <button
              onClick={() => router.push("/home")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

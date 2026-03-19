"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/ExploreHeader";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

// --- Types ---
type Tab = "contracts" | "offers" | "applications" | "assessments" | "saved";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"] & {
  companies: { name: string } | null;
};
type OfferRow = Database["public"]["Tables"]["offers"]["Row"];
type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"] & {
  jobs: {
    title: string;
    company_id: string;
    companies: { name: string } | null;
  } | null;
};
type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];
type SavedJobRow = Database["public"]["Tables"]["saved_jobs"]["Row"] & {
  jobs: Database["public"]["Tables"]["jobs"]["Row"] | null;
};

interface Toast {
  id: number;
  message: string;
  type: "success" | "info" | "error";
}

// --- Status mappings ---
const contractStatusMap: Record<string, string> = {
  active: "アクティブ",
  paused: "一時停止",
  completed: "完了",
  cancelled: "キャンセル",
};

const offerStatusMap: Record<string, string> = {
  pending: "新着",
  accepted: "承諾済み",
  declined: "辞退済み",
  expired: "期限切れ",
};

const appStatusMap: Record<string, string> = {
  submitted: "提出済み",
  screening: "選考中",
  interview: "面接予定",
  offered: "内定",
  rejected: "不採用",
  accepted: "承諾済み",
};

const assessmentStatusMap: Record<string, string> = {
  not_started: "未完了",
  in_progress: "進行中",
  completed: "完了",
};

// --- Helpers ---
const appStatusColors: Record<string, string> = {
  選考中: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  提出済み: "bg-blue-50 text-blue-700 border border-blue-200",
  面接予定: "bg-amber-50 text-amber-700 border border-amber-200",
  不採用: "bg-gray-100 text-gray-500 border border-gray-200",
  内定: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  承諾済み: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  進行中: "bg-blue-50 text-blue-700 border border-blue-200",
};

const offerStatusColors: Record<string, string> = {
  新着: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  検討中: "bg-amber-50 text-amber-700 border border-amber-200",
  期限切れ: "bg-gray-100 text-gray-500 border border-gray-200",
  承諾済み: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  辞退済み: "bg-red-50 text-red-600 border border-red-200",
};

const contractStatusColors: Record<string, string> = {
  active: "border-l-emerald-500",
  paused: "border-l-amber-500",
  completed: "border-l-gray-400",
  cancelled: "border-l-red-400",
};

const companyGradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-purple-600",
  "from-teal-500 to-cyan-600",
  "from-orange-500 to-red-600",
  "from-violet-500 to-indigo-600",
];

function getCompanyGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return companyGradients[Math.abs(hash) % companyGradients.length];
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// --- Tab Icons ---
const tabIcons: Record<Tab, React.ReactNode> = {
  contracts: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  offers: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  applications: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  assessments: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  saved: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
};

// --- Toast Component ---
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-3 min-w-[300px] backdrop-blur-sm transition-all ${
            toast.type === "success"
              ? "bg-emerald-600/95 text-white shadow-emerald-200/50"
              : toast.type === "error"
              ? "bg-red-600/95 text-white shadow-red-200/50"
              : "bg-gray-800/95 text-white shadow-gray-300/30"
          }`}
          style={{
            animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {toast.type === "success" && (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {toast.type === "error" && (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          {toast.type === "info" && (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-1 hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// --- Modal Backdrop ---
function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ animation: "modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </div>
    </div>
  );
}

// --- Loading Spinner ---
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
      <p className="text-sm text-gray-500">読み込み中...</p>
    </div>
  );
}

// --- Main Component ---
export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("contracts");
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

  // Data state
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJobRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [linkedInConnected, setLinkedInConnected] = useState<boolean | null>(null);
  const [linkedInLinking, setLinkedInLinking] = useState(false);

  // Interactive state
  const [timesheetModal, setTimesheetModal] = useState<string | null>(null);
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [expandedApplication, setExpandedApplication] = useState<string | null>(
    null
  );
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(
    null
  );
  const [offerActionModal, setOfferActionModal] = useState<{
    type: "accept" | "decline";
    offerId: string;
  } | null>(null);
  const [assessmentStartModal, setAssessmentStartModal] = useState<
    string | null
  >(null);

  // Timesheet form state
  const [tsDate, setTsDate] = useState("");
  const [tsHours, setTsHours] = useState("");
  const [tsDescription, setTsDescription] = useState("");
  const [tsSubmitting, setTsSubmitting] = useState(false);

  // Decline reason state
  const [declineReason, setDeclineReason] = useState("");

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Check LinkedIn connection
  useEffect(() => {
    if (!user) return;
    async function checkLinkedIn() {
      try {
        const { getLinkedIdentities } = await import("@/lib/auth");
        const { identities } = await getLinkedIdentities();
        const hasLinkedIn = identities.some(
          (id: { provider: string }) => id.provider === "linkedin_oidc"
        );
        setLinkedInConnected(hasLinkedIn);
      } catch {
        setLinkedInConnected(false);
      }
    }
    checkLinkedIn();
  }, [user]);

  const handleLinkLinkedIn = async () => {
    setLinkedInLinking(true);
    try {
      const { linkLinkedInAccount } = await import("@/lib/auth");
      const { error } = await linkLinkedInAccount();
      if (error) {
        addToast("LinkedIn連携に失敗しました", "error");
        setLinkedInLinking(false);
      }
    } catch {
      addToast("LinkedIn連携中にエラーが発生しました", "error");
      setLinkedInLinking(false);
    }
  };

  // Fetch all data
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setDataLoading(true);

      const [contractsRes, offersRes, applicationsRes, assessmentsRes, savedRes] =
        await Promise.all([
          (supabase.from("contracts") as any)
            .select("*, companies(name)")
            .eq("worker_id", user!.id),
          (supabase.from("offers") as any).select("*").eq("worker_id", user!.id),
          (supabase.from("applications") as any)
            .select("*, jobs(title, company_id, companies(name))")
            .eq("user_id", user!.id),
          (supabase.from("assessments") as any).select("*").eq("user_id", user!.id),
          (supabase.from("saved_jobs") as any)
            .select("*, jobs(*)")
            .eq("user_id", user!.id),
        ]);

      setContracts((contractsRes.data as ContractRow[]) || []);
      setOffers((offersRes.data as OfferRow[]) || []);
      setApplications((applicationsRes.data as ApplicationRow[]) || []);
      setAssessments((assessmentsRes.data as AssessmentRow[]) || []);
      setSavedJobs((savedRes.data as SavedJobRow[]) || []);
      setDataLoading(false);
    }

    fetchData();
  }, [user]);

  // Tab config with real counts
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "contracts", label: "契約", count: contracts.length },
    { key: "offers", label: "オファー", count: offers.length },
    { key: "applications", label: "応募", count: applications.length },
    {
      key: "assessments",
      label: "アセスメント",
      count: assessments.filter((a) => a.status !== "completed").length,
    },
    { key: "saved", label: "保存済み", count: savedJobs.length },
  ];

  // Handlers
  const handleTimesheetSubmit = async () => {
    if (!tsDate || !tsHours || !tsDescription || !timesheetModal || !user) return;
    setTsSubmitting(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("timesheets") as any).insert({
      contract_id: timesheetModal,
      user_id: user.id,
      date: tsDate,
      hours: parseFloat(tsHours),
      description: tsDescription,
    });

    setTsSubmitting(false);

    if (error) {
      addToast("タイムシートの提出に失敗しました", "error");
      return;
    }

    setTimesheetModal(null);
    setTsDate("");
    setTsHours("");
    setTsDescription("");
    addToast("タイムシートを提出しました");
  };

  const handleAcceptOffer = async (offerId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("offers") as any)
      .update({ status: "accepted" })
      .eq("id", offerId);

    if (error) {
      addToast("オファーの承諾に失敗しました", "error");
      return;
    }

    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: "accepted" as const } : o))
    );
    setOfferActionModal(null);
    addToast("オファーを承諾しました");
  };

  const handleDeclineOffer = async (offerId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("offers") as any)
      .update({ status: "declined" })
      .eq("id", offerId);

    if (error) {
      addToast("オファーの辞退に失敗しました", "error");
      return;
    }

    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: "declined" as const } : o))
    );
    setOfferActionModal(null);
    setDeclineReason("");
    addToast("オファーを辞退しました", "info");
  };

  const handleStartAssessment = () => {
    setAssessmentStartModal(null);
    router.push("/interview/practice");
  };

  const handleUnsaveJob = async (savedJobId: string) => {
    const { error } = await (supabase.from("saved_jobs") as any)
      .delete()
      .eq("id", savedJobId);

    if (error) {
      addToast("保存の解除に失敗しました", "error");
      return;
    }

    setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
    addToast("保存を解除しました", "info");
  };

  const getOfferStatusLabel = (offer: OfferRow) => {
    return offerStatusMap[offer.status] || offer.status;
  };

  const isOfferResolved = (offer: OfferRow) => {
    return offer.status === "accepted" || offer.status === "declined";
  };

  // Auth loading or redirecting
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <Sidebar activeItem="home" />

      <div className="ml-0 md:ml-[96px]">
        {/* Top bar */}
        <TopBar />

        {/* Important Tasks Section - Mercor style */}
        <div className="px-6 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            おかえりなさい{profile?.full_name ? `、${profile.full_name}` : ""}！
          </h1>
          <p className="text-sm text-gray-500 mb-5">重要なタスク ({linkedInConnected === false ? 2 : 1})</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            {/* Complete Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">プロフィールを完成</h3>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">プロフィールを完成させて、即時オファーの対象になりましょう</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: "60%" }} />
                </div>
                <span className="text-xs font-semibold text-gray-500">60%</span>
              </div>
              <button
                onClick={() => router.push("/profile")}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                今すぐ完成
              </button>
            </div>

            {/* Link LinkedIn Card */}
            {linkedInConnected === false && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">LinkedIn連携</h3>
                  <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">LinkedInアカウントをみちびきアカウントに連携しましょう</p>
                <button
                  onClick={handleLinkLinkedIn}
                  disabled={linkedInLinking}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                >
                  {linkedInLinking ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  今すぐ連携
                </button>
              </div>
            )}

            {linkedInConnected === true && (
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">LinkedIn連携</h3>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-emerald-600 font-medium">✓ LinkedIn連携済み</p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation - modern segmented/pill style */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-6 py-3">
            <nav className="flex gap-1 bg-gray-100/80 rounded-full p-1 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.key
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-200/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
                  }`}
                >
                  <span className={activeTab === tab.key ? "text-white/90" : "text-gray-400"}>
                    {tabIcons[tab.key]}
                  </span>
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        activeTab === tab.key
                          ? "bg-white/25 text-white"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6 max-w-[1400px]">
          {dataLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* ===== CONTRACTS TAB ===== */}
              {activeTab === "contracts" && (
                <div>
                  {contracts.length === 0 ? (
                    <EmptyState
                      icon="contract"
                      title="まだ契約はありません"
                      description="オファーを承諾すると、ここに契約が表示されます。"
                    />
                  ) : (
                    <div className="space-y-4">
                      {contracts.map((c) => {
                        const companyName =
                          c.companies?.name || "不明な企業";
                        const statusLabel =
                          contractStatusMap[c.status] || c.status;
                        return (
                          <div
                            key={c.id}
                            className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 ${
                              contractStatusColors[c.status] || "border-l-gray-300"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Company Avatar - gradient circle */}
                              <div
                                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getCompanyGradient(companyName)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                              >
                                <span className="text-white font-bold text-sm">
                                  {getInitial(companyName)}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-bold text-gray-900 text-[15px]">
                                      {c.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5 font-medium">
                                      {companyName}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                      c.status === "active"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : c.status === "paused"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-gray-100 text-gray-500 border border-gray-200"
                                    }`}
                                  >
                                    {c.status === "active" && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                    )}
                                    {statusLabel}
                                  </span>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-500">
                                  <span className="flex items-center gap-1.5 font-medium text-indigo-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                                    </svg>
                                    ¥{c.rate.toLocaleString()}/時
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    週{c.hours_per_week}時間
                                  </span>
                                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{c.commitment}</span>
                                  {c.location && <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{c.location}</span>}
                                </div>

                                {/* Hours Progress - gradient */}
                                <div className="mt-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-600">
                                      週間目標
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                      週{c.hours_per_week}時間
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                      style={{ width: "0%" }}
                                    />
                                  </div>
                                </div>

                                {/* Expanded Contract Details */}
                                {expandedContract === c.id && (
                                  <div className="mt-4 bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                                    {c.description && (
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                          業務内容
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {c.description}
                                        </p>
                                      </div>
                                    )}
                                    {c.contact_name && (
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                          担当者連絡先
                                        </h4>
                                        <p className="text-sm text-gray-700">
                                          {c.contact_name}
                                          {c.contact_email &&
                                            ` - ${c.contact_email}`}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                        契約開始日
                                      </h4>
                                      <p className="text-sm text-gray-700">
                                        {c.start_date}
                                      </p>
                                    </div>
                                    {c.end_date && (
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                          契約終了日
                                        </h4>
                                        <p className="text-sm text-gray-700">
                                          {c.end_date}
                                        </p>
                                      </div>
                                    )}
                                    {c.work_style && (
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                          勤務形態
                                        </h4>
                                        <p className="text-sm text-gray-700">
                                          {c.work_style}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3 mt-5">
                                  <button
                                    onClick={() => {
                                      setTimesheetModal(c.id);
                                      setTsDate("");
                                      setTsHours("");
                                      setTsDescription("");
                                    }}
                                    className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:-translate-y-0.5"
                                  >
                                    タイムシートを提出
                                  </button>
                                  <button
                                    onClick={() =>
                                      setExpandedContract(
                                        expandedContract === c.id
                                          ? null
                                          : c.id
                                      )
                                    }
                                    className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1"
                                  >
                                    {expandedContract === c.id
                                      ? "詳細を閉じる"
                                      : "詳細を見る"}
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedContract === c.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ===== OFFERS TAB ===== */}
              {activeTab === "offers" && (
                <div>
                  {offers.length === 0 ? (
                    <EmptyState
                      icon="offer"
                      title="オファーはありません"
                      description="企業からのオファーがここに表示されます。プロフィールを充実させて、より多くのオファーを受け取りましょう。"
                    />
                  ) : (
                    <div className="space-y-4">
                      {offers.map((o) => {
                        const currentStatus = getOfferStatusLabel(o);
                        const resolved = isOfferResolved(o);
                        return (
                          <div
                            key={o.id}
                            className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 ${
                              resolved ? "opacity-70" : ""
                            } ${
                              !resolved ? "border-l-4 border-l-indigo-500" : "border-l-4 border-l-gray-300"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getCompanyGradient(o.company_name)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                              >
                                <span className="text-white font-bold text-sm">
                                  {getInitial(o.company_name)}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-bold text-gray-900 text-[15px]">
                                      {o.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5 font-medium">
                                      {o.company_name}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                      offerStatusColors[currentStatus] ||
                                      "bg-gray-100 text-gray-500 border border-gray-200"
                                    }`}
                                  >
                                    {currentStatus}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-500">
                                  <span className="flex items-center gap-1.5 font-medium text-indigo-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                                    </svg>
                                    ¥{o.rate.toLocaleString()}/時
                                  </span>
                                  {o.commitment && <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{o.commitment}</span>}
                                  {o.work_style && <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{o.work_style}</span>}
                                </div>

                                {/* Deadline Warning */}
                                {!resolved && o.expires_at && (
                                  <div className="flex items-center gap-2 mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span className="font-medium">回答期限: {o.expires_at.split("T")[0]}</span>
                                  </div>
                                )}

                                {/* Expandable Details */}
                                {o.message && (
                                  <>
                                    <button
                                      onClick={() =>
                                        setExpandedOffer(
                                          expandedOffer === o.id ? null : o.id
                                        )
                                      }
                                      className="text-sm text-indigo-500 font-semibold hover:text-indigo-700 mt-3 flex items-center gap-1 transition-colors"
                                    >
                                      {expandedOffer === o.id
                                        ? "詳細を閉じる"
                                        : "詳細を表示"}
                                      <svg
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                          expandedOffer === o.id
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>

                                    {expandedOffer === o.id && (
                                      <div className="bg-gray-50 rounded-xl p-4 mt-3 text-sm text-gray-700 border border-gray-100 leading-relaxed">
                                        {o.message}
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Actions */}
                                {!resolved ? (
                                  <div className="flex items-center gap-3 mt-5">
                                    <button
                                      onClick={() =>
                                        setOfferActionModal({
                                          type: "accept",
                                          offerId: o.id,
                                        })
                                      }
                                      className="text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-emerald-200/50 hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                      承諾する
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeclineReason("");
                                        setOfferActionModal({
                                          type: "decline",
                                          offerId: o.id,
                                        });
                                      }}
                                      className="text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-all duration-200"
                                    >
                                      辞退する
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                                    {o.status === "accepted" ? (
                                      <>
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        このオファーを承諾しました
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        このオファーを辞退しました
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ===== APPLICATIONS TAB ===== */}
              {activeTab === "applications" && (
                <div>
                  {applications.length === 0 ? (
                    <EmptyState
                      icon="application"
                      title="応募はありません"
                      description="求人に応募すると、ここに応募状況が表示されます。"
                      actionLabel="求人を探す"
                      actionHref="/explore"
                    />
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => {
                        const jobTitle = app.jobs?.title || "不明な求人";
                        const companyName =
                          app.jobs?.companies?.name || "不明な企業";
                        const statusLabel =
                          appStatusMap[app.status] || app.status;
                        return (
                          <div
                            key={app.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 border-l-blue-400"
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getCompanyGradient(companyName)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                              >
                                <span className="text-white font-bold text-sm">
                                  {getInitial(companyName)}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-bold text-gray-900 text-[15px]">
                                      {jobTitle}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5 font-medium">
                                      {companyName}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                      appStatusColors[statusLabel] ||
                                      "bg-gray-100 text-gray-500 border border-gray-200"
                                    }`}
                                  >
                                    {statusLabel}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-500">
                                  {app.desired_rate && (
                                    <span className="flex items-center gap-1.5 font-medium text-indigo-600">
                                      ¥{app.desired_rate.toLocaleString()}/時
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    応募日: {app.created_at.split("T")[0]}
                                  </span>
                                </div>

                                {/* Expanded Application Details */}
                                {expandedApplication === app.id && (
                                  <div className="mt-4 bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                                    {app.motivation && (
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                          志望動機
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {app.motivation}
                                        </p>
                                      </div>
                                    )}
                                    {app.notes && (
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                          メモ
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {app.notes}
                                        </p>
                                      </div>
                                    )}
                                    {app.start_date && (
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                          希望開始日
                                        </h4>
                                        <p className="text-sm text-gray-700">
                                          {app.start_date}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="mt-4 pt-3">
                                  <button
                                    onClick={() =>
                                      setExpandedApplication(
                                        expandedApplication === app.id
                                          ? null
                                          : app.id
                                      )
                                    }
                                    className="text-sm text-indigo-500 font-semibold hover:text-indigo-700 transition-colors flex items-center gap-1"
                                  >
                                    {expandedApplication === app.id
                                      ? "閉じる"
                                      : "詳細を見る"}
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedApplication === app.id ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ===== ASSESSMENTS TAB ===== */}
              {activeTab === "assessments" && (
                <div>
                  {assessments.length === 0 ? (
                    <EmptyState
                      icon="assessment"
                      title="アセスメントはありません"
                      description="スキルアセスメントが割り当てられると、ここに表示されます。"
                    />
                  ) : (
                    <div className="space-y-4">
                      {assessments.map((a) => {
                        const statusLabel =
                          assessmentStatusMap[a.status] || a.status;
                        const isCompleted = a.status === "completed";
                        return (
                          <div
                            key={a.id}
                            className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 ${
                              isCompleted ? "border-l-emerald-500" : "border-l-indigo-500"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  isCompleted
                                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                    : "bg-gradient-to-br from-indigo-400 to-indigo-600"
                                } shadow-sm`}
                              >
                                {isCompleted ? (
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-bold text-gray-900 text-[15px]">
                                      {a.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5 font-medium">
                                      {a.category}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                      isCompleted
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}
                                  >
                                    {!isCompleted && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                                    )}
                                    {statusLabel}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-500">
                                  <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {a.duration_minutes}分
                                  </span>
                                  {isCompleted && a.score !== null && (
                                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      スコア: {a.score}/{a.max_score}
                                    </span>
                                  )}
                                  {isCompleted && a.completed_at && (
                                    <span>
                                      完了日: {a.completed_at.split("T")[0]}
                                    </span>
                                  )}
                                </div>

                                {/* Expanded details for completed assessments */}
                                {isCompleted &&
                                  expandedAssessment === a.id &&
                                  a.score !== null && (
                                    <div className="mt-4 bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                          スコア
                                        </h4>
                                        <div className="space-y-2.5">
                                          <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                              <span className="text-sm text-gray-700 font-medium">
                                                総合スコア
                                              </span>
                                              <span className="text-sm font-bold text-gray-900">
                                                {a.score}/{a.max_score}
                                              </span>
                                            </div>
                                            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                                style={{
                                                  width: `${(a.score / a.max_score) * 100}%`,
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {!isCompleted && (
                                  <div className="mt-5">
                                    <button
                                      onClick={() =>
                                        setAssessmentStartModal(a.id)
                                      }
                                      className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                      テストを開始
                                    </button>
                                  </div>
                                )}

                                {isCompleted && (
                                  <div className="mt-4">
                                    <button
                                      onClick={() =>
                                        setExpandedAssessment(
                                          expandedAssessment === a.id
                                            ? null
                                            : a.id
                                        )
                                      }
                                      className="text-sm text-indigo-500 font-semibold hover:text-indigo-700 transition-colors flex items-center gap-1"
                                    >
                                      {expandedAssessment === a.id
                                        ? "閉じる"
                                        : "結果を見る"}
                                      <svg className={`w-4 h-4 transition-transform duration-200 ${expandedAssessment === a.id ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ===== SAVED TAB ===== */}
              {activeTab === "saved" && (
                <div>
                  {savedJobs.length === 0 ? (
                    <EmptyState
                      icon="saved"
                      title="保存済みの求人はありません"
                      description="気になる求人を保存すると、ここに表示されます。"
                      actionLabel="求人を探す"
                      actionHref="/explore"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {savedJobs.map((sj) => {
                        const job = sj.jobs;
                        if (!job) return null;
                        return (
                          <div
                            key={sj.id}
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-5 cursor-pointer hover:-translate-y-0.5"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCompanyGradient(job.company_id)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                              >
                                <span className="text-white font-bold text-xs">
                                  {getInitial(job.title)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                  {job.title}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">
                                  {job.location}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full font-semibold">
                                ¥{job.min_rate.toLocaleString()} - ¥
                                {job.max_rate.toLocaleString()}/時
                              </span>
                              <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">
                                {job.employment_type}
                              </span>
                              <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">
                                {job.work_style}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                              <span className="text-xs text-gray-400 font-medium">
                                保存日: {sj.created_at.split("T")[0]}
                              </span>
                              <button
                                onClick={() => handleUnsaveJob(sj.id)}
                                className="text-gray-300 hover:text-red-500 transition-all duration-200 hover:scale-110"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== TIMESHEET MODAL ===== */}
      {timesheetModal !== null && (
        <ModalBackdrop onClose={() => setTimesheetModal(null)}>
          <div className="p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  タイムシートを提出
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {contracts.find((c) => c.id === timesheetModal)?.title} -{" "}
                  {contracts.find((c) => c.id === timesheetModal)?.companies?.name}
                </p>
              </div>
              <button
                onClick={() => setTimesheetModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  日付
                </label>
                <input
                  type="date"
                  value={tsDate}
                  onChange={(e) => setTsDate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  稼働時間
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder="例: 8"
                  value={tsHours}
                  onChange={(e) => setTsHours(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  作業内容
                </label>
                <textarea
                  rows={3}
                  placeholder="今日の作業内容を記入してください..."
                  value={tsDescription}
                  onChange={(e) => setTsDescription(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-7">
              <button
                onClick={handleTimesheetSubmit}
                disabled={!tsDate || !tsHours || !tsDescription || tsSubmitting}
                className="flex-1 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed px-4 py-3 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200/50 disabled:shadow-none"
              >
                {tsSubmitting ? "送信中..." : "提出する"}
              </button>
              <button
                onClick={() => setTimesheetModal(null)}
                className="text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-5 py-3 rounded-xl transition-all duration-200"
              >
                キャンセル
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* ===== OFFER ACTION MODAL (Accept) ===== */}
      {offerActionModal?.type === "accept" && (
        <ModalBackdrop onClose={() => setOfferActionModal(null)}>
          <div className="p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                オファーを承諾
              </h2>
              <button
                onClick={() => setOfferActionModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {(() => {
              const offer = offers.find(
                (o) => o.id === offerActionModal.offerId
              );
              return offer ? (
                <div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 mb-5 border border-indigo-100">
                    <p className="text-sm font-bold text-indigo-900">
                      {offer.title}
                    </p>
                    <p className="text-sm text-indigo-700 font-medium mt-0.5">
                      {offer.company_name}
                    </p>
                    <div className="flex gap-4 mt-2.5">
                      <span className="text-xs text-indigo-600 font-semibold bg-indigo-100 px-2 py-0.5 rounded-full">¥{offer.rate.toLocaleString()}/時</span>
                      {offer.commitment && <span className="text-xs text-indigo-600 font-medium">{offer.commitment}</span>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    このオファーを承諾しますか？承諾後、企業に通知が送信されます。
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleAcceptOffer(offerActionModal.offerId)
                      }
                      className="flex-1 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-3 rounded-xl transition-all duration-200 shadow-md shadow-emerald-200/50"
                    >
                      承諾する
                    </button>
                    <button
                      onClick={() => setOfferActionModal(null)}
                      className="text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-5 py-3 rounded-xl transition-all duration-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </ModalBackdrop>
      )}

      {/* ===== OFFER ACTION MODAL (Decline) ===== */}
      {offerActionModal?.type === "decline" && (
        <ModalBackdrop onClose={() => setOfferActionModal(null)}>
          <div className="p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                オファーを辞退
              </h2>
              <button
                onClick={() => setOfferActionModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {(() => {
              const offer = offers.find(
                (o) => o.id === offerActionModal.offerId
              );
              return offer ? (
                <div>
                  <div className="bg-red-50 rounded-xl p-5 mb-5 border border-red-100">
                    <p className="text-sm font-bold text-red-900">
                      {offer.title}
                    </p>
                    <p className="text-sm text-red-700 font-medium mt-0.5">
                      {offer.company_name}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    このオファーを辞退しますか？辞退理由を入力してください（任意）。
                  </p>
                  <textarea
                    rows={3}
                    placeholder="辞退理由を入力してください..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none mb-6 transition-all"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleDeclineOffer(offerActionModal.offerId)
                      }
                      className="flex-1 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-3 rounded-xl transition-all duration-200 shadow-md shadow-red-200/50"
                    >
                      辞退する
                    </button>
                    <button
                      onClick={() => setOfferActionModal(null)}
                      className="text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-5 py-3 rounded-xl transition-all duration-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </ModalBackdrop>
      )}

      {/* ===== ASSESSMENT START MODAL ===== */}
      {assessmentStartModal !== null && (
        <ModalBackdrop onClose={() => setAssessmentStartModal(null)}>
          <div className="p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                テストを開始
              </h2>
              <button
                onClick={() => setAssessmentStartModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {(() => {
              const assessment = assessments.find(
                (a) => a.id === assessmentStartModal
              );
              return assessment ? (
                <div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 mb-5 border border-indigo-100">
                    <p className="text-sm font-bold text-indigo-900">
                      {assessment.title}
                    </p>
                    <div className="flex gap-3 mt-2.5">
                      <span className="text-xs text-indigo-600 font-semibold bg-indigo-100 px-2 py-0.5 rounded-full">{assessment.category}</span>
                      <span className="text-xs text-indigo-600 font-medium">所要時間: {assessment.duration_minutes}分</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      テストを開始すると、制限時間のカウントダウンが始まります。安定したインターネット環境で受験してください。
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStartAssessment()}
                      className="flex-1 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-4 py-3 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200/50"
                    >
                      開始する
                    </button>
                    <button
                      onClick={() => setAssessmentStartModal(null)}
                      className="text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-5 py-3 rounded-xl transition-all duration-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}

// --- Empty State Component ---
function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    contract: (
      <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    offer: (
      <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    application: (
      <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    assessment: (
      <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    saved: (
      <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-5 shadow-inner">
        {iconMap[icon] || null}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-6 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-6 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:-translate-y-0.5"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}

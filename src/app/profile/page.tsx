"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ExploreHeader";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Tab = "resume" | "skills" | "interviews" | "settings";

type Experience = Database["public"]["Tables"]["experiences"]["Row"];
type Education = Database["public"]["Tables"]["education"]["Row"];
type Skill = Database["public"]["Tables"]["skills"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface SkillCategory {
  name: string;
  skills: Skill[];
}

/* ── Toast component ── */
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full shadow-lg backdrop-blur-sm transition-all animate-[slideUp_0.3s_ease-out] ${
        type === "success"
          ? "bg-emerald-500/95 text-white"
          : "bg-red-500/95 text-white"
      }`}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        type === "success" ? "bg-white/20" : "bg-white/20"
      }`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {type === "success" ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile: authProfile, loading: authLoading, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => setToast({ message, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  /* ── Profile data ── */
  const [profile, setProfile] = useState<Profile | null>(null);

  /* ── Profile header edit mode ── */
  const [editMode, setEditMode] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftLocation, setDraftLocation] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  /* ── Avatar upload ── */
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* ── Resume upload ── */
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  /* ── Notification toggles (settings tab) ── */
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyOffer, setNotifyOffer] = useState(true);
  const [notifyInterview, setNotifyInterview] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  /* ── Experience state ── */
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    periodStart: "",
    periodEnd: "",
    description: "",
  });
  const [savingExperience, setSavingExperience] = useState(false);

  /* ── Education state ── */
  const [education, setEducation] = useState<Education[]>([]);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({
    school: "",
    degree: "",
    field: "",
    periodStart: "",
    periodEnd: "",
  });
  const [savingEducation, setSavingEducation] = useState(false);

  /* ── Settings: email / password edit ── */
  const [editEmailMode, setEditEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [editPassword, setEditPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  /* ── Skills state ── */
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [editingSkillCategory, setEditingSkillCategory] = useState<string | null>(null);
  const [draftSkills, setDraftSkills] = useState<Skill[]>([]);
  const [savingSkills, setSavingSkills] = useState(false);

  const interviews = [
    {
      id: 1,
      type: "技術面接 - フロントエンド",
      date: "2024年1月15日",
      score: 92,
      status: "completed" as const,
    },
    {
      id: 2,
      type: "システム設計面接",
      date: "2024年2月20日",
      score: 88,
      status: "completed" as const,
    },
    {
      id: 3,
      type: "行動面接",
      date: "2024年3月25日",
      score: null,
      status: "scheduled" as const,
    },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "resume",
      label: "履歴書",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "skills",
      label: "スキル",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: "interviews",
      label: "面接",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "設定",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const colorOptions = ["bg-blue-600", "bg-emerald-600", "bg-purple-600", "bg-red-600", "bg-amber-600", "bg-pink-600", "bg-cyan-600"];

  /* ── Redirect if not logged in ── */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  /* ── Handle hash scroll (e.g. #resume-upload) ── */
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [loading]);

  /* ── Fetch all data ── */
  useEffect(() => {
    if (!user) return;
    fetchAllData();
  }, [user]);

  async function fetchAllData() {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, expRes, eduRes, skillsRes] = await Promise.all([
        (supabase.from("profiles") as any).select("*").eq("id", user.id).single(),
        (supabase.from("experiences") as any).select("*").eq("user_id", user.id).order("sort_order", { ascending: true }),
        (supabase.from("education") as any).select("*").eq("user_id", user.id).order("sort_order", { ascending: true }),
        (supabase.from("skills") as any).select("*").eq("user_id", user.id),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setEmail(profileRes.data.email);
        setDraftEmail(profileRes.data.email);
        // Check if profile has a resume_url field stored (we store it in bio or a custom approach)
        // We'll use avatar_url for avatar and check for resume via storage
      }
      if (expRes.data) setExperiences(expRes.data);
      if (eduRes.data) setEducation(eduRes.data);
      if (skillsRes.data) {
        setSkills(skillsRes.data);
        // Group skills by category
        const grouped: Record<string, Skill[]> = {};
        skillsRes.data.forEach((s: any) => {
          if (!grouped[s.category]) grouped[s.category] = [];
          grouped[s.category].push(s);
        });
        setSkillCategories(
          Object.entries(grouped).map(([name, skills]) => ({ name, skills }))
        );
      }

      // Check if resume exists in storage
      if (user) {
        const { data: files } = await supabase.storage.from("resumes").list(user.id, { limit: 1 });
        if (files && files.length > 0) {
          const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(`${user.id}/${files[0].name}`);
          setResumeUrl(urlData.publicUrl);
        }
      }
    } catch {
      showToast("データの取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  }

  /* ── Handlers ── */
  const handleStartEditProfile = () => {
    if (!profile) return;
    setDraftName(profile.full_name || "");
    setDraftTitle(profile.title || "");
    setDraftLocation(profile.location || "");
    setDraftBio(profile.bio || "");
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({
          full_name: draftName,
          title: draftTitle,
          location: draftLocation,
          bio: draftBio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, full_name: draftName, title: draftTitle, location: draftLocation, bio: draftBio } : prev);
      setEditMode(false);
      await refreshProfile();
      showToast("プロフィールを保存しました");
    } catch {
      showToast("保存に失敗しました", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setEditMode(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await (supabase.from("profiles") as any)
        .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : prev);
      await refreshProfile();
      showToast("アバターを更新しました");
    } catch {
      showToast("アバターのアップロードに失敗しました", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingResume(true);
    try {
      const path = `${user.id}/${file.name}`;

      const { error: uploadError } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(path);
      setResumeUrl(urlData.publicUrl);
      showToast("履歴書をアップロードしました");
    } catch {
      showToast("履歴書のアップロードに失敗しました", "error");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!user) return;
    try {
      const { data: files } = await supabase.storage.from("resumes").list(user.id);
      if (files && files.length > 0) {
        await supabase.storage.from("resumes").remove(files.map((f) => `${user.id}/${f.name}`));
      }
      setResumeUrl(null);
      showToast("履歴書を削除しました");
    } catch {
      showToast("削除に失敗しました", "error");
    }
  };

  const handleSaveExperience = async () => {
    if (!newExperience.title || !newExperience.company || !user) return;
    setSavingExperience(true);
    try {
      const { data, error } = await (supabase.from("experiences") as any)
        .insert({
          user_id: user.id,
          title: newExperience.title,
          company: newExperience.company,
          color: colorOptions[experiences.length % colorOptions.length],
          period: `${newExperience.periodStart} - ${newExperience.periodEnd || "現在"}`,
          description: newExperience.description || null,
          skills: [],
          sort_order: 0,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setExperiences([data, ...experiences]);
      setNewExperience({ title: "", company: "", periodStart: "", periodEnd: "", description: "" });
      setShowAddExperience(false);
      showToast("経歴を追加しました");
    } catch {
      showToast("経歴の追加に失敗しました", "error");
    } finally {
      setSavingExperience(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      const { error } = await (supabase.from("experiences") as any).delete().eq("id", id).eq("user_id", user!.id);
      if (error) throw error;
      setExperiences(experiences.filter((e) => e.id !== id));
      showToast("経歴を削除しました");
    } catch {
      showToast("削除に失敗しました", "error");
    }
  };

  const handleSaveEducation = async () => {
    if (!newEducation.school || !newEducation.degree || !user) return;
    setSavingEducation(true);
    try {
      const { data, error } = await (supabase.from("education") as any)
        .insert({
          user_id: user.id,
          school: newEducation.school,
          degree: newEducation.degree,
          field: newEducation.field || null,
          period: `${newEducation.periodStart} - ${newEducation.periodEnd || "現在"}`,
          color: colorOptions[education.length % colorOptions.length],
          sort_order: 0,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setEducation([data, ...education]);
      setNewEducation({ school: "", degree: "", field: "", periodStart: "", periodEnd: "" });
      setShowAddEducation(false);
      showToast("学歴を追加しました");
    } catch {
      showToast("学歴の追加に失敗しました", "error");
    } finally {
      setSavingEducation(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      const { error } = await (supabase.from("education") as any).delete().eq("id", id).eq("user_id", user!.id);
      if (error) throw error;
      setEducation(education.filter((e) => e.id !== id));
      showToast("学歴を削除しました");
    } catch {
      showToast("削除に失敗しました", "error");
    }
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: draftEmail });
      if (error) throw error;
      setEmail(draftEmail);
      setEditEmailMode(false);
      showToast("確認メールを送信しました。メールを確認してください。");
    } catch {
      showToast("メールアドレスの変更に失敗しました", "error");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm) return;
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
      if (error) throw error;
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setEditPassword(false);
      showToast("パスワードを変更しました");
    } catch {
      showToast("パスワードの変更に失敗しました", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleStartEditSkills = (categoryName: string) => {
    const cat = skillCategories.find((c) => c.name === categoryName);
    if (cat) {
      setDraftSkills(cat.skills.map((s) => ({ ...s })));
      setEditingSkillCategory(categoryName);
    }
  };

  const handleSaveSkills = async () => {
    if (!editingSkillCategory || !user) return;
    setSavingSkills(true);
    try {
      // Update each skill individually
      for (const skill of draftSkills) {
        const { error } = await (supabase.from("skills") as any)
          .update({ level: skill.level })
          .eq("id", skill.id);
        if (error) throw error;
      }

      setSkillCategories(
        skillCategories.map((cat) =>
          cat.name === editingSkillCategory ? { ...cat, skills: draftSkills } : cat
        )
      );
      setEditingSkillCategory(null);
      setDraftSkills([]);
      showToast("スキルを保存しました");
    } catch {
      showToast("スキルの保存に失敗しました", "error");
    } finally {
      setSavingSkills(false);
    }
  };

  const handleCancelSkills = () => {
    setEditingSkillCategory(null);
    setDraftSkills([]);
  };

  /* ── Toggle component ── */
  const Toggle = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        enabled ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  /* ── Proficiency bar ── */
  const ProficiencyBar = ({ level }: { level: number }) => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-8 rounded-full transition-colors ${
            i <= level ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gray-100"
          }`}
        />
      ))}
    </div>
  );

  /* ── Editable proficiency bar ── */
  const EditableProficiencyBar = ({
    level,
    onChange,
  }: {
    level: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`h-2 w-8 rounded-full transition-all cursor-pointer ${
            i <= level ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" : "bg-gray-100 hover:bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-gray-400";

  /* ── Loading state ── */
  if (authLoading) {
    // Auth check is fast — show minimal skeleton
    return (
      <div className="min-h-screen bg-gray-50/80">
        <Sidebar activeItem="profile" />
        <div className="ml-0 md:ml-[96px] flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-100" />
              <div className="absolute inset-0 w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-400 font-medium">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const profileName = profile?.full_name || "";
  const profileTitle = profile?.title || "";
  const profileLocation = profile?.location || "";
  const profileBio = profile?.bio || "";
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50/80">
      <Sidebar activeItem="profile" />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />

      {/* Slide-up animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Main content area */}
      <div className="ml-0 md:ml-[96px]">
        {/* ── Gradient Banner ── */}
        <div className="relative">
          <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="absolute inset-0 h-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
        </div>

        {/* ── Profile header card ── */}
        <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="relative w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 group cursor-pointer overflow-hidden ring-4 ring-white shadow-lg"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">{profileName[0] || "?"}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                    {uploadingAvatar ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">名前</label>
                          <input
                            type="text"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">肩書き</label>
                          <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">所在地</label>
                        <input
                          type="text"
                          value={draftLocation}
                          onChange={(e) => setDraftLocation(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">自己紹介</label>
                        <textarea
                          value={draftBio}
                          onChange={(e) => setDraftBio(e.target.value)}
                          rows={3}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                        >
                          {savingProfile ? "保存中..." : "保存する"}
                        </button>
                        <button
                          onClick={handleCancelProfile}
                          className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{profileName || "名前未設定"}</h1>
                          <p className="text-base text-gray-500 mt-0.5">{profileTitle || "肩書き未設定"}</p>
                        </div>
                        <button
                          onClick={handleStartEditProfile}
                          className="flex-shrink-0 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2 rounded-full transition-colors"
                        >
                          プロフィールを編集
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {email}
                        </span>
                        {profileLocation && (
                          <span className="text-sm text-gray-500 flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {profileLocation}
                          </span>
                        )}
                      </div>
                      {profileBio && (
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profileBio}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Tab navigation ── */}
            <div className="px-6 sm:px-8 border-t border-gray-100">
              <nav className="flex gap-2 -mb-px pt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* ===================== RESUME TAB ===================== */}
          {activeTab === "resume" && (
            <div className="space-y-6">
              {/* 履歴書アップロード */}
              <section id="resume-upload" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">履歴書アップロード</h2>
                </div>

                {!resumeUrl ? (
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group"
                  >
                    {uploadingResume ? (
                      <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors duration-200">
                        <svg className="w-7 h-7 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                      {uploadingResume ? "アップロード中..." : "クリックまたはドラッグ&ドロップ"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1.5">PDF, DOC, DOCX（最大10MB）</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">履歴書がアップロードされています</p>
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline mt-0.5 inline-block">ファイルを表示</a>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveResume}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </section>

              {/* 職務経歴 */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">職務経歴</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddExperience(!showAddExperience);
                      setNewExperience({ title: "", company: "", periodStart: "", periodEnd: "", description: "" });
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    経歴を追加
                  </button>
                </div>

                {/* Add Experience Form */}
                {showAddExperience && (
                  <div className="mb-6 p-5 border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">新しい経歴を追加</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">役職 *</label>
                        <input
                          type="text"
                          value={newExperience.title}
                          onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                          placeholder="例: フロントエンドエンジニア"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">会社名 *</label>
                        <input
                          type="text"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                          placeholder="例: 株式会社テック"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">開始</label>
                        <input
                          type="text"
                          value={newExperience.periodStart}
                          onChange={(e) => setNewExperience({ ...newExperience, periodStart: e.target.value })}
                          placeholder="例: 2023年4月"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">終了</label>
                        <input
                          type="text"
                          value={newExperience.periodEnd}
                          onChange={(e) => setNewExperience({ ...newExperience, periodEnd: e.target.value })}
                          placeholder="例: 現在"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">説明</label>
                      <textarea
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        rows={3}
                        placeholder="業務内容を記入..."
                        className={inputClass}
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={handleSaveExperience}
                        disabled={!newExperience.title || !newExperience.company || savingExperience}
                        className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl transition-all shadow-sm"
                      >
                        {savingExperience ? "保存中..." : "保存する"}
                      </button>
                      <button
                        onClick={() => setShowAddExperience(false)}
                        className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}

                {experiences.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-400">職務経歴がまだありません</p>
                    <p className="text-xs text-gray-300 mt-1">上のボタンから追加しましょう</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="group relative border-l-4 border-indigo-400 bg-gray-50/50 hover:bg-gray-50 rounded-r-2xl pl-5 pr-5 py-4 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            {/* Company icon */}
                            <div className={`w-10 h-10 rounded-xl ${exp.color || "bg-blue-600"} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <span className="text-white font-bold text-sm">{exp.company[0]}</span>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-gray-900">{exp.title}</h3>
                              <p className="text-sm text-gray-600 font-medium">{exp.company}</p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {exp.period}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {exp.description && (
                          <p className="text-sm text-gray-600 mt-3 leading-relaxed ml-14">{exp.description}</p>
                        )}
                        {exp.skills && exp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 ml-14">
                            {exp.skills.map((skill) => (
                              <span
                                key={skill}
                                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 学歴 */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">学歴</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddEducation(!showAddEducation);
                      setNewEducation({ school: "", degree: "", field: "", periodStart: "", periodEnd: "" });
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    学歴を追加
                  </button>
                </div>

                {/* Add Education Form */}
                {showAddEducation && (
                  <div className="mb-6 p-5 border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">新しい学歴を追加</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">学校名 *</label>
                        <input
                          type="text"
                          value={newEducation.school}
                          onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                          placeholder="例: 東京大学"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">学位 *</label>
                        <input
                          type="text"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                          placeholder="例: 工学部"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">専攻</label>
                      <input
                        type="text"
                        value={newEducation.field}
                        onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                        placeholder="例: 情報工学科"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">開始</label>
                        <input
                          type="text"
                          value={newEducation.periodStart}
                          onChange={(e) => setNewEducation({ ...newEducation, periodStart: e.target.value })}
                          placeholder="例: 2015年4月"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">終了</label>
                        <input
                          type="text"
                          value={newEducation.periodEnd}
                          onChange={(e) => setNewEducation({ ...newEducation, periodEnd: e.target.value })}
                          placeholder="例: 2019年3月"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={handleSaveEducation}
                        disabled={!newEducation.school || !newEducation.degree || savingEducation}
                        className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl transition-all shadow-sm"
                      >
                        {savingEducation ? "保存中..." : "保存する"}
                      </button>
                      <button
                        onClick={() => setShowAddEducation(false)}
                        className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}

                {education.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-400">学歴がまだありません</p>
                    <p className="text-xs text-gray-300 mt-1">上のボタンから追加しましょう</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {education.map((edu) => (
                      <div key={edu.id} className="group relative border-l-4 border-pink-400 bg-gray-50/50 hover:bg-gray-50 rounded-r-2xl pl-5 pr-5 py-4 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl ${edu.color || "bg-red-600"} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <span className="text-white font-bold text-sm">{edu.school[0]}</span>
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">{edu.degree}{edu.field ? ` ${edu.field}` : ""}</h3>
                              <p className="text-sm text-gray-600 font-medium">{edu.school}</p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {edu.period}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEducation(edu.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ===================== SKILLS TAB ===================== */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              {skillCategories.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-400">スキルがまだ登録されていません</p>
                    <p className="text-xs text-gray-300 mt-1">面接やプロジェクトを通じてスキルが追加されます</p>
                  </div>
                </div>
              ) : (
                skillCategories.map((category) => (
                  <section key={category.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                      </div>
                      {editingSkillCategory === category.name ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveSkills}
                            disabled={savingSkills}
                            className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            {savingSkills ? "保存中..." : "保存"}
                          </button>
                          <button
                            onClick={handleCancelSkills}
                            className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditSkills(category.name)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                          編集
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {editingSkillCategory === category.name
                        ? draftSkills.map((skill, idx) => (
                            <div key={skill.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                              <span className="text-sm font-medium text-gray-700 w-32">{skill.name}</span>
                              <div className="flex-1 flex items-center justify-end gap-3">
                                <EditableProficiencyBar
                                  level={skill.level}
                                  onChange={(newLevel) => {
                                    const updated = [...draftSkills];
                                    updated[idx] = { ...updated[idx], level: newLevel };
                                    setDraftSkills(updated);
                                  }}
                                />
                                <span className="text-xs font-medium text-gray-400 w-8 text-right">{skill.level}/5</span>
                              </div>
                            </div>
                          ))
                        : category.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                              <span className="text-sm font-medium text-gray-700 w-32">{skill.name}</span>
                              <div className="flex-1 flex items-center justify-end gap-3">
                                <ProficiencyBar level={skill.level} />
                                <span className="text-xs font-medium text-gray-400 w-8 text-right">{skill.level}/5</span>
                              </div>
                            </div>
                          ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          )}

          {/* ===================== INTERVIEWS TAB ===================== */}
          {activeTab === "interviews" && (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        interview.status === "completed" ? "bg-emerald-50" : "bg-blue-50"
                      }`}>
                        {interview.status === "completed" ? (
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{interview.type}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{interview.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {interview.score !== null && (
                        <div className="text-right">
                          <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{interview.score}</p>
                          <p className="text-xs text-gray-400">スコア</p>
                        </div>
                      )}
                      <span
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-full ${
                          interview.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {interview.status === "completed" ? "完了" : "予定"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===================== SETTINGS TAB ===================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* 通知設定 */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">通知設定</h2>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">メール通知</p>
                      <p className="text-xs text-gray-400 mt-0.5">新しいメッセージをメールで受け取る</p>
                    </div>
                    <Toggle enabled={notifyEmail} onChange={setNotifyEmail} />
                  </div>
                  <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">オファー通知</p>
                      <p className="text-xs text-gray-400 mt-0.5">新しい求人オファーの通知を受け取る</p>
                    </div>
                    <Toggle enabled={notifyOffer} onChange={setNotifyOffer} />
                  </div>
                  <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">面接リマインダー</p>
                      <p className="text-xs text-gray-400 mt-0.5">面接の24時間前にリマインダーを送信</p>
                    </div>
                    <Toggle enabled={notifyInterview} onChange={setNotifyInterview} />
                  </div>
                </div>
              </section>

              {/* アカウント設定 */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">アカウント設定</h2>
                </div>
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">メールアドレス</label>
                    {editEmailMode ? (
                      <div className="space-y-3">
                        <input
                          type="email"
                          value={draftEmail}
                          onChange={(e) => setDraftEmail(e.target.value)}
                          className={inputClass}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveEmail}
                            disabled={savingEmail}
                            className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-all shadow-sm"
                          >
                            {savingEmail ? "保存中..." : "保存する"}
                          </button>
                          <button
                            onClick={() => {
                              setDraftEmail(email);
                              setEditEmailMode(false);
                            }}
                            className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl transition-colors"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
                          {email}
                        </div>
                        <button
                          onClick={() => {
                            setDraftEmail(email);
                            setEditEmailMode(true);
                          }}
                          className="text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-colors"
                        >
                          変更
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">パスワード</label>
                    {editPassword ? (
                      <div className="space-y-4 p-5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">現在のパスワード</label>
                          <input
                            type="password"
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">新しいパスワード</label>
                          <input
                            type="password"
                            value={passwordForm.newPass}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">新しいパスワード（確認）</label>
                          <input
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                            className={inputClass}
                          />
                          {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              パスワードが一致しません
                            </p>
                          )}
                        </div>
                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={handleSavePassword}
                            disabled={!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm || savingPassword}
                            className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl transition-all shadow-sm"
                          >
                            {savingPassword ? "保存中..." : "保存する"}
                          </button>
                          <button
                            onClick={() => {
                              setPasswordForm({ current: "", newPass: "", confirm: "" });
                              setEditPassword(false);
                            }}
                            className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl transition-colors"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditPassword(true)}
                        className="text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-colors"
                      >
                        パスワードを変更
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* プライバシー設定 */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">プライバシー設定</h2>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">プロフィール公開</p>
                      <p className="text-xs text-gray-400 mt-0.5">企業がプロフィールを閲覧できるようにする</p>
                    </div>
                    <Toggle enabled={profilePublic} onChange={setProfilePublic} />
                  </div>
                  <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">メールアドレスの表示</p>
                      <p className="text-xs text-gray-400 mt-0.5">プロフィールにメールアドレスを表示する</p>
                    </div>
                    <Toggle enabled={showEmail} onChange={setShowEmail} />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import type { Database } from "@/lib/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

type SidebarProps = {
  activeItem?: string;
};

/* ─── Left Sidebar (fixed, narrow ~72px) ─── */
export function Sidebar({ activeItem = "explore" }: SidebarProps) {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const navItems = [
    {
      id: "explore",
      label: "探す",
      href: "/explore",
      icon: (
        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "home",
      label: "ホーム",
      href: "/home",
      icon: (
        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "referrals",
      label: "紹介",
      href: "/referrals",
      icon: (
        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "interview",
      label: "面接練習",
      href: "/interview",
      icon: (
        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "earnings",
      label: "収益",
      href: "/earnings",
      icon: (
        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "プロフィール",
      href: "/profile",
      icon: (
        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const { data, error } = await (supabase.from("notifications") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark all notifications as read
  const markAllRead = async () => {
    if (!user) return;

    const { error } = await (supabase.from("notifications") as any)
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // Format relative time from ISO timestamp
  function formatRelativeTime(isoDate: string): string {
    const now = new Date();
    const date = new Date(isoDate);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "たった今";
    if (diffMin < 60) return `${diffMin}分前`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}時間前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}日前`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}ヶ月前`;
  }

  // Map notification type to dot color
  function typeColor(type: string): string {
    switch (type) {
      case "offer":
        return "bg-emerald-500";
      case "status":
        return "bg-blue-500";
      case "interview":
        return "bg-amber-500";
      default:
        return "bg-gray-400";
    }
  }

  // Close notification panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  // Render user avatar or login link
  const renderAvatar = () => {
    if (!user) {
      return (
        <a
          href="/auth/login"
          className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
          title="ログイン"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </a>
      );
    }

    if (profile?.avatar_url) {
      return (
        <div className="p-[2px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
          <img
            src={profile.avatar_url}
            alt={profile.full_name || ""}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
          />
        </div>
      );
    }

    const initial = profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "?";
    return (
      <div className="p-[2px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <span className="text-indigo-600 font-semibold text-xs">{initial}</span>
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <a href="/" className="mt-5 mb-8 group">
        <Logo size="header" iconOnly />
      </a>

      {/* Close button - mobile only */}
      <button
        onClick={() => setMobileOpen(false)}
        className="md:hidden absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Close sidebar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = item.id === activeItem;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
              )}
              {item.icon}
              <span className={`text-[10px] mt-1 tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Bottom section: notification + avatar */}
      <div className="flex flex-col items-center gap-3 pb-5 relative" ref={notifRef}>
        {/* Notification bell */}
        <button
          onClick={() => setNotifOpen((prev) => !prev)}
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Gradient badge with unread count */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1 shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown panel */}
        {notifOpen && (
          <div className="absolute bottom-14 left-full ml-3 w-80 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-2xl shadow-gray-200/50 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">通知</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                >
                  すべて既読にする
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">通知はありません</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <a
                    key={notif.id}
                    href={notif.link || "#"}
                    className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-b-0 ${
                      !notif.read ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${typeColor(notif.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notif.created_at)}</p>
                    </div>
                  </a>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 text-center bg-gray-50/50">
              <a
                href="/notifications"
                className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors font-medium"
              >
                すべての通知を見る
              </a>
            </div>
          </div>
        )}

        {/* User avatar */}
        {renderAvatar()}
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger button - mobile only */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-sm text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-200"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      {/* Desktop sidebar - always visible on md+ */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[96px] bg-white border-r border-gray-100 flex-col items-center z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop with glassmorphism */}
          <div
            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar panel */}
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-[96px] bg-white border-r border-gray-100 flex flex-col items-center z-50 shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

/* ─── Top Bar (spans right of sidebar) ─── */
export function TopBar() {
  const { user, profile } = useAuth();
  const [hasResume, setHasResume] = useState(false);

  // Check if user has uploaded a resume
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.storage.from("resumes").list(user.id, { limit: 1 });
      if (data && data.length > 0) setHasResume(true);
    })();
  }, [user]);

  // Determine step completion dynamically
  const hasLocation = !!(profile as any)?.location;
  const currentStep = !hasResume ? 1 : !hasLocation ? 2 : 3;

  const steps = [
    { num: 1, label: "履歴書", completed: hasResume, href: "/profile" },
    { num: 2, label: "所在地", completed: hasLocation, href: "/profile" },
    { num: 3, label: "アセスメント", completed: false, href: "/interview" },
  ];

  return (
    <div className="h-14 bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between pl-16 md:pl-6 pr-6">
      {/* Left: Get Instant Work Offers */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="font-semibold truncate">ワークオファーを受け取る</span>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </div>

      {/* Center: Step indicator (modern pill style) */}
      <div className="hidden md:flex items-center gap-0">
        {steps.map((step, idx) => {
          const isActive = step.num === currentStep;
          const isDone = step.completed;
          return (
            <div key={step.num} className="flex items-center">
              <a
                href={step.href}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : isActive
                        ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`text-xs transition-colors ${
                    isDone
                      ? "text-emerald-600 font-semibold"
                      : isActive
                        ? "text-indigo-600 font-semibold"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </a>
              {idx < steps.length - 1 && (
                <div className={`w-8 h-px mx-3 ${isDone ? "bg-emerald-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Upload Resume button */}
      <a
        href="/profile#resume-upload"
        className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-3 md:px-5 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-indigo-500/20 whitespace-nowrap flex-shrink-0 inline-flex items-center"
      >
        <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="hidden sm:inline">履歴書をアップロード</span>
      </a>
    </div>
  );
}

/* ─── Default export: combined header for backward compatibility ─── */
export default function ExploreHeader() {
  return (
    <>
      <Sidebar activeItem="explore" />
      <TopBar />
    </>
  );
}

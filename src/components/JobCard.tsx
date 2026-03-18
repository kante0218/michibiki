"use client";

import type { Job } from "@/lib/types";

type JobCardProps = {
  job: Job;
  onSelect: (job: Job) => void;
};

export default function JobCard({ job, onSelect }: JobCardProps) {
  const avatarGradients = [
    "from-indigo-400 to-purple-500",
    "from-cyan-400 to-blue-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-rose-400 to-pink-500",
  ];
  const avatarCount = Math.min(4, Math.max(2, Math.ceil(job.hired_count / 3)));
  const rateDisplay = `¥${job.min_rate.toLocaleString()} - ¥${job.max_rate.toLocaleString()}/時`;

  const companyName =
    (job as unknown as { companies?: { name?: string } }).companies?.name || "";

  return (
    <button
      onClick={() => onSelect(job)}
      className="group w-full text-left rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-5 hover:-translate-y-0.5"
    >
      {/* Top row: company + hiring indicator */}
      <div className="flex items-center justify-between mb-3">
        {companyName && (
          <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase truncate">
            {companyName}
          </span>
        )}
        {/* Hiring indicator */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-emerald-400 to-green-500" />
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">採用中</span>
        </div>
      </div>

      {/* Job title */}
      <h3 className="text-[15px] font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
        {job.title}
      </h3>

      {/* Rate - prominent */}
      <p className="text-base font-bold text-indigo-600 mb-3">
        {rateDisplay}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.employment_type && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
            {job.employment_type}
          </span>
        )}
        {job.work_style && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
            {job.work_style}
          </span>
        )}
        {job.location && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
            {job.location}
          </span>
        )}
      </div>

      {/* Bottom row: avatars + hired count | referral amount */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          {/* Avatar circles with gradients */}
          <div className="flex -space-x-1.5">
            {avatarGradients.slice(0, avatarCount).map((gradient, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} border-2 border-white`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {job.hired_count}人採用
          </span>
        </div>

        {/* Referral amount badge */}
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
          </svg>
          ¥{job.referral_amount.toLocaleString()}
        </span>
      </div>
    </button>
  );
}

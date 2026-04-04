"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/ExploreHeader";
import FilterBar from "@/components/FilterBar";
import JobCard from "@/components/JobCard";
import JobDetail from "@/components/JobDetail";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/lib/types";

export default function ExplorePage({ initialJobs = [] }: { initialJobs?: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(initialJobs.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState({
    domain: [] as string[],
    pay: [] as string[],
    commitment: [] as string[],
    location: [] as string[],
    workArrangement: [] as string[],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  const fetchJobs = useCallback(async () => {
    setLoading(true);

    let query = (supabase.from("jobs") as any)
      .select("*, companies(name, logo_url)")
      .eq("status", "published");

    // Search by title
    if (searchQuery.trim()) {
      query = query.ilike("title", `%${searchQuery.trim()}%`);
    }

    // Domain / category filter
    if (filters.domain.length > 0) {
      query = query.in("category", filters.domain);
    }

    // Commitment filter
    if (filters.commitment.length > 0) {
      const commitmentMap: Record<string, string> = {
        fulltime: "フルタイム",
        parttime: "パートタイム",
        contract: "業務委託",
      };
      const labels = filters.commitment.map((c) => commitmentMap[c]).filter(Boolean);
      if (labels.length > 0) {
        query = query.in("employment_type", labels);
      }
    }

    // Location filter
    if (filters.location.length > 0) {
      const locMap: Record<string, string> = {
        japan: "日本全国",
        tokyo: "東京",
        osaka: "大阪",
        nagoya: "名古屋",
        fukuoka: "福岡",
        global: "グローバル",
      };
      const labels = filters.location.map((l) => locMap[l]).filter(Boolean);
      if (labels.length > 0) {
        query = query.in("location", labels);
      }
    }

    // Work arrangement filter
    if (filters.workArrangement.length > 0) {
      const arrMap: Record<string, string> = {
        remote: "リモート",
        hybrid: "ハイブリッド",
        onsite: "オンサイト",
      };
      const labels = filters.workArrangement.map((a) => arrMap[a]).filter(Boolean);
      if (labels.length > 0) {
        query = query.in("work_style", labels);
      }
    }

    // Sort
    switch (sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "pay":
        query = query.order("max_rate", { ascending: false });
        break;
      case "trending":
        query = query.order("applicant_count", { ascending: false });
        break;
      case "urgency":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } else {
      // Pay filter (client-side since it's range-based)
      let result = (data as Job[]) ?? [];
      if (filters.pay.length > 0) {
        result = result.filter((j) =>
          filters.pay.some((range) => {
            switch (range) {
              case "0-2500":
                return j.min_rate < 2500;
              case "2500-5000":
                return j.min_rate < 5000 && j.max_rate >= 2500;
              case "5000-7500":
                return j.min_rate < 7500 && j.max_rate >= 5000;
              case "7500-10000":
                return j.min_rate < 10000 && j.max_rate >= 7500;
              case "10000+":
                return j.max_rate >= 10000;
              default:
                return true;
            }
          })
        );
      }
      setJobs(result);
    }

    setLoading(false);
  }, [searchQuery, sortBy, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (key: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(jobs.length / perPage);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Fixed left sidebar */}
      <Sidebar activeItem="explore" />

      {/* Main area right of sidebar */}
      <div className="ml-0 md:ml-[96px]">
        {/* Top bar */}

        {/* Content area */}
        <div className="px-6 py-6 max-w-[1400px]">
          {/* Page title - larger, bold */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              求人を探す
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              あなたにぴったりの求人を見つけましょう
            </p>
          </div>

          {/* Filter bar */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500">読み込み中...</p>
            </div>
          ) : paginatedJobs.length > 0 ? (
            /* Job grid - 3 columns with more gap */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedJobs.map((job) => (
                <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                現在公開中の求人はありません
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                フィルターを変更するか、後ほど再度ご確認ください。
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({
                    domain: [],
                    pay: [],
                    commitment: [],
                    location: [],
                    workArrangement: [],
                  });
                }}
                className="mt-5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-6 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-indigo-200/50 hover:shadow-lg"
              >
                フィルターをリセット
              </button>
            </div>
          )}

          {/* Pagination - modern */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 ${
                    page === currentPage
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200/50"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedJob && (
        <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}

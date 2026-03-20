import ExplorePage from "@/components/ExplorePage";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/lib/types";

export const revalidate = 60; // ISR: 60秒ごとに再生成

export default async function ExploreRoute() {
  let initialJobs: Job[] = [];

  try {
    const { data } = await (supabase.from("jobs") as any)
      .select("*, companies(name, logo_url)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    initialJobs = (data as Job[]) ?? [];
  } catch {
    initialJobs = [];
  }

  return <ExplorePage initialJobs={initialJobs} />;
}

import type { Database } from "./database.types";

export type Job = Database["public"]["Tables"]["jobs"]["Row"] & {
  companies: { name: string; logo_url: string | null } | null;
};

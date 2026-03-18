// Environment variable validation
// Ensures required env vars are set before the app runs

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value === "placeholder-key" || value.includes("placeholder")) {
    if (typeof window !== "undefined") {
      // Client-side: don't crash, but log warning
      console.warn(`Missing environment variable: ${key}`);
      return "";
    }
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please check your .env.local file. See .env.example for reference.`
    );
  }
  return value;
}

export const env = {
  supabase: {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;

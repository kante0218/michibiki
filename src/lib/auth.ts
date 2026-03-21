import { supabase } from "./supabase";

export async function signUp(email: string, password: string, fullName: string, role: "worker" | "company", companyData?: { companyName: string; department: string; phone: string }) {
  const metadata: Record<string, string> = {
    full_name: fullName,
    role,
  };
  if (role === "company" && companyData) {
    metadata.company_name = companyData.companyName;
    metadata.department = companyData.department;
    metadata.phone = companyData.phone;
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  });
  return { data, error };
}

export async function signInWithLinkedIn() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: {
      redirectTo: `${window.location.origin}/home`,
      scopes: "openid profile email",
    },
  });
  return { data, error };
}

export async function linkLinkedInAccount() {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "linkedin_oidc",
    options: {
      redirectTo: `${window.location.origin}/profile?tab=settings`,
      scopes: "openid profile email",
    },
  });
  return { data, error };
}

export async function unlinkLinkedInAccount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("ユーザーが見つかりません") };

  const linkedinIdentity = user.identities?.find(
    (id) => id.provider === "linkedin_oidc"
  );
  if (!linkedinIdentity) return { error: new Error("LinkedIn連携が見つかりません") };

  const { data, error } = await supabase.auth.unlinkIdentity(linkedinIdentity);
  return { data, error };
}

export async function getLinkedIdentities() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { identities: [], user: null };
  return { identities: user.identities || [], user };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

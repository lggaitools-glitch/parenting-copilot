import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}

export async function exchangeCodeForSession() {
  if (typeof window === "undefined") return false;

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const currentUrl = new URL(window.location.href);
  const code = currentUrl.searchParams.get("code");

  if (!code) return false;

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return false;
  }

  currentUrl.searchParams.delete("code");
  window.history.replaceState({}, "", currentUrl.toString());
  return true;
}

export async function hasSupabaseSession() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return Boolean(session);
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Ett konto = en aktiv inloggning. Ny inloggning tar över; äldre enheter loggas ut.
const CLAIMED_KEY = "claimed-session-id";

function sessionIdFromToken(token: string): string | null {
  try {
    const part = token.split(".")[1] ?? "";
    const payload = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.session_id === "string" ? payload.session_id : null;
  } catch {
    return null;
  }
}

async function check() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return;
  const sid = sessionIdFromToken(session.access_token);
  if (!sid) return;
  const userId = session.user.id;

  if (localStorage.getItem(CLAIMED_KEY) !== sid) {
    // Ny inloggning på den här enheten – ta över kontot.
    const { error } = await supabase
      .from("active_sessions" as never)
      .upsert({ user_id: userId, session_id: sid, updated_at: new Date().toISOString() } as never);
    if (!error) localStorage.setItem(CLAIMED_KEY, sid);
    return;
  }

  const { data: row } = await supabase
    .from("active_sessions" as never)
    .select("session_id")
    .eq("user_id", userId)
    .maybeSingle();
  const active = (row as { session_id?: string } | null)?.session_id;
  if (active && active !== sid) {
    localStorage.removeItem(CLAIMED_KEY);
    await supabase.auth.signOut({ scope: "local" });
    toast.error("Du loggades ut eftersom kontot loggades in på en annan enhet.", { duration: 10000 });
  }
}

export function SingleSessionGuard() {
  useEffect(() => {
    check();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setTimeout(check, 0);
    });
    const id = window.setInterval(check, 60_000);
    const onFocus = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      data.subscription.unsubscribe();
      clearInterval(id);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);
  return null;
}

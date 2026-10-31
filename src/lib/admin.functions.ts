import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isCompanyPrice, isSubscriptionActive } from "@/lib/subscription";

export type ProUser = { email: string; status: string; periodEnd: string | null; cancelAtEnd: boolean; active: boolean };

/** Enskilda Pro-abonnemang (ej företag), bara för plattformsadmin. */
export const listProUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProUser[]> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subs } = await supabaseAdmin.from("subscriptions").select("user_id,status,current_period_end,cancel_at_period_end,price_id").order("created_at", { ascending: false });
    const rows = (subs ?? []).filter((s) => !isCompanyPrice(s.price_id));
    const out: ProUser[] = [];
    for (const s of rows) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(s.user_id);
      out.push({
        email: data.user?.email ?? "okänd",
        status: s.status,
        periodEnd: s.current_period_end,
        cancelAtEnd: !!s.cancel_at_period_end,
        active: isSubscriptionActive(s),
      });
    }
    return out;
  });

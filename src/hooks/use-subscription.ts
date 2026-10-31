import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";
import { isSubscriptionActive, type SubscriptionRow } from "@/lib/subscription";

export function useSubscription(userId: string | undefined) {
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId || !paymentsConfigured()) {
      setSub(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end, price_id")
      .eq("user_id", userId)
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSub((data as SubscriptionRow | null) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { sub, active: isSubscriptionActive(sub), loading, refresh };
}

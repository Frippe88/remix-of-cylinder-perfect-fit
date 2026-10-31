import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

const PRO_PRICE = "pro_monthly";

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string | undefined; userId?: string | undefined },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    if (found.data.length) return found.data[0]!.id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0]!;
      if (options.userId && customer.metadata?.["userId"] !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

const envValidator = (data: { environment: StripeEnv; returnUrl?: string }) => {
  if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
  return data;
};

export const createProCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(envValidator)
  .handler(async ({ data, context }): Promise<{ clientSecret: string } | { error: string }> => {
    try {
      const { data: u } = await context.supabase.auth.getUser();
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [PRO_PRICE] });
      if (!prices.data.length) return { error: "Priset hittades inte" };
      const customerId = await resolveOrCreateCustomer(stripe, { email: u.user?.email ?? undefined, userId: context.userId });
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: prices.data[0]!.id, quantity: 1 }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl ?? "",
        customer: customerId,
        locale: "sv",
        managed_payments: { enabled: true },
        metadata: { userId: context.userId, managed_payments: "true" },
        subscription_data: { metadata: { userId: context.userId } },
      } as Stripe.Checkout.SessionCreateParams);
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createBillingPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(envValidator)
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_customer_id) return { error: "Inget abonnemang hittades" };
    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        locale: "sv",
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export type Receipt = { id: string; number: string | null; amount: number; currency: string; created: string | null; status: string | null; hostedUrl: string | null; pdfUrl: string | null };

export const listReceipts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(envValidator)
  .handler(async ({ data, context }): Promise<{ receipts: Receipt[] } | { error: string }> => {
    const { data: subs } = await context.supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment);
    const ids = [...new Set((subs ?? []).map((s) => s.stripe_customer_id))];
    if (!ids.length) return { receipts: [] };
    try {
      const stripe = createStripeClient(data.environment);
      const receipts: Receipt[] = [];
      for (const customer of ids) {
        const list = await stripe.invoices.list({ customer, limit: 50 });
        for (const inv of list.data) {
          if (inv.status === "draft") continue;
          receipts.push({
            id: inv.id ?? "",
            number: inv.number ?? null,
            amount: (inv.amount_paid || inv.total || 0) / 100,
            currency: inv.currency,
            created: inv.created ? new Date(inv.created * 1000).toISOString() : null,
            status: inv.status ?? null,
            hostedUrl: inv.hosted_invoice_url ?? null,
            pdfUrl: inv.invoice_pdf ?? null,
          });
        }
      }
      receipts.sort((a, b) => (b.created ?? "").localeCompare(a.created ?? ""));
      return { receipts };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

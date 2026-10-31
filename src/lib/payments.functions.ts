import { SALES_OPEN } from "@/lib/subscription";
import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { companyBuySchema } from "@/lib/company";
import { companyPriceId, isValidSeatCount, periodFromPriceId, type BillingPeriod } from "@/lib/subscription";

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
      const myEmail = (u.user?.email ?? "").toLowerCase();
      const { data: ownCo } = await context.supabase.from("companies").select("id").eq("status", "active")
        .or(`admin_user_id.eq.${context.userId},admin_email.eq.${myEmail}`).limit(1).maybeSingle();
      const { data: member } = myEmail
        ? await context.supabase.from("company_members").select("company_id").eq("email", myEmail).limit(1).maybeSingle()
        : { data: null };
      if (ownCo || member) return { error: "Du har redan Pro via företagslicens." };
      if (!SALES_OPEN) return { error: "Köp öppnar snart." };
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

type CompanyCheckoutInput = { environment: StripeEnv; returnUrl: string; company_name: string; org_number?: string | undefined; seats: number; period?: BillingPeriod };

export const createCompanyCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CompanyCheckoutInput) => {
    envValidator(data);
    const p = companyBuySchema.parse(data);
    const period: BillingPeriod = data.period === "year" ? "year" : "month";
    return { environment: data.environment, returnUrl: String(data.returnUrl ?? ""), ...p, period };
  })
  .handler(async ({ data, context }): Promise<{ clientSecret: string } | { error: string }> => {
    try {
      if (!SALES_OPEN) return { error: "Köp öppnar snart." };
      const { data: u } = await context.supabase.auth.getUser();
      const email = u.user?.email?.toLowerCase();
      if (!email) return { error: "Kontot saknar e-post" };
      const { data: existing } = await context.supabase.from("companies").select("id")
        .eq("admin_user_id", context.userId).eq("status", "active").limit(1).maybeSingle();
      if (existing) return { error: "Du har redan ett aktivt företagskonto. Ändra antal tekniker under Mitt konto." };
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [companyPriceId(data.seats, data.period)] });
      if (!prices.data.length) return { error: "Priset hittades inte" };
      const customerId = await resolveOrCreateCustomer(stripe, { email, userId: context.userId });
      const meta = {
        userId: context.userId, kind: "company", companyName: data.company_name,
        orgNumber: data.org_number || "", adminEmail: email,
      };
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: prices.data[0]!.id, quantity: data.seats }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        locale: "sv",
        managed_payments: { enabled: true },
        metadata: { ...meta, managed_payments: "true" },
        subscription_data: { metadata: meta },
      } as Stripe.Checkout.SessionCreateParams);
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const updateCompanySeats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv; seats: number }) => {
    envValidator(data);
    if (!isValidSeatCount(data.seats)) throw new Error("Ogiltigt antal tekniker");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true } | { error: string }> => {
    const { data: company } = await context.supabase.from("companies").select("id, stripe_subscription_id")
      .eq("admin_user_id", context.userId).eq("environment", data.environment).eq("status", "active")
      .limit(1).maybeSingle();
    if (!company?.stripe_subscription_id) return { error: "Inget aktivt företagskonto hittades" };
    const { count } = await context.supabase.from("company_members").select("id", { count: "exact", head: true }).eq("company_id", company.id);
    if ((count ?? 0) > data.seats) return { error: `Ni har ${count} tekniker inlagda. Ta bort några först.` };
    try {
      const stripe = createStripeClient(data.environment);
      const sub = await stripe.subscriptions.retrieve(company.stripe_subscription_id);
      const item = sub.items.data[0];
      if (!item) return { error: "Abonnemanget saknar licenser" };
      const period = periodFromPriceId(item.price.lookup_key);
      const prices = await stripe.prices.list({ lookup_keys: [companyPriceId(data.seats, period)] });
      if (!prices.data.length) return { error: "Priset hittades inte" };
      await stripe.subscriptions.update(sub.id, {
        items: [{ id: item.id, price: prices.data[0]!.id, quantity: data.seats }],
        proration_behavior: "create_prorations",
      });
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("companies").update({ seats: data.seats }).eq("id", company.id);
      return { ok: true };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

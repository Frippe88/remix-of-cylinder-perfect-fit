import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Sends the invite email to a technician the company admin just added.
// RLS on company_members/companies ensures the caller can only read their own company's rows.
export const sendCompanyInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { memberId: string }) => z.object({ memberId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: member } = await context.supabase.from("company_members").select("id,email,company_id").eq("id", data.memberId).maybeSingle();
    if (!member) return { sent: false };
    const { data: company } = await context.supabase.from("companies").select("name,admin_email").eq("id", member.company_id).maybeSingle();
    const callerEmail = String(context.claims?.email ?? "").toLowerCase();
    if (!company || company.admin_email.toLowerCase() !== callerEmail) return { sent: false };
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const r = await sendTemplateEmail("company-invite", member.email, {
        templateData: { companyName: company.name, email: member.email },
        idempotencyKey: `company-invite-${member.id}`,
      });
      return { sent: r.sent };
    } catch (e) {
      console.error("company invite failed", e);
      return { sent: false };
    }
  });

// Welcome email to the admin of a company the platform admin added manually.
export const sendCompanyWelcome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { companyId: string }) => z.object({ companyId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { sent: false };
    const { data: company } = await context.supabase.from("companies").select("id,name,admin_email,seats").eq("id", data.companyId).maybeSingle();
    if (!company) return { sent: false };
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const r = await sendTemplateEmail("company-welcome", company.admin_email, {
        templateData: { companyName: company.name, email: company.admin_email, seats: company.seats },
        idempotencyKey: `company-welcome-${company.id}`,
      });
      return { sent: r.sent };
    } catch (e) {
      console.error("company welcome failed", e);
      return { sent: false };
    }
  });

// Join a company via its shared invite link (/inbjudan/<companyId>).
// The seat-limit trigger on company_members rejects joins once all seats are used.
export const joinCompanyByLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { companyId: string }) => z.object({ companyId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const email = String(context.claims?.email ?? "").trim().toLowerCase();
    if (!email) return { ok: false as const, reason: "no_email" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: company } = await supabaseAdmin.from("companies").select("id,name,status").eq("id", data.companyId).maybeSingle();
    if (!company || company.status !== "active") return { ok: false as const, reason: "invalid" as const };
    const { data: existing } = await supabaseAdmin.from("company_members").select("id").eq("company_id", company.id).eq("email", email).maybeSingle();
    if (existing) return { ok: true as const, companyName: company.name, already: true };
    const { error } = await supabaseAdmin.from("company_members").insert({ company_id: company.id, email });
    if (error) {
      if (/licens/i.test(error.message)) return { ok: false as const, reason: "full" as const };
      console.error("join company failed", error);
      return { ok: false as const, reason: "error" as const };
    }
    return { ok: true as const, companyName: company.name, already: false };
  });

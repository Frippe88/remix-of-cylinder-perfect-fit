import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(3000),
  website: z.string().max(0).optional(), // honeypot
});

const recent = new Map<string, number[]>();

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const key = data.email.toLowerCase();
    const now = Date.now();
    const hits = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
    if (hits.length >= 3) return { ok: false as const, error: "För många meddelanden, försök igen senare." };
    recent.set(key, [...hits, now]);

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    try {
      const opts = (to: string) => ({
        templateData: { name: data.name, email: data.email, message: data.message },
        replyTo: data.email,
        idempotencyKey: `contact-message-${to}-${crypto.randomUUID()}`,
      });
      let res = await sendTemplateEmail("contact-message", "kontakt@cylinderhjalpen.se", opts("kontakt"));
      // kontakt@ was blocked by an old bounce (before mail routing existed); fall back to the inbox it forwards to.
      if (!res.sent) res = await sendTemplateEmail("contact-message", "cylinderkalkyl@gmail.com", opts("gmail"));
      console.log("contact send result", res);
      if (!res.sent) return { ok: false as const, error: "Meddelandet kunde inte levereras (v2). Mejla oss direkt." };
    } catch (e) {
      console.error("contact send failed", e);
      return { ok: false as const, error: "Det gick inte att skicka just nu. Mejla oss direkt." };
    }
    return { ok: true as const };
  });

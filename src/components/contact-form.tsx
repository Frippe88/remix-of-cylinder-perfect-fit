import { useState } from "react";
import { Mail } from "lucide-react";
import { sendContactMessage } from "@/lib/contact.functions";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const r = await sendContactMessage({
        data: {
          name: String(f.get("name") ?? ""),
          email: String(f.get("email") ?? ""),
          message: String(f.get("message") ?? ""),
          website: String(f.get("website") ?? ""),
        },
      });
      if (r.ok) setState("sent");
      else { setErr(r.error); setState("error"); }
    } catch {
      setErr("Kunde inte skicka. Kontrollera fälten och försök igen.");
      setState("error");
    }
  };

  const field = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <section className="mx-auto max-w-5xl px-4 pb-10">
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Mail className="size-5" aria-hidden /> Kontakta oss</h2>
        <p className="mt-1 text-xs text-muted-foreground">Tips, fel eller önskemål? Skriv till oss så svarar vi via e-post.</p>
        {state === "sent" ? (
          <p className="mt-4 text-sm font-semibold">Tack! Ditt meddelande har skickats.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="name" required maxLength={100} placeholder="Namn" className={field} />
            <input name="email" type="email" required maxLength={200} placeholder="E-post" className={field} />
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <textarea name="message" required maxLength={3000} rows={4} placeholder="Meddelande" className={`${field} sm:col-span-2`} />
            {state === "error" && <p className="text-sm text-destructive sm:col-span-2">{err}</p>}
            <button disabled={state === "sending"} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:col-span-2 sm:justify-self-start">
              {state === "sending" ? "Skickar…" : "Skicka meddelande"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendContactMessage } from "@/lib/contact.functions";

export const CONTACT_EMAIL = "kontakt@cylinderhjalpen.se";

const inputCls = "mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

export function ContactContent() {
  const send = useServerFn(sendContactMessage);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !message.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Fyll i namn, en giltig e-post och ett meddelande.");
      return;
    }
    setStatus("sending");
    try {
      const res = await send({ data: { name, email, message, website } });
      if (!res.ok) { setError(res.error); setStatus("idle"); return; }
      setStatus("sent");
    } catch {
      setError(`Det gick inte att skicka just nu. Mejla direkt till ${CONTACT_EMAIL}.`);
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-xl border border-l-4 border-l-accent bg-card p-4">
        <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-5 text-accent" aria-hidden /> Tack! Ditt meddelande är skickat</p>
        <p className="mt-1 text-sm text-muted-foreground">Det har gått till {CONTACT_EMAIL}. Vi svarar till {email} – vanligtvis inom 2 arbetsdagar.</p>
        <button type="button" onClick={() => { setStatus("idle"); setMessage(""); }} className="mt-3 text-sm font-semibold text-link underline underline-offset-2">Skicka ett till</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="text-sm text-muted-foreground">
        Hittar du något som inte stämmer, saknar du ett mått eller har du ett förbättringsförslag? Hör gärna av dig.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Namn
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" />
        </label>
        <label className="text-sm font-medium">E-post
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="email" />
        </label>
      </div>
      <label className="mt-3 block text-sm font-medium">Meddelande
        <textarea className={`${inputCls} min-h-28`} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={3000} />
      </label>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} />
      {error && <p role="alert" className="mt-2 text-sm font-medium text-destructive">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === "sending"} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90 disabled:opacity-60 dark:bg-accent dark:text-accent-foreground">
          {status === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {status === "sending" ? "Skickar…" : "Skicka meddelande"}
        </button>
        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline underline-offset-2"><Mail className="size-4" aria-hidden />{CONTACT_EMAIL}</a>
      </div>
    </form>
  );
}

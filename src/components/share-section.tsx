import { Download, Link2, Mail, MessageSquare, MoreVertical, Share, Share2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const URL = "https://cylinderhjalpen.se/";
const TEXT = "Kolla Cylinderhjälpen – räknar ut rätt förlängare och ringar till cylindern på några sekunder. Gratis:";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function ShareSection() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") toast.success("Cylinderhjälpen läggs till på hemskärmen");
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Cylinderhjälpen", text: TEXT, url: URL }); return; }
      catch (e) { if ((e as Error)?.name === "AbortError") return; }
    }
    copy();
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(URL); toast.success("Länken är kopierad"); }
    catch { toast.error("Kunde inte kopiera länken"); }
  };
  const msg = encodeURIComponent(`${TEXT} ${URL}`);

  return (
    <section className="mx-auto mt-10 w-full max-w-5xl px-4" aria-labelledby="tipsa">
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h2 id="tipsa" className="text-xl font-extrabold tracking-tight">Tipsa en kollega</h2>
        <p className="mt-1 text-sm text-muted-foreground">Känner du fler låssmeder? Skicka länken – kalkylatorn är gratis och kräver ingen inloggning.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={share} className="bg-accent text-accent-foreground hover:bg-accent/90"><Share2 aria-hidden />Dela</Button>
          <Button variant="outline" asChild><a href={`sms:?&body=${msg}`} target="_top"><MessageSquare aria-hidden />SMS</a></Button>
          <Button variant="outline" asChild><a href={`mailto:?subject=${encodeURIComponent("Tips: Cylinderhjälpen")}&body=${msg}`} target="_top"><Mail aria-hidden />Mejl</a></Button>
          <Button variant="outline" onClick={copy}><Link2 aria-hidden />Kopiera länk</Button>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-l-4 border-l-accent bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Smartphone className="size-5 text-accent" aria-hidden />Spara som app på hemskärmen</h2>
        <p className="mt-1 text-sm text-muted-foreground">Då öppnar du Cylinderhjälpen med ett tryck, direkt från telefonen.</p>
        <p className="mt-2 text-sm font-semibold">Fungerar även utan internet – i källare, skyddsrum och garage. Öppna sidan en gång med täckning först, sedan finns kalkylatorn sparad i telefonen.</p>
        {installed ? (
          <p className="mt-3 text-sm font-semibold">Appen är installerad.</p>
        ) : prompt ? (
          <Button onClick={install} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"><Download aria-hidden />Installera appen</Button>
        ) : null}
        {!installed && (
          <ul className="mt-3 space-y-2 text-sm">
            <li><span className="font-semibold">iPhone (Safari):</span> tryck på Dela <Share aria-hidden className="inline size-4 align-text-bottom" /> och välj <span className="font-semibold">Lägg till på hemskärmen</span>.</li>
            {!prompt && (
              <li><span className="font-semibold">Android (Chrome):</span> tryck på menyn <MoreVertical aria-hidden className="inline size-4 align-text-bottom" /> och välj <span className="font-semibold">Installera app</span> eller <span className="font-semibold">Lägg till på startskärmen</span>.</li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

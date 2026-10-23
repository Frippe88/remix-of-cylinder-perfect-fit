import { Link2, Mail, MessageSquare, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const URL = "https://cylinderhjalpen.se/";
const TEXT = "Kolla Cylinderhjälpen – räknar ut rätt förlängare och ringar till cylindern på några sekunder. Gratis:";

export function ShareSection() {
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
    </section>
  );
}

import { useEffect, useState } from "react";
import { Check, ClipboardCopy, FolderOpen, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { doorsText, KIND_LABEL, projectTotals, RING_HAS_SIDE, setDoorSide, totalsText, type Door, type Project } from "@/lib/project";
import { sideChip } from "@/components/pick-list-button";
import { formatMm } from "@/lib/cylinder";

const OLD_KEY = "cylinderhjalpen.project.v1";
const KEY = "cylinderhjalpen.projects.v2";
const EMPTY: Project = { name: "", doors: [] };

interface Saved { id: string; project: Project }
interface Store { active: string; list: Saved[] }
const newId = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const fresh = (): Store => { const id = newId(); return { active: id, list: [{ id, project: EMPTY }] }; };

export interface ProjectStore {
  list: Saved[]; active: string;
  select: (id: string) => void; create: () => void; remove: () => void;
}

export function useProject() {
  const [store, setStore] = useState<Store>(fresh);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStore(JSON.parse(raw));
      else {
        const old = localStorage.getItem(OLD_KEY);
        if (old) { const id = newId(); setStore({ active: id, list: [{ id, project: JSON.parse(old) }] }); }
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(store)); }, [store, loaded]);
  const current = store.list.find((s) => s.id === store.active) ?? store.list[0]!;
  const setProject = (fn: (p: Project) => Project) =>
    setStore((s) => ({ ...s, list: s.list.map((x) => (x.id === (s.list.some((y) => y.id === s.active) ? s.active : s.list[0]!.id) ? { ...x, project: fn(x.project) } : x)) }));
  const ps: ProjectStore = {
    list: store.list, active: current.id,
    select: (id) => setStore((s) => ({ ...s, active: id })),
    create: () => setStore((s) => { const id = newId(); return { active: id, list: [...s.list, { id, project: EMPTY }] }; }),
    remove: () => setStore((s) => { const list = s.list.filter((x) => x.id !== current.id); return list.length ? { active: list[0]!.id, list } : fresh(); }),
  };
  return [current.project, setProject, ps] as const;
}

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button className="min-h-11 w-full font-semibold" variant={ok ? "outline" : "default"}
      onClick={async () => { if (await copyText(text)) { setOk(true); setTimeout(() => setOk(false), 2000); } }}>
      {ok ? <Check aria-hidden /> : <ClipboardCopy aria-hidden />}{ok ? "Kopierad!" : label}
    </Button>
  );
}

function Chip({ children, accent, side }: { children: React.ReactNode; accent?: boolean; side?: string | null }) {
  const tone = side ? sideChip(side) : null;
  return <span className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${tone ?? (accent ? "border-accent/50 bg-accent/10" : "border-input bg-muted")}`}>{children}</span>;
}

function DoorCard({ d, onToggle, onRemove, onSetSide }: { d: Door; onToggle: () => void; onRemove: () => void; onSetSide: (i: number, label: string) => void }) {
  const hasSide = RING_HAS_SIDE[d.kind];
  return (
    <li className={`rounded-xl border bg-card p-3 shadow-card ${d.done ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        <button onClick={onToggle} aria-label={d.done ? "Markera som ej monterad" : "Markera som monterad"}
          className={`flex size-7 shrink-0 items-center justify-center rounded-md border-2 ${d.done ? "border-success bg-success text-primary-foreground" : "border-input"}`}>
          {d.done && <Check className="size-4" />}
        </button>
        <p className={`flex-1 font-bold ${d.done ? "line-through" : ""}`}>{d.name} <span className="text-xs font-medium text-muted-foreground">· {KIND_LABEL[d.kind]}</span></p>
        <button onClick={onRemove} aria-label={`Ta bort ${d.name}`} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
      </div>
      <ul className="mt-2 space-y-1.5 pl-10">
        {d.sides.map((s, i) => (
          <li key={i} className="flex flex-wrap items-center gap-1.5 text-sm">
            {hasSide ? (
              <button type="button" onClick={() => onSetSide(i, s.label === "Utsida" ? "Insida" : "Utsida")}
                aria-label={s.label ? `Byt sida för ${d.name}: ${s.label.toLowerCase()}` : `Välj sida för ${d.name}`}
                className={`w-16 rounded-md border px-1 py-0.5 text-left text-[11px] font-bold uppercase tracking-wide ${s.label ? sideChip(s.label) : "border-warning/40 bg-warning-soft text-warning"}`}>
                {s.label ?? "Sida?"}
              </button>
            ) : (
              <span className="w-16 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Cylinder</span>
            )}
            <span className="font-mono text-xs text-muted-foreground">{formatMm(s.depth)}</span>
            {s.extenders.length === 0 ? <span className="text-xs text-muted-foreground">inga förl.</span> :
              s.extenders.map((e, j) => <Chip key={j} side={s.label}>{formatMm(e)}</Chip>)}
            <Chip accent side={s.label}>ring {formatMm(s.ring)}</Chip>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function ProjectPanel({ project, setProject, open, onOpenChange }: {
  project: Project; setProject: (fn: (p: Project) => Project) => void; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const [tab, setTab] = useState<"doors" | "total">("doors");
  const totals = projectTotals(project.doors);
  const done = project.doors.filter((d) => d.done).length;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:mx-auto sm:max-w-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Projekt</SheetTitle>
          <SheetDescription>{project.doors.length} {project.doors.length === 1 ? "dörr" : "dörrar"} · {done} monterade. Sparas i den här telefonen/webbläsaren.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <input value={project.name} onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))}
            placeholder="Projektnamn, t.ex. Storgatan 4" aria-label="Projektnamn"
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base" />
          <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
            {(["doors", "total"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`min-h-10 rounded-md text-sm font-semibold ${tab === t ? "bg-card shadow-card" : "text-muted-foreground"}`}>
                {t === "doors" ? "Dörr för dörr" : "Total plocklista"}
              </button>
            ))}
          </div>
          {project.doors.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Inga dörrar än. Räkna en dörr och tryck "Spara i projekt".</p>
          ) : tab === "doors" ? (
            <>
              <p className="text-xs text-muted-foreground">Tryck på sidetiketten <span className="font-semibold text-side-outside">utsida</span>/<span className="font-semibold text-side-inside">insida</span> för att byta sida på en rad.</p>
              <ul className="space-y-2">
                {project.doors.map((d) => (
                  <DoorCard key={d.id} d={d}
                    onToggle={() => setProject((p) => ({ ...p, doors: p.doors.map((x) => x.id === d.id ? { ...x, done: !x.done } : x) }))}
                    onRemove={() => setProject((p) => ({ ...p, doors: p.doors.filter((x) => x.id !== d.id) }))}
                    onSetSide={(i, label) => setProject((p) => ({ ...p, doors: p.doors.map((x) => x.id === d.id ? setDoorSide(x, i, label) : x) }))} />
                ))}
              </ul>
              <CopyButton text={doorsText(project)} label="Kopiera dörrlista" />
            </>
          ) : (
            <>
              <div className="rounded-xl border bg-card p-4 shadow-card">
                {totals.extenders.length > 0 && <>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Förlängare</p>
                  <ul className="mb-3 mt-1 divide-y">{totals.extenders.map((e) => (
                    <li key={e.kind + e.size} className="flex justify-between py-1.5 text-sm"><span>{formatMm(e.size)} <span className="text-muted-foreground">({KIND_LABEL[e.kind]})</span></span><span className="font-mono font-bold">{e.count} st</span></li>
                  ))}</ul>
                </>}
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ringar</p>
                <ul className="mt-1 divide-y">{totals.rings.map((r) => (
                  <li key={r.kind + r.side + r.size} className="flex justify-between py-1.5 text-sm"><span>{formatMm(r.size)} {r.side && <span className={`font-semibold ${r.side === "Insida" ? "text-side-inside" : "text-side-outside"}`}>{r.side.toLowerCase()}</span>} <span className="text-muted-foreground">({KIND_LABEL[r.kind]})</span></span><span className="font-mono font-bold">{r.count} st</span></li>
                ))}</ul>
              </div>
              <CopyButton text={totalsText(project)} label="Kopiera inköpslista" />
            </>
          )}
          {project.doors.length > 0 && (
            <Button variant="ghost" className="w-full text-destructive" onClick={() => { if (confirm("Rensa hela projektet?")) setProject(() => EMPTY); }}>
              <X aria-hidden /> Rensa projekt
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ProjectBar({ project, onOpen }: { project: Project; onOpen: () => void }) {
  if (project.doors.length === 0) return null;
  return (
    <button onClick={onOpen} className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-primary px-4 py-3 text-left text-primary-foreground shadow-elevated">
      <FolderOpen className="size-5 shrink-0 text-accent" aria-hidden />
      <span className="flex-1 truncate text-sm font-semibold">{project.name || "Projekt"} · {project.doors.length} {project.doors.length === 1 ? "dörr" : "dörrar"}</span>
      <span className="text-sm font-bold text-accent">Visa →</span>
    </button>
  );
}

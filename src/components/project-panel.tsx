import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, ClipboardCopy, ClipboardList, DoorOpen, FolderOpen, Layers, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { clearDoors, doorsText, doorsToPick, KIND_LABEL, projectText, projectTotals, RING_HAS_SIDE, setDoorSide, totalsText, type Door, type Project } from "@/lib/project";
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
    <Button className={`min-h-11 w-full font-semibold ${ok ? "border-success/40 text-success" : "bg-accent text-accent-foreground hover:bg-accent/85"}`} variant={ok ? "outline" : "default"}
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
    <li className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="flex items-center gap-3 border-b bg-muted/30 px-3 py-3">
        <Button variant="ghost" size="icon" onClick={onToggle} aria-pressed={d.done} aria-label={d.done ? "Markera som ej monterad" : "Markera som monterad"}
          className={`size-8 shrink-0 rounded-md border-2 ${d.done ? "border-success bg-success-soft text-success hover:bg-success-soft" : "border-input bg-card hover:border-success hover:bg-success-soft"}`}>
          {d.done && <Check className="size-4" />}
        </Button>
        <div className="min-w-0 flex-1">
          <p className={`break-words text-sm font-bold ${d.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{d.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{KIND_LABEL[d.kind]}{d.done && <span className="ml-2 font-semibold text-success">Monterad</span>}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Ta bort ${d.name}`} title={`Ta bort ${d.name}`} className="size-8 shrink-0 text-muted-foreground hover:bg-warning-soft hover:text-destructive"><Trash2 className="size-4" /></Button>
      </div>
      <ul className="space-y-2 p-3">
        {d.sides.map((s, i) => (
          <li key={i} className="border-b border-border/60 pb-3 text-sm last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-2">
            {hasSide ? (
              <Button variant="ghost" type="button" onClick={() => onSetSide(i, s.label === "Utsida" ? "Insida" : "Utsida")}
                aria-label={s.label ? `Byt sida för ${d.name}: ${s.label.toLowerCase()}` : `Välj sida för ${d.name}`}
                className={`h-8 justify-start rounded-md border px-2 text-xs font-bold ${s.label ? `${sideChip(s.label)} hover:bg-card/60 hover:text-inherit` : "border-warning/40 bg-warning-soft text-warning hover:bg-warning-soft hover:text-warning"}`}>
                {s.label === "Insida" ? <ArrowDown aria-hidden /> : s.label === "Utsida" ? <ArrowUp aria-hidden /> : null}
                {s.label ?? "Sida?"}
              </Button>
            ) : (
              <span className="w-16 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Cylinder</span>
            )}
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatMm(s.depth)}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {s.extenders.length === 0 ? <span className="text-xs text-muted-foreground">inga förl.</span> :
              s.extenders.map((e, j) => <Chip key={j} side={s.label}>{formatMm(e)}</Chip>)}
            <Chip accent side={s.label}>ring {formatMm(s.ring)}</Chip>
            </div>
          </li>
        ))}
      </ul>
    </li>
  );
}

function NameField({ name, onSave }: { name: string; onSave: (name: string) => void }) {
  const [draft, setDraft] = useState(name);
  const [saved, setSaved] = useState(false);
  const dirty = draft.trim() !== name;
  const save = (el?: HTMLInputElement | null) => {
    onSave(draft.trim()); setDraft(draft.trim()); el?.blur();
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  return (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); save(e.currentTarget.querySelector("input")); }}>
      <input value={draft} onChange={(e) => { setDraft(e.target.value); setSaved(false); }} enterKeyHint="done"
        placeholder="Projektnamn, t.ex. Storgatan 4" aria-label="Projektnamn"
        className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-base" />
      <Button type="submit" variant={dirty ? "default" : "outline"} className={`h-11 shrink-0 font-semibold ${saved ? "text-success" : dirty ? "bg-accent text-accent-foreground hover:bg-accent/85" : "border-accent/40"}`}>
        <Check aria-hidden /> {saved ? "Sparat!" : "Spara"}
      </Button>
    </form>
  );
}

export function ProjectPanel({ project, setProject, store, open, onOpenChange, closeOnSelect }: {
  project: Project; setProject: (fn: (p: Project) => Project) => void; store: ProjectStore; open: boolean; onOpenChange: (v: boolean) => void; closeOnSelect?: boolean;
}) {
  const [tab, setTab] = useState<"doors" | "total">("doors");
  const [remainingOnly, setRemainingOnly] = useState(true);
  const done = project.doors.filter((d) => d.done).length;
  const onlyLeft = remainingOnly && done > 0;
  const pickDoors = doorsToPick(project.doors, onlyLeft);
  const totals = projectTotals(pickDoors);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-xl p-0 sm:mx-auto sm:max-w-2xl">
        <SheetHeader className="border-b border-t-4 border-t-accent bg-muted/40 px-4 pb-4 pt-5 text-left sm:px-6">
          <SheetTitle className="flex items-center gap-2 pr-8 text-xl"><FolderOpen className="size-5 text-accent" aria-hidden />Projekt</SheetTitle>
          <SheetDescription>Sparas i den här telefonen/webbläsaren.</SheetDescription>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-card px-2.5 py-1.5"><DoorOpen className="size-3.5 text-accent" aria-hidden />{project.doors.length} {project.doors.length === 1 ? "dörr" : "dörrar"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-muted-foreground"><Check className="size-3.5 text-success" aria-hidden />{done} monterade</span>
          </div>
        </SheetHeader>
        <div className="space-y-4 px-4 py-5 sm:px-6">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <select value={store.active} onChange={(e) => { store.select(e.target.value); if (closeOnSelect) onOpenChange(false); }} aria-label="Välj projekt"
                className="h-11 w-full appearance-none rounded-lg border border-input bg-background py-0 pl-3 pr-10 text-base">
                {store.list.map((s, i) => (
                  <option key={s.id} value={s.id}>{s.project.name || `Projekt ${i + 1}`} · {s.project.doors.length} {s.project.doors.length === 1 ? "dörr" : "dörrar"}</option>
                ))}
              </select>
              <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button variant="outline" className="h-11 shrink-0 border-accent/40 font-semibold" onClick={() => { store.create(); setTab("doors"); }}>
              <Plus aria-hidden /> Nytt
            </Button>
          </div>
          <NameField key={store.active} name={project.name} onSave={(name) => setProject((p) => ({ ...p, name }))} />
          <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted p-1" role="group" aria-label="Projektvy">
            {(["doors", "total"] as const).map((t) => (
              <Button variant="ghost" key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={`min-h-11 whitespace-normal rounded-md px-2 text-sm font-semibold ${tab === t ? "bg-accent text-accent-foreground shadow-card hover:bg-accent/85 hover:text-accent-foreground" : "text-muted-foreground hover:bg-card/50 hover:text-foreground"}`}>
                {t === "doors" ? <DoorOpen aria-hidden /> : <ClipboardList aria-hidden />}
                {t === "doors" ? "Dörr för dörr" : "Total plocklista"}
              </Button>
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
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { if (confirm(`Töm alla dörrar i ${project.name || "projektet"}? Projektet finns kvar.`)) setProject(clearDoors); }}>
                <X aria-hidden /> Töm dörrar
              </Button>
            </>
          ) : (
            <>
              {done > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {([true, false] as const).map((v) => (
                     <Button variant="outline" key={String(v)} onClick={() => setRemainingOnly(v)} aria-pressed={remainingOnly === v}
                       className={`min-h-11 whitespace-normal rounded-md px-2 text-sm font-semibold ${remainingOnly === v ? "border-accent bg-accent/15 text-foreground hover:bg-accent/20 hover:text-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                       {remainingOnly === v && <Check aria-hidden />}
                      {v ? "Kvar att montera" : "Hela projektet"}
                     </Button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {onlyLeft
                  ? `Visar ${pickDoors.length} kvarvarande ${pickDoors.length === 1 ? "dörr" : "dörrar"} (${done} monterade borträknade).`
                  : `Visar alla ${project.doors.length} ${project.doors.length === 1 ? "dörr" : "dörrar"}.`}
              </p>
              {pickDoors.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Alla dörrar är monterade – inget kvar att plocka.</p>
              ) : <>
              <div className="border-y py-4">
                {totals.extenders.length > 0 && <>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"><Layers className="size-4 text-accent" aria-hidden />Förlängare</p>
                  <ul className="mb-3 mt-1 divide-y">{totals.extenders.map((e) => (
                    <li key={e.kind + e.size} className="flex items-center justify-between gap-3 py-2.5 text-sm"><span className="font-semibold">{formatMm(e.size)} <span className="text-xs font-normal text-muted-foreground">({KIND_LABEL[e.kind]})</span></span><Chip accent>{e.count} st</Chip></li>
                  ))}</ul>
                </>}
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"><span className="size-3 rounded-full border-2 border-accent" aria-hidden />Ringar</p>
                <ul className="mt-2 space-y-2">{totals.rings.map((r) => (
                  <li key={r.kind + r.side + r.size} className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 text-sm last:border-b-0"><span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"><span className="font-mono font-bold">{formatMm(r.size)}</span>{r.side && <span className={`inline-flex items-center gap-1 font-semibold ${r.side === "Insida" ? "text-side-inside" : "text-side-outside"}`}>{r.side === "Insida" ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUp className="size-3.5" aria-hidden />}{r.side}</span>} <span className="text-xs text-muted-foreground">({KIND_LABEL[r.kind]})</span></span><Chip accent>{r.count} st</Chip></li>
                ))}</ul>
              </div>
              </>}
            </>
          )}
          {tab === "total" && project.doors.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"><ClipboardCopy className="size-4 text-accent" aria-hidden />Kopiera</p>
              <CopyButton text={doorsText(project)} label="Kopiera dörrlista" />
              <CopyButton text={totalsText(project, onlyLeft)} label="Kopiera inköpslista" />
              <CopyButton text={projectText(project)} label="Kopiera hela projektet" />
              {done > 0 && onlyLeft && <p className="text-xs text-muted-foreground">Inköpslistan räknar bort {done} {done === 1 ? "monterad dörr" : "monterade dörrar"}.</p>}
            </div>
          )}
          {(project.doors.length > 0 || store.list.length > 1) && (
            <Button variant="ghost" className="w-full text-destructive" onClick={() => { if (confirm(`Ta bort ${project.name || "projektet"}?`)) store.remove(); }}>
              <X aria-hidden /> Ta bort projekt
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ProjectBar({ project, projects = 1, onOpen }: { project: Project; projects?: number; onOpen: () => void }) {
  if (project.doors.length === 0 && projects < 2) return null;
  return (
    <button onClick={onOpen} className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-primary px-4 py-3 text-left text-primary-foreground shadow-elevated">
      <FolderOpen className="size-5 shrink-0 text-accent" aria-hidden />
      <span className="flex-1 truncate text-sm font-semibold">{project.name || "Projekt"} · {project.doors.length} {project.doors.length === 1 ? "dörr" : "dörrar"}</span>
      <span className="text-sm font-bold text-accent">Visa →</span>
    </button>
  );
}

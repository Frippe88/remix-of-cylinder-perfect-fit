import type { Project } from "./project";

/** Exempelprojekt som visas på Pro-fliken så man ser hela konceptet direkt. Mått följer kalkylatorns regler (31 mm cylinder). */
export const DEMO_PROJECT: Project = {
  name: "Exempel: Kontor Storgatan 12",
  doors: [
    { id: "demo-1", name: "Entrédörr", kind: "oval", done: false, sides: [{ label: "Utsida", depth: 54, ring: 13, extenders: [10] }] },
    { id: "demo-2", name: "Konferensrum", kind: "oval", done: false, sides: [{ label: "Utsida", depth: 42, ring: 11, extenders: [] }] },
    { id: "demo-3", name: "Förråd", kind: "rund", done: true, sides: [{ label: null, depth: 39, ring: 8, extenders: [] }] },
    { id: "demo-4", name: "Serverrum", kind: "oval", done: false, sides: [
      { label: "Utsida", depth: 47, ring: 16, extenders: [] },
      { label: "Insida", depth: 39, ring: 8, extenders: [] },
    ] },
  ],
};

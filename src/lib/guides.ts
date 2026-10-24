// Innehåll för guidesidorna. Måtten speglar konstanterna i src/lib/cylinder.ts.
import {
  EXTENDER_SIZES,
  ILOQ_CYLINDER_MM,
  ILOQ_DOUBLE_INSIDE_EXTRA_MM,
  ILOQ_RING_HEIGHTS,
  RING_HEIGHTS,
  ROUND_CYLINDER_MM,
  ROUND_RING_HEIGHTS,
  STANDARD_CYLINDER_MM,
  TOLERANCE_MAX,
  TOLERANCE_MIN,
} from "@/lib/cylinder";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  answer: string;
  sections: { heading: string; body: string[] }[];
  mistakes: string[];
}

const list = (a: readonly number[]) => a.map((n) => `${String(n).replace(".", ",")}mm`).join(", ");

export const GUIDES: Guide[] = [
  {
    slug: "rakna-cylinderlangd",
    title: "Räkna cylinderlängd",
    description: "Mät dörrdjupet från låshuset ut till dörrens yta och räkna fram cylinder, förlängare och ringar.",
    answer: `Mät dörrdjupet från låshusets cylinderfäste ut till dörrbladets yta på den sida du räknar – det är inte samma sak som hela dörrens tjocklek. En standard oval cylinder är ${STANDARD_CYLINDER_MM}mm. Förlängarna bygger upp cylindern till rätt längd, och ringen väljs efter hur mycket cylindern sticker ut.`,
    sections: [
      { heading: "Så mäter du dörrdjupet", body: ["Mät från låshusets cylinderfäste ut till dörrbladets yttre yta, på den sida du ska räkna.", "Mät med tumstock och läs av måttet i millimeter.", "Ta med skylt, förstärkningsbehör eller andra tillbehör som bygger på dörrbladet.", "Vid dubbelcylinder mäts varje sida för sig – måttet på in- och utsida är sällan detsamma och varierar ofta."] },
      { heading: "Så räknar du cylinderlängden", body: ["1. Mät dörrdjupet på utsidan (och insidan vid dubbelcylinder).", "2. Välj cylindertyp: oval, rund eller iLOQ.", "3. Kombinera förlängare och ring så att utsticket hamnar så nära noll som möjligt.", "4. Kontrollera att avvikelsen ligger inom regeln för cylindertypen."] },
      { heading: "Vilka delar finns", body: [`Förlängare för oval cylinder: ${list(EXTENDER_SIZES)}.`, `Ringar för oval cylinder: ${list(RING_HEIGHTS)}.`] },
    ],
    mistakes: ["Att mäta hela dörrtjockleken och dela på två.", "Att mäta från fel punkt på låshuset.", "Att glömma räkna med utsticket från extra skylt eller förstärkningsbehör.", "Att räkna båda sidor som samma mått vid dubbelcylinder."],
  },

  {
    slug: "cylinder-sticker-ut",
    title: "Cylinder sticker ut för mycket?",
    description: `Godkänd avvikelse för oval cylinder är ${TOLERANCE_MIN} till +${TOLERANCE_MAX}mm. Så väljer du ring och förlängare när cylindern sticker ut.`,
    answer: `För ovala cylindrar och iLOQ gäller en godkänd avvikelse på ${TOLERANCE_MIN} till +${TOLERANCE_MAX}mm enligt regelboken. Sticker cylindern ut mer behöver du en annan ring eller färre förlängare.`,
    sections: [
      { heading: "Varför utsticket spelar roll", body: ["En cylinder som sticker ut för mycket är lättare att angripa och ser slarvig ut. En cylinder som sitter för djupt kan vara svår att använda med nyckel eller vred."] },
      { heading: "Runda cylindrar är annorlunda", body: ["För runda cylindrar finns ingen fast regel för utstick. Målet är ändå att komma så nära som möjligt, och kalkylatorn väljer alltid den närmaste kombinationen."] },
    ],
    mistakes: ["Att lägga på en extra förlängare ”för säkerhets skull”.", "Att använda samma regel för rund och oval cylinder."],
  },
  {
    slug: "ring-oval-cylinder",
    title: "Vilken ring passar till oval cylinder?",
    description: "Guide till cylinderringar för oval cylinder: vilka höjder som finns och hur du väljer rätt tillsammans med förlängare.",
    answer: `Ringen väljs så att cylinderns utstick hamnar inom ${TOLERANCE_MIN} till +${TOLERANCE_MAX}mm. Vanliga ringhöjder för oval cylinder är ${list(RING_HEIGHTS)}.`,
    sections: [
      { heading: "Ring och förlängare tillsammans", body: ["Förlängarna tar upp det stora måttet och ringen finjusterar resten. Ofta finns flera kombinationer som fungerar. Välj då den som hamnar närmast dörrens yta, och om två är lika bra, den som behöver minst antal förlängare. Färre delar ger ett stabilare och snyggare montage."] },
      { heading: "Ringar till iLOQ", body: [`iLOQ har egna, högre ringar på ${list(ILOQ_RING_HEIGHTS)}. Vanliga ringar går också att använda på iLOQ-cylinder när det ger ett bättre montage. Det viktiga är att utsticket hamnar inom ${TOLERANCE_MIN} till +${TOLERANCE_MAX}mm.`] },
    ],
    mistakes: ["Att välja ring innan förlängarna är bestämda.", "Att bygga på med fler förlängare än nödvändigt när en annan ring hade räckt."],
  },
  {
    slug: "dubbelcylinder-matt",
    title: "Dubbelcylinder – så räknar du måtten",
    description: "Vid dubbelcylinder räknas utsida och insida var för sig. Så mäter och räknar du båda sidor rätt.",
    answer: "Vid dubbelcylinder har dörren cylinder på båda sidor. Mät dörrdjupet separat på utsidan och insidan och räkna varje sida för sig – måttet på in- och utsida är sällan detsamma och varierar ofta.",
    sections: [
      { heading: "Varför sidorna skiljer sig", body: ["Låshuset sitter sällan exakt mitt i dörrbladet, och behör eller skyltar kan vara olika tjocka på de två sidorna."] },
      { heading: "Tänk på iLOQ", body: [`Vid iLOQ dubbelcylinder bygger monteringsbrickorna ${ILOQ_DOUBLE_INSIDE_EXTRA_MM}mm extra på insidan.`] },
    ],
    mistakes: ["Att räkna ena sidan och anta samma mått på den andra."],
  },
  {
    slug: "iloq-dubbelcylinder-montage",
    title: "iLOQ dubbelcylinder – montage och mått",
    description: `iLOQ dubbelcylinder bygger ${ILOQ_DOUBLE_INSIDE_EXTRA_MM}mm extra på insidan på grund av två monteringsbrickor. Så räknar du rätt.`,
    answer: `En iLOQ-cylinder är ${ILOQ_CYLINDER_MM}mm. Vid dubbelmontage sitter två monteringsbrickor på 3mm vardera på insidan av låshuset, så insidan räknas som ${ILOQ_CYLINDER_MM + ILOQ_DOUBLE_INSIDE_EXTRA_MM}mm.`,
    sections: [
      { heading: "Varför måtten blir annorlunda", body: ["Brickorna sitter mellan låshus och cylinder och skjuter ut cylindern. Räknar du utan dem sticker cylindern ut för mycket på insidan."] },
      { heading: "Utsidan påverkas inte", body: [`På utsidan räknas iLOQ-cylindern som vanligt, ${ILOQ_CYLINDER_MM}mm.`] },
    ],
    mistakes: ["Att glömma räkna med båda brickorna.", "Att lägga till de 6mm på båda sidor."],
  },
  {
    slug: "rund-cylinder-ringar-forlangare",
    title: "Rund cylinder – ringar och förlängare",
    description: "Så väljer du ringar och förlängare till rund cylinder. Ingen fast utsticksregel – målet är närmaste snygga montage.",
    answer: `Rund cylinder räknas med ${ROUND_CYLINDER_MM}mm. Ringar på ${list(ROUND_RING_HEIGHTS)} och förlängare på 10mm används. Det finns ingen fast regel för utstick, men målet är alltid så nära som möjligt.`,
    sections: [
      { heading: "Fabrikat kan skilja", body: ["Behör från olika fabrikat (t.ex. ASSA, dormakaba och EVVA) kan ge något olika mått. Kontrollera mot tillverkarens produktblad när det är kritiskt.", "ASSA ABLOY:s runda cylinder är 31mm, men cylinderhylsan (koppen) bygger ut den till 33mm monterat. Därför räknar kalkylatorn rund cylinder med 33mm."] },
    ],
    mistakes: ["Att tro att rund cylinder har samma tolerans som oval."],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);

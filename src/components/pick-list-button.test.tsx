import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PickListButton } from "./pick-list-button";
import { EXTENDER_SIZES, RING_HEIGHTS } from "@/lib/cylinder";

afterEach(cleanup);

const ext = [...EXTENDER_SIZES];
const rings = [...RING_HEIGHTS];
const sides = [
  { label: "Utsida", depth: 36, selected: null },
  { label: "Insida", depth: 32, selected: null },
];

describe("Plocklista", () => {
  it.each(["256", "2356"] as const)("kopierar valt %s-behör med dörren", (fitting) => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<PickListButton sides={[{ label: "Utsida", depth: 36, selected: null }]} ext={ext} rings={rings} baseMm={31} relaxed={false} fitting={fitting} />);
    fireEvent.click(screen.getByRole("button", { name: /Kopiera plocklista/ }));
    expect(writeText).toHaveBeenCalledWith(`Utsida: ${fitting} behör (11mm ring) + 2st 8mm förlängare`);
  });
  it("copies one clean plain-text line per side, no extra characters", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<PickListButton sides={sides} ext={ext} rings={rings} baseMm={31} relaxed={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Kopiera plocklista/ }));
    expect(writeText).toHaveBeenCalledWith(
      "Utsida: 11mm ring + 2st 8mm förlängare\nInsida: 11mm ring + 1st 12,5mm förlängare",
    );
  });

  it("shows nothing before a door depth is entered", () => {
    const { container } = render(
      <PickListButton sides={[{ label: "Utsida", depth: null, selected: null }]} ext={ext} rings={rings} baseMm={31} relaxed={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("runda cylindrar får ingen sida i den kopierade listan", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(
      <PickListButton sides={[{ label: null, depth: 45, selected: null }]} ext={[10]} rings={[8, 13]} baseMm={31} relaxed />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Kopiera plocklista/ }));
    expect(writeText).toHaveBeenCalledWith("13mm ring + 3st 10mm förlängare");
  });

  it("behörsmenyn säger 'Täckbricka med cylinder (18mm ring)' – utan dubbel-t 'med'", () => {
    render(
      <PickListButton
        sides={[{ label: "Utsida", depth: 49, selected: { ring: 18, extenders: [], extenderCount: 0, totalExtension: 18, deviation: 0 } }]}
        ext={ext}
        rings={rings}
        baseMm={31}
        relaxed={false}
        fitting="tackbricka"
        onFittingChange={() => {}}
        fittingChoices={["vred", "tackbricka"]}
      />,
    );
    const opt = screen.getByRole("option", { name: /Täckbricka/ });
    expect(opt.textContent).toBe("Täckbricka med cylinder (18mm ring)");
    expect(opt.textContent).not.toContain("cylinder med 18mm");
  });

  it("skruvvarning visas som kompakt chip med blå 'Varför?'-knapp", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const onShowAll = vi.fn();
    render(
      <PickListButton
        sides={[{ label: "Utsida", depth: 39, selected: { ring: 6, extenders: [8, 12.5, 12.5], extenderCount: 3, totalExtension: 33, deviation: 0 } }]}
        ext={ext}
        rings={rings}
        baseMm={31}
        relaxed={false}
        ovalSingle
        onShowAll={onShowAll}
      />,
    );
    expect(screen.getByText("63mm räcker inte")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Förklara varför 63mm inte räcker" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Byt till Alla" }));
    expect(onShowAll).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/längre klippbar cylinderskruv krävs/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Kopiera plocklista/ }));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("Skruv: 33mm förlängning – 63mm räcker inte, längre klippbar cylinderskruv krävs (minst 64mm)"),
    );
  });
});

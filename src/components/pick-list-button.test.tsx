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
  it("copies one clean plain-text line per side, no extra characters", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<PickListButton sides={sides} ext={ext} rings={rings} baseMm={31} relaxed={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Kopiera plocklista/ }));
    expect(writeText).toHaveBeenCalledWith(
      "Utsida: 2 st 8 mm förlängare + 11 mm ring\nInsida: 1 st 12,5 mm förlängare + 11 mm ring",
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
    expect(writeText).toHaveBeenCalledWith("2 st 10 mm förlängare + 8 mm ring");
  });
});

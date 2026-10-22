import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CylinderResults } from "./cylinder-results";
import { calculate, EXTENDER_SIZES, RING_HEIGHTS } from "@/lib/cylinder";

afterEach(cleanup);
const props = { title: "Utsida", depth: 32, ext: [...EXTENDER_SIZES], rings: [...RING_HEIGHTS], baseMm: 31 };

describe("Results overview", () => {
  it("shows one recommendation and keeps all other combinations accessible in batches", () => {
    render(<CylinderResults {...props} />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Visa andra alternativ/ }));
    expect(screen.getAllByRole("article")).toHaveLength(5);
    const count = calculate({ depth: 32, extenders: props.ext, rings: props.rings }).length;
    while (screen.queryByRole("button", { name: "Visa fler" })) {
      fireEvent.click(screen.getByRole("button", { name: "Visa fler" }));
    }
    expect(screen.getAllByRole("article")).toHaveLength(count);
    expect(screen.getAllByRole("article", { name: "Bästa rekommendation" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Exakt 0 mm" }));
    expect(screen.getByText("Inga fler alternativ i den här vyn.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Dölj alternativ/ }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("keeps outside and inside alternatives independent", () => {
    render(<><CylinderResults {...props} /><CylinderResults {...props} title="Insida" depth={36} /></>);
    const outside = screen.getByRole("region", { name: "Resultat utsida" });
    const inside = screen.getByRole("region", { name: "Resultat insida" });
    fireEvent.click(within(outside).getByRole("button", { name: /Visa andra alternativ/ }));
    expect(within(outside).getAllByRole("article")).toHaveLength(5);
    expect(within(inside).getAllByRole("article")).toHaveLength(1);
  });

  it("resets expanded alternatives when measurements change", () => {
    const { rerender } = render(<CylinderResults {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Visa andra alternativ/ }));
    rerender(<CylinderResults {...props} depth={36} />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("round cylinder shows best fit without tolerance warning", () => {
    render(<CylinderResults title={null} depth={12} baseMm={30} rings={[8, 13]} ext={[10]} relaxed />);
    expect(screen.getByText("+5 mm")).toBeInTheDocument();
    expect(screen.queryByText(/Utanför toleransen/)).not.toBeInTheDocument();
  });
});
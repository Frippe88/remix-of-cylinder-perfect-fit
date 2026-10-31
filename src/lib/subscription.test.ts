import { describe, expect, it } from "vitest";
import { companyMonthlyTotal, companyPriceId, companyPricePerSeat, companyStatusFromStripe, isSubscriptionActive, isValidSeatCount, PRO_MONTHLY_SEK, withVat } from "./subscription";

describe("prissättning", () => {
  it("enskild Pro kostar 149 kr/mån", () => expect(PRO_MONTHLY_SEK).toBe(149));
  it("1–9 tekniker: 149 kr", () => {
    expect(companyPricePerSeat(1)).toBe(149);
    expect(companyPricePerSeat(9)).toBe(149);
  });
  it("10–19 tekniker: 129 kr", () => {
    expect(companyPricePerSeat(10)).toBe(129);
    expect(companyPricePerSeat(19)).toBe(129);
  });
  it("20+ tekniker: 99 kr", () => expect(companyPricePerSeat(20)).toBe(99));
  it("totalsumma 12 tekniker", () => expect(companyMonthlyTotal(12)).toBe(1548));
  it("moms 25 %", () => expect(withVat(149)).toBe(186.25));
});

describe("abonnemangsstatus", () => {
  const future = "2099-01-01T00:00:00Z";
  const past = "2000-01-01T00:00:00Z";
  it("aktiv ger tillgång", () => expect(isSubscriptionActive({ status: "active", current_period_end: future, cancel_at_period_end: false, price_id: "pro_monthly" })).toBe(true));
  it("avslutad med tid kvar ger tillgång", () => expect(isSubscriptionActive({ status: "canceled", current_period_end: future, cancel_at_period_end: true, price_id: "pro_monthly" })).toBe(true));
  it("avslutad och utgången ger ingen tillgång", () => expect(isSubscriptionActive({ status: "canceled", current_period_end: past, cancel_at_period_end: true, price_id: "pro_monthly" })).toBe(false));
  it("inget abonnemang", () => expect(isSubscriptionActive(null)).toBe(false));
});

describe("företagsköp", () => {
  it("1–9 tekniker använder 149-priset", () => {
    expect(companyPriceId(1)).toBe("company_seat_1_9");
    expect(companyPriceId(9)).toBe("company_seat_1_9");
  });
  it("10–19 tekniker använder 129-priset", () => {
    expect(companyPriceId(10)).toBe("company_seat_10_19");
    expect(companyPriceId(19)).toBe("company_seat_10_19");
  });
  it("20+ tekniker använder 99-priset", () => expect(companyPriceId(20)).toBe("company_seat_20_plus"));
  it("antal tekniker måste vara 1–500", () => {
    expect(isValidSeatCount(0)).toBe(false);
    expect(isValidSeatCount(1)).toBe(true);
    expect(isValidSeatCount(500)).toBe(true);
    expect(isValidSeatCount(501)).toBe(false);
    expect(isValidSeatCount(2.5)).toBe(false);
  });
  it("avslutat abonnemang stänger företaget", () => {
    expect(companyStatusFromStripe("active")).toBe("active");
    expect(companyStatusFromStripe("canceled")).toBe("canceled");
    expect(companyStatusFromStripe("unpaid")).toBe("canceled");
  });
});

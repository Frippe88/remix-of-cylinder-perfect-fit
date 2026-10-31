// Pure pricing + subscription rules (tested in subscription.test.ts).

export type SubscriptionRow = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  price_id: string;
};

/** Enskild Pro-licens, kr/mån exkl. moms. */
export const PRO_MONTHLY_SEK = 179;
export const VAT_RATE = 0.25;

/** Företagstrappa, kr per tekniker och månad exkl. moms. */
export const COMPANY_TIERS = [
  { min: 1, max: 3, price: 179, priceId: "company_seat_1_3" },
  { min: 4, max: 9, price: 149, priceId: "company_seat_4_9" },
  { min: 10, max: 19, price: 129, priceId: "company_seat_10_19" },
  { min: 20, max: null, price: 99, priceId: "company_seat_20_plus" },
] as const;

export const COMPANY_MAX_SEATS = 500;

function companyTier(seats: number) {
  const n = Math.max(1, Math.floor(seats));
  return COMPANY_TIERS.find((t) => n >= t.min && (t.max === null || n <= t.max))!;
}

export function companyPricePerSeat(seats: number): number {
  return companyTier(seats).price;
}

export type BillingPeriod = "month" | "year";
/** Helår = 10 månaders pris (2 månader gratis). */
export const YEARLY_MONTHS_PAID = 10;

/** Stripe-pris (lookup key) som gäller för antal tekniker och period. */
export function companyPriceId(seats: number, period: BillingPeriod = "month"): string {
  const id = companyTier(seats).priceId;
  return period === "year" ? `${id}_yearly` : id;
}

export function periodFromPriceId(priceId: string | null | undefined): BillingPeriod {
  return priceId?.endsWith("_yearly") ? "year" : "month";
}

/** Årskostnad exkl. moms för företag på helår. */
export function companyYearlyTotal(seats: number): number {
  return companyMonthlyTotal(seats) * YEARLY_MONTHS_PAID;
}

export function isValidSeatCount(seats: unknown): seats is number {
  return typeof seats === "number" && Number.isInteger(seats) && seats >= 1 && seats <= COMPANY_MAX_SEATS;
}

export function isCompanyPrice(priceId: string | null | undefined): boolean {
  return !!priceId && priceId.startsWith("company_seat_");
}

/** Företagskontots status utifrån Stripe-abonnemangets status. */
export function companyStatusFromStripe(status: string): "active" | "canceled" {
  return ["active", "trialing", "past_due"].includes(status) ? "active" : "canceled";
}

export function companyMonthlyTotal(seats: number): number {
  const n = Math.max(1, Math.floor(seats));
  return n * companyPricePerSeat(n);
}

export function withVat(amount: number): number {
  return Math.round(amount * (1 + VAT_RATE) * 100) / 100;
}

export function isSubscriptionActive(sub: SubscriptionRow | null, now: Date = new Date()): boolean {
  if (!sub) return false;
  const end = sub.current_period_end ? new Date(sub.current_period_end) : null;
  const future = !end || end > now;
  if (["active", "trialing", "past_due"].includes(sub.status)) return future;
  if (sub.status === "canceled") return !!end && end > now;
  return false;
}

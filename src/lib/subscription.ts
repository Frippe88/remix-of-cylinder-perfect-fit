// Pure pricing + subscription rules (tested in subscription.test.ts).

export type SubscriptionRow = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  price_id: string;
};

/** Enskild Pro-licens, kr/mån exkl. moms. */
export const PRO_MONTHLY_SEK = 149;
export const VAT_RATE = 0.25;

/** Företagstrappa, kr per tekniker och månad exkl. moms. */
export const COMPANY_TIERS = [
  { min: 1, max: 9, price: 149 },
  { min: 10, max: 19, price: 129 },
  { min: 20, max: null, price: 99 },
] as const;

export function companyPricePerSeat(seats: number): number {
  const n = Math.max(1, Math.floor(seats));
  return COMPANY_TIERS.find((t) => n >= t.min && (t.max === null || n <= t.max))!.price;
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

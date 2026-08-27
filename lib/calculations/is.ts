/**
 * IS (Impôt sur les Sociétés) — Moroccan corporate tax.
 */

/** Progressive IS scale brackets (net taxable profit, DH → rate). */
export const IS_PROGRESSIVE_BRACKETS = [
  { upTo: 300_000, rate: 0.10 },
  { upTo: 1_000_000, rate: 0.20 },
  { upTo: Infinity, rate: 0.31 },
] as const;

/** Resolves the single progressive-scale rate that applies to a given net profit. */
export function resolveProgressiveISRate(netProfit: number): number {
  const bracket = IS_PROGRESSIVE_BRACKETS.find(b => netProfit <= b.upTo);
  return bracket ? bracket.rate : IS_PROGRESSIVE_BRACKETS[IS_PROGRESSIVE_BRACKETS.length - 1].rate;
}

/** IS due under the progressive scale (used by the interactive simulator). */
export function calculateProgressiveIS(netProfit: number): { rate: number; amount: number } {
  const profit = Math.max(0, netProfit);
  const rate = resolveProgressiveISRate(profit);
  return { rate, amount: profit * rate };
}

/** IS due at the establishment's configured flat rate (used on the dashboard). */
export function calculateFlatIS(netProfit: number, isRate: number): number {
  return Math.max(0, netProfit * isRate);
}

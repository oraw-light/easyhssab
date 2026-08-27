/**
 * TVA (Moroccan VAT) calculations.
 *
 * Amounts recorded in Revenue/Expense are TTC (tax-included). Moroccan VAT
 * is charged on top of the net price, so extracting it from a TTC amount is
 * amount * rate / (1 + rate), not amount * rate.
 */

/** Extracts the VAT portion embedded in a tax-included (TTC) amount. */
export function extractVATFromTTC(amountTTC: number, rate: number): number {
  return amountTTC * (rate / (1 + rate));
}

/**
 * Net VAT payable to the state = VAT collected on sales - VAT deductible on
 * purchases/costs. Never negative (a credit carries forward, it isn't paid out here).
 */
export function calculateNetVATPayable(params: {
  totalRevenueTTC: number;
  totalDeductibleCostsTTC: number;
  collectedRate: number;
  /** Rate applied to deductible purchases/costs. Defaults to the 20% standard rate. */
  deductibleRate?: number;
}): { collectedVAT: number; deductibleVAT: number; netVATPayable: number } {
  const { totalRevenueTTC, totalDeductibleCostsTTC, collectedRate, deductibleRate = 0.20 } = params;
  const collectedVAT = extractVATFromTTC(totalRevenueTTC, collectedRate);
  const deductibleVAT = extractVATFromTTC(totalDeductibleCostsTTC, deductibleRate);
  const netVATPayable = Math.max(0, collectedVAT - deductibleVAT);
  return { collectedVAT, deductibleVAT, netVATPayable };
}

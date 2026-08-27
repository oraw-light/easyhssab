import type { TaxSettings } from '../../src/types';
import { extractVATFromTTC } from './tva';
import { calculateFlatIS } from './is';

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  staffCosts: number;
  collectedTVA: number;
  grossProfit: number;
  corporateTaxIS: number;
  netProfit: number;
  cashOnHand: number;
  profitMarginPct: number;
}

/** Dashboard-level aggregate: revenue, expenses, TVA collected, IS, net profit, cash, margin. */
export function calculateFinancialSummary(params: {
  revenues: { amount: number }[];
  expenses: { amount: number }[];
  employees: { baseSalary: number }[];
  taxSettings: TaxSettings;
}): FinancialSummary {
  const { revenues, expenses, employees, taxSettings } = params;

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const staffCosts = employees.reduce((sum, e) => sum + e.baseSalary, 0);
  const collectedTVA = extractVATFromTTC(totalRevenue, taxSettings.tvaRate);

  const grossProfit = totalRevenue - totalExpenses;
  const corporateTaxIS = calculateFlatIS(grossProfit, taxSettings.isRate);
  const netProfit = grossProfit - corporateTaxIS;
  const cashOnHand = Math.max(0, totalRevenue - totalExpenses - corporateTaxIS);
  const profitMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  return { totalRevenue, totalExpenses, staffCosts, collectedTVA, grossProfit, corporateTaxIS, netProfit, cashOnHand, profitMarginPct };
}

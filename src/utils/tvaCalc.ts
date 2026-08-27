import { RevenueTransaction, ExpenseTransaction, PurchaseOrder } from '../types';

export type PeriodMode = 'month' | 'quarter';

export interface PeriodRange {
  startISO: string;
  endISO: string;
  label: string;
}

export interface TvaLineBreakdown {
  label: string;
  amountTTC: number;
  tva: number;
  count: number;
}

export interface TvaDeclarationResult {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  collected: TvaLineBreakdown;
  deductibleLines: TvaLineBreakdown[];
  totalCollectedTVA: number;
  totalDeductibleTVA: number;
  netTVA: number;
}

export const DEDUCTIBLE_EXPENSE_CATEGORIES: ExpenseTransaction['category'][] = [
  'Rent', 'Electricity', 'Water', 'Gaz', 'Internet', 'Marketing', 'Maintenance'
];

const MONTH_NAMES: Record<'FR' | 'EN' | 'AR', string[]> = {
  FR: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  EN: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  AR: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'],
};

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatISO(year: number, month1based: number, day: number): string {
  return `${year}-${pad(month1based)}-${pad(day)}`;
}

export function getPeriodRange(mode: PeriodMode, anchor: Date, language: 'FR' | 'EN' | 'AR'): PeriodRange {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  if (mode === 'month') {
    const startISO = formatISO(year, month + 1, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endISO = formatISO(year, month + 1, lastDay);
    const label = `${MONTH_NAMES[language][month]} ${year}`;
    return { startISO, endISO, label };
  }

  const qStartMonth = Math.floor(month / 3) * 3;
  const startISO = formatISO(year, qStartMonth + 1, 1);
  const qEndMonth = qStartMonth + 2;
  const lastDay = new Date(year, qEndMonth + 1, 0).getDate();
  const endISO = formatISO(year, qEndMonth + 1, lastDay);
  const quarterNum = Math.floor(month / 3) + 1;
  const label = `Q${quarterNum} ${year}`;
  return { startISO, endISO, label };
}

export function shiftAnchor(mode: PeriodMode, anchor: Date, direction: 1 | -1): Date {
  const monthsToShift = mode === 'month' ? direction : direction * 3;
  return new Date(anchor.getFullYear(), anchor.getMonth() + monthsToShift, 1);
}

export function computeTvaDeclaration(
  revenues: RevenueTransaction[],
  expenses: ExpenseTransaction[],
  purchases: PurchaseOrder[],
  rate: number,
  period: PeriodRange
): TvaDeclarationResult {
  // Invoice basis (not cash/encaissement basis): amounts count in the period they're
  // dated, regardless of payment status. Simplified for this demo but consistent on
  // both the collected (revenues) and deductible (purchases/expenses) sides.
  const inPeriod = (dateISO: string) => dateISO >= period.startISO && dateISO <= period.endISO;
  const extractTVA = (ttc: number) => ttc * (rate / (1 + rate));

  const periodRevenues = revenues.filter(r => inPeriod(r.date));
  const revenueTotal = periodRevenues.reduce((sum, r) => sum + r.amount, 0);
  const collectedTVA = extractTVA(revenueTotal);

  const periodPurchases = purchases.filter(p => inPeriod(p.date));
  const purchasesTotal = periodPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const purchasesTVA = extractTVA(purchasesTotal);

  const deductibleLines: TvaLineBreakdown[] = [
    { label: 'purchases', amountTTC: purchasesTotal, tva: purchasesTVA, count: periodPurchases.length }
  ];

  let expensesTVA = 0;
  for (const category of DEDUCTIBLE_EXPENSE_CATEGORIES) {
    const lines = expenses.filter(e => inPeriod(e.date) && e.category === category);
    if (lines.length === 0) continue;
    const amount = lines.reduce((sum, e) => sum + e.amount, 0);
    const tva = extractTVA(amount);
    expensesTVA += tva;
    deductibleLines.push({ label: category, amountTTC: amount, tva, count: lines.length });
  }

  const totalDeductibleTVA = purchasesTVA + expensesTVA;
  const netTVA = collectedTVA - totalDeductibleTVA;

  return {
    periodLabel: period.label,
    periodStart: period.startISO,
    periodEnd: period.endISO,
    collected: { label: 'sales', amountTTC: revenueTotal, tva: collectedTVA, count: periodRevenues.length },
    deductibleLines,
    totalCollectedTVA: collectedTVA,
    totalDeductibleTVA,
    netTVA
  };
}

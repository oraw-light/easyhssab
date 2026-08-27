# TVA Declaration View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Déclaration TVA" tab to the Tax Engine that computes collected vs. deductible VAT for a selected month/quarter from real revenues, expenses, and purchases, and shows the net amount due or credit carried forward.

**Architecture:** Pure calculation logic lives in a new `src/utils/tvaCalc.ts` module (period range math + the collected/deductible/net computation), consumed by a new presentational `src/components/TvaDeclaration.tsx` component, which is wired in as a 4th tab inside the existing `src/components/TaxEngine.tsx`. `App.tsx` gains one new prop pass-through (`expenses`) to `TaxEngine`.

**Tech Stack:** React + TypeScript, Tailwind classes matching existing app styling, lucide-react icons. No test runner is configured in this repo (see `CLAUDE.md`) — verification is via `tsc --noEmit` (`npm run lint`) and manual browser check via the dev server.

**Spec:** `docs/superpowers/specs/2026-08-27-tva-declaration-design.md`

---

### Task 1: TVA calculation utility module

**Files:**
- Create: `src/utils/tvaCalc.ts`

- [ ] **Step 1: Write the module**

```typescript
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: no errors referencing `tvaCalc.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/utils/tvaCalc.ts
git commit -m "feat: add TVA declaration calculation utility"
```

---

### Task 2: TvaDeclaration component

**Files:**
- Create: `src/components/TvaDeclaration.tsx`

- [ ] **Step 1: Write the component**

```tsx
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { RevenueTransaction, ExpenseTransaction, PurchaseOrder, TaxSettings } from '../types';
import { computeTvaDeclaration, getPeriodRange, shiftAnchor, PeriodMode } from '../utils/tvaCalc';

interface TvaDeclarationProps {
  revenues: RevenueTransaction[];
  expenses: ExpenseTransaction[];
  purchases: PurchaseOrder[];
  taxSettings: TaxSettings;
  currency: string;
  language: 'FR' | 'EN' | 'AR';
}

const CATEGORY_LABELS: Record<string, { FR: string; EN: string }> = {
  sales: { FR: 'Ventes (CA)', EN: 'Sales' },
  purchases: { FR: 'Achats Fournisseurs', EN: 'Supplier Purchases' },
  Rent: { FR: 'Loyer', EN: 'Rent' },
  Electricity: { FR: 'Électricité', EN: 'Electricity' },
  Water: { FR: 'Eau', EN: 'Water' },
  Gaz: { FR: 'Gaz', EN: 'Gas' },
  Internet: { FR: 'Internet', EN: 'Internet' },
  Marketing: { FR: 'Marketing', EN: 'Marketing' },
  Maintenance: { FR: 'Maintenance', EN: 'Maintenance' },
};

export const TvaDeclaration: React.FC<TvaDeclarationProps> = ({
  revenues,
  expenses,
  purchases,
  taxSettings,
  currency,
  language
}) => {
  const [mode, setMode] = useState<PeriodMode>('month');
  const [anchor, setAnchor] = useState(new Date());

  const period = useMemo(() => getPeriodRange(mode, anchor, language), [mode, anchor, language]);
  const result = useMemo(
    () => computeTvaDeclaration(revenues, expenses, purchases, taxSettings.tvaRate, period),
    [revenues, expenses, purchases, taxSettings.tvaRate, period]
  );

  const labelFor = (key: string) => {
    const entry = CATEGORY_LABELS[key];
    if (!entry) return key;
    return language === 'FR' ? entry.FR : entry.EN;
  };

  const isCredit = result.netTVA < 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-serif font-black text-lg text-[#1A1A1A] flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-[#C4A484]" />
          {language === 'FR' ? 'Déclaration de TVA' : 'VAT Declaration'}
        </h4>

        <div className="flex items-center gap-2">
          <div className="flex border-2 border-[#1A1A1A] rounded-xl overflow-hidden">
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer ${
                mode === 'month' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'
              }`}
            >
              {language === 'FR' ? 'Mois' : 'Month'}
            </button>
            <button
              onClick={() => setMode('quarter')}
              className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer border-l-2 border-[#1A1A1A] ${
                mode === 'quarter' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'
              }`}
            >
              {language === 'FR' ? 'Trimestre' : 'Quarter'}
            </button>
          </div>

          <div className="flex items-center gap-1 border-2 border-[#1A1A1A] rounded-xl px-1.5 py-1">
            <button
              onClick={() => setAnchor(prev => shiftAnchor(mode, prev, -1))}
              className="p-1 cursor-pointer hover:bg-[#F3F1ED] rounded-lg"
              aria-label={language === 'FR' ? 'Période précédente' : 'Previous period'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-[#1A1A1A] min-w-[110px] text-center">
              {period.label}
            </span>
            <button
              onClick={() => setAnchor(prev => shiftAnchor(mode, prev, 1))}
              className="p-1 cursor-pointer hover:bg-[#F3F1ED] rounded-lg"
              aria-label={language === 'FR' ? 'Période suivante' : 'Next period'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`p-5 rounded-2xl border-2 border-[#1A1A1A] flex flex-col justify-between ${
          isCredit ? 'bg-green-50' : 'bg-[#1A1A1A] text-white'
        }`}
      >
        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isCredit ? 'text-green-700' : 'text-[#AFA9A0]'}`}>
          {isCredit
            ? (language === 'FR' ? 'Crédit de TVA Reportable' : 'VAT Credit Carried Forward')
            : (language === 'FR' ? 'TVA Nette à Verser' : 'Net VAT Payable')}
        </span>
        <h4 className={`text-3xl font-serif font-black mt-2 ${isCredit ? 'text-green-700' : 'text-[#C4A484]'}`}>
          {currency}{Math.abs(result.netTVA).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </h4>
        <span className={`text-[10px] font-bold mt-1 ${isCredit ? 'text-green-600' : 'text-[#AFA9A0]'}`}>
          {language === 'FR'
            ? `Collectée ${currency}${result.totalCollectedTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })} — Déductible ${currency}${result.totalDeductibleTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : `Collected ${currency}${result.totalCollectedTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })} — Deductible ${currency}${result.totalDeductibleTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold border-collapse">
          <thead>
            <tr className="bg-[#F3F1ED] text-[#8C7B6E] font-bold text-[10px] uppercase border-b border-[#1A1A1A]/10">
              <th className="py-2.5 px-4">{language === 'FR' ? 'Poste' : 'Line'}</th>
              <th className="py-2.5 px-4 text-right">{language === 'FR' ? 'Montant TTC' : 'Amount (incl. VAT)'}</th>
              <th className="py-2.5 px-4 text-right">{language === 'FR' ? 'TVA' : 'VAT'}</th>
              <th className="py-2.5 px-4 text-right">{language === 'FR' ? 'Opérations' : 'Transactions'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 bg-white">
              <td className="py-3 px-4 font-bold text-[#1A1A1A]">{labelFor('sales')} ({language === 'FR' ? 'collectée' : 'collected'})</td>
              <td className="py-3 px-4 text-right font-mono">{currency}{result.collected.amountTTC.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right font-mono text-green-700">+{currency}{result.collected.tva.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right font-mono text-[#8C7B6E]">{result.collected.count}</td>
            </tr>
            {result.deductibleLines.map(line => (
              <tr key={line.label} className="border-b border-gray-100">
                <td className="py-3 px-4 font-bold text-[#1A1A1A]">{labelFor(line.label)} ({language === 'FR' ? 'déductible' : 'deductible'})</td>
                <td className="py-3 px-4 text-right font-mono">{currency}{line.amountTTC.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right font-mono text-red-600">-{currency}{line.tva.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right font-mono text-[#8C7B6E]">{line.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: no errors referencing `TvaDeclaration.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/TvaDeclaration.tsx
git commit -m "feat: add TvaDeclaration component"
```

---

### Task 3: Wire the new tab into TaxEngine

**Files:**
- Modify: `src/components/TaxEngine.tsx:1-24` (imports, props, state)
- Modify: `src/components/TaxEngine.tsx:129-138` (tab bar)
- Modify: `src/components/TaxEngine.tsx:341-349` (tab content + closing)

- [ ] **Step 1: Update imports, props interface, and state type**

In `src/components/TaxEngine.tsx`, replace:

```tsx
import React, { useState } from 'react';
import { TaxSettings, RevenueTransaction, PurchaseOrder, Employee } from '../types';
import { Percent, ShieldAlert, BookOpen, Calculator, DollarSign, Scale, ArrowRight, CheckCircle } from 'lucide-react';

interface TaxEngineProps {
  revenues: RevenueTransaction[];
  purchases: PurchaseOrder[];
  employees: Employee[];
  taxSettings: TaxSettings;
  currency: string;
  onUpdateTaxSettings: (settings: Partial<TaxSettings>) => void;
  language: 'FR' | 'EN' | 'AR';
}

export const TaxEngine: React.FC<TaxEngineProps> = ({
  revenues,
  purchases,
  employees,
  taxSettings,
  currency,
  onUpdateTaxSettings,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'regime' | 'amo'>('calculator');
```

with:

```tsx
import React, { useState } from 'react';
import { TaxSettings, RevenueTransaction, ExpenseTransaction, PurchaseOrder, Employee } from '../types';
import { Percent, ShieldAlert, BookOpen, Calculator, DollarSign, Scale, ArrowRight, CheckCircle, Receipt } from 'lucide-react';
import { TvaDeclaration } from './TvaDeclaration';

interface TaxEngineProps {
  revenues: RevenueTransaction[];
  expenses: ExpenseTransaction[];
  purchases: PurchaseOrder[];
  employees: Employee[];
  taxSettings: TaxSettings;
  currency: string;
  onUpdateTaxSettings: (settings: Partial<TaxSettings>) => void;
  language: 'FR' | 'EN' | 'AR';
}

export const TaxEngine: React.FC<TaxEngineProps> = ({
  revenues,
  expenses,
  purchases,
  employees,
  taxSettings,
  currency,
  onUpdateTaxSettings,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'regime' | 'amo' | 'tva'>('calculator');
```

- [ ] **Step 2: Add the tab button**

Replace:

```tsx
          <button
            onClick={() => setActiveTab('amo')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'amo' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Percent className="w-4 h-4" />
            {language === 'FR' ? 'Barème de Charges Sociales' : 'Social Allocations Table'}
          </button>
        </div>
```

with:

```tsx
          <button
            onClick={() => setActiveTab('amo')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-r-2 border-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'amo' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Percent className="w-4 h-4" />
            {language === 'FR' ? 'Barème de Charges Sociales' : 'Social Allocations Table'}
          </button>
          <button
            onClick={() => setActiveTab('tva')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tva' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            {language === 'FR' ? 'Déclaration TVA' : 'VAT Declaration'}
          </button>
        </div>
```

- [ ] **Step 3: Add the tab content block**

Replace the end of the file:

```tsx
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

with:

```tsx
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: TVA Declaration */}
        {activeTab === 'tva' && (
          <TvaDeclaration
            revenues={revenues}
            expenses={expenses}
            purchases={purchases}
            taxSettings={taxSettings}
            currency={currency}
            language={language}
          />
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Typecheck**

Run: `npm run lint`
Expected: fails with a prop-type error on the `<TaxEngine>` call site in `App.tsx` (missing required `expenses` prop) — this is expected until Task 4. No other errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/TaxEngine.tsx
git commit -m "feat: wire TVA declaration tab into Tax Engine"
```

---

### Task 4: Pass expenses into TaxEngine from App

**Files:**
- Modify: `src/App.tsx:1021-1029`

- [ ] **Step 1: Add the `expenses` prop**

In `src/App.tsx`, replace:

```tsx
              <TaxEngine 
                revenues={revenues}
                purchases={purchases}
                employees={employees}
                taxSettings={taxSettings}
                currency={currency}
                onUpdateTaxSettings={handleUpdateTaxSettings}
                language={language}
              />
```

with:

```tsx
              <TaxEngine 
                revenues={revenues}
                expenses={expenses}
                purchases={purchases}
                employees={employees}
                taxSettings={taxSettings}
                currency={currency}
                onUpdateTaxSettings={handleUpdateTaxSettings}
                language={language}
              />
```

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: PASS, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: pass expenses into Tax Engine for TVA declaration"
```

---

### Task 5: Manual verification

**Files:** none (browser check only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts at `http://localhost:3000` with no console errors.

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000`, go to the **Taxes** tab, click the new **Déclaration TVA** tab button and check:
- The period label shows the current month by default (e.g. "Août 2026" in FR).
- Clicking the Month/Quarter toggle switches the period and the numbers recompute.
- The prev/next arrows move the period label to the adjacent month/quarter and recompute the table.
- The breakdown table shows a "Ventes" collected row and one deductible row per expense category present in that period plus one "Achats Fournisseurs" row.
- Net VAT card shows "TVA Nette à Verser" in black when collected > deductible, or "Crédit de TVA Reportable" in green when negative.
- Switching the app language (FR/EN) updates all labels in this tab.

- [ ] **Step 3: Stop the dev server**

Confirm no leftover errors in the terminal, then stop the server (Ctrl+C or the tool's background-task stop).

---

## Self-Review Notes

- **Spec coverage:** period selector (Task 2), deductible whitelist (Task 1: `DEDUCTIBLE_EXPENSE_CATEGORIES`), single global rate from `taxSettings.tvaRate` (Task 1), net TVA not clamped to 0 / credit display (Task 2), new tab placement in TaxEngine (Task 3), FR/EN copy (Task 2) — all covered.
- **Type consistency:** `PeriodMode`, `PeriodRange`, `TvaDeclarationResult`, `TvaLineBreakdown` defined once in `tvaCalc.ts` and imported (not redefined) in `TvaDeclaration.tsx`. `expenses` prop name matches `App.tsx`'s `expenses` state variable throughout.
- **Out of scope confirmed:** no per-transaction VAT rate field, no encaissement/débit toggle, no export, no user-configurable category whitelist — none of the tasks above introduce them.

# TVA Declaration View — Design

## Problem

EasyHssab already computes a rough "TVA Nette à Verser" (net VAT due) on the Tax Engine page ([TaxEngine.tsx:34-37](../../../src/components/TaxEngine.tsx#L34-L37)), but it's an all-time running total buried in a KPI card, assumes a hardcoded 20% deductible rate on purchases, and ignores expenses (rent, electricity, etc.) that also carry deductible input VAT. The user wants a proper way to see total TVA payable computed from the data they actually enter, for a real declaration period.

## Goal

A dedicated "Déclaration TVA" tab in `TaxEngine.tsx` that computes collected vs deductible TVA for a selected period (month or quarter) from real `revenues`, `expenses`, and `purchases` data, and shows the net amount due (or credit carried forward).

## Data model

No schema changes. Uses existing `RevenueTransaction`, `ExpenseTransaction`, `PurchaseOrder`, and `TaxSettings.tvaRate` ([types.ts](../../../src/types.ts)).

- Single global rate: `taxSettings.tvaRate` applies to revenue, purchases, and eligible expenses alike (no per-transaction rate field).
- All entered amounts are treated as TVA-inclusive (TTC), consistent with the existing `collectedTVA` extraction formula.
- Basis: cash/encaissement — a transaction counts in whichever period its `date` falls in. No invoice/débit regime toggle.

## Deductible expense categories

`ExpenseTransaction.category` is one of `Rent | Purchases | Electricity | Water | Gaz | Internet | Marketing | Maintenance | Divers`.

Fixed whitelist (not user-configurable) counted as deductible input VAT, alongside 100% of `PurchaseOrder.totalAmount`:

```
Rent, Electricity, Water, Gaz, Internet, Marketing, Maintenance
```

Excluded:
- `Purchases` (expense category) — excluded to avoid double-counting with `PurchaseOrder` totals, which already represent stock/goods purchases.
- `Divers` — miscellaneous, not reliably deductible.

## Period selector

- Toggle: **Month** / **Quarter**.
- Prev/next navigation arrows to move between periods; default = current period (today's date).
- Quarter follows calendar quarters (Q1 Jan-Mar, etc.) — standard Moroccan TVA quarterly declaration grouping.
- Filtering: `date >= periodStart && date <= periodEnd` applied to `revenues`, `expenses`, `purchases`.

## Calculation

```
periodRevenue        = sum(revenues in period)
periodPurchases       = sum(purchases.totalAmount in period)
periodEligibleExpenses = sum(expenses in period where category in whitelist)

rate = taxSettings.tvaRate
collectedTVA  = periodRevenue * (rate / (1 + rate))
deductibleTVA = (periodPurchases + periodEligibleExpenses) * (rate / (1 + rate))
netTVA        = collectedTVA - deductibleTVA
```

`netTVA` is **not** clamped to 0. If negative, it represents a TVA credit ("crédit de TVA") carried forward to the next period per Moroccan rules — displayed distinctly (e.g. green "credit" banner) rather than as an amount due.

## Display

New tab, 4th button in the existing tab bar (`Calculator | Regime | AMO | TVA Declaration`), reusing the app's existing card/border style (`bg-white rounded-3xl border-2 border-[#1A1A1A]` etc.).

Contents:
1. Period selector (Month/Quarter toggle + prev/next).
2. Headline card: net TVA due, or "Crédit de TVA reportable" if negative.
3. Breakdown table:
   - Collected: total revenue (TTC), TVA extracted, transaction count.
   - Deductible: purchases (amount, TVA, count) + each eligible expense category (amount, TVA, count).
4. FR/EN copy following the existing `language` prop pattern used elsewhere in the component.

## Out of scope

- Per-transaction VAT rates or multi-rate support.
- Encaissement vs débit regime toggle.
- PDF/export of the declaration.
- User-configurable deductible category whitelist (fixed list for now).
- Any change to how revenue/expense/purchase forms capture data.

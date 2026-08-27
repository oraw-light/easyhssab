# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (tsx runs `server.ts`, which mounts Vite in middleware mode). App at http://localhost:3000.
- `npm run build` — Vite build (client) + esbuild bundle of `server.ts` to `dist/server.cjs`.
- `npm start` — run production build (`node dist/server.cjs`).
- `npm run lint` — typecheck only (`tsc --noEmit`); no ESLint config present.
- `npm run clean` — remove `dist` and `server.js`.
- No test runner is configured in this repo.

## Architecture

EasyHssab is a Moroccan SME accounting/finance SaaS demo (AI Studio project). It's a single-page React app served by a small Express server.

**Server (`server.ts`):** one Express app that (a) in dev, mounts Vite as middleware (SPA, HMR controlled by `DISABLE_HMR` env var — do not enable file watching changes there, it's deliberately disabled during agent edits to avoid flicker); (b) in prod, serves the built `dist` static assets with an SPA catch-all; (c) exposes a single API route, `POST /api/analyze`, which calls Gemini (`@google/genai`, model `gemini-3.5-flash`) with a hardcoded Moroccan-CPA system prompt plus the client's JSON finance snapshot, returning `{ analysis }`. Requires `GEMINI_API_KEY`.

**Client state model — important:** `src/App.tsx` is a single large component holding all app state (establishment, revenues, expenses, suppliers, purchases, employees, payroll, stock, tax settings). There is **no backend persistence wired up on the client** — every mutator (`handleAdd*`, `handleDelete*`, `persistState`) writes directly to `localStorage` under fixed keys (`saas_establishment`, `saas_revenues`, `saas_stock`, etc.) and there is no fetch/API call for CRUD. The `prisma/schema.prisma` (Postgres) models mirror this local state shape (Establishment, Revenue, Expense, Supplier, PurchaseOrder, Employee, Payroll, StockItem, StockLedger, TaxSettings, AuditLog) but Prisma is not currently connected to the running app — treat schema and client state as parallel/aspirational, not integrated, unless you're the one wiring it up.
- On first load with no `saas_establishment` in localStorage, the app auto-onboards using `generateSectorDemoData` (`src/utils/mockData.ts`) for a default sector/name.
- Switching sector (`handleInitializeSector`) fully regenerates and overwrites all demo data — it's a destructive reset, not a merge.
- All financial totals (revenue, TVA, IS/corporate tax, cash, margin) are derived inline in `App.tsx` from the in-memory arrays on every render, not stored.

**Sector system (`src/utils/sectorsConfig.ts`):** 20+ Moroccan business sectors (Cafe, Restaurant, Boulangerie, Pharmacie, SalonDeCoiffure, etc.), each with default revenue categories, suggested stock items, and an icon key resolved through the `iconMap` in `App.tsx` (lucide-react). Adding a sector means updating `SectorType` (`src/types.ts`), `SECTORS_LIST`/`getSectorById` (`sectorsConfig.ts`), and demo data generation (`mockData.ts`).

**Moroccan tax domain logic:** tax rates (TVA/VAT, IS corporate tax, IR income tax, Patente, beverage tax, CNSS, AMO) live in `TaxSettings` and are user-editable per establishment (`TaxEngine.tsx`). The Gemini system prompt in `server.ts` encodes Moroccan-specific tax/payroll domain rules (e.g., collected TVA is a liability, not revenue) — keep that framing in mind if extending the assistant feature.

**i18n:** three languages (FR/EN/AR) are handled via an inline `t` dictionary object per render in `App.tsx` (not `translations.ts`, which exists separately in `src/utils/` — check which one a component actually imports before adding a string). AR gets `dir="rtl"`. Language choice persists to `localStorage` under `saas_language`.

**Component split:** `App.tsx` owns all state and passes data + handler callbacks as props into feature components under `src/components/` (`EmployeeManager`, `SupplierManager`, `StockManager`, `TaxEngine`, `ReportCenter`, `SaaSAssistant`, `DbCenter`). None of these components manage their own persistence — they call back up to `App.tsx` handlers, which write to both React state and localStorage together.

**Path alias:** `@/*` resolves to the repo root (see `vite.config.ts`), not `src/`.

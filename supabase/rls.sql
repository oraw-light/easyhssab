-- Row Level Security policies for EasyHssab.
-- Run this once against the Supabase project's Postgres (SQL editor, or via
-- the execute_sql MCP tool) after `prisma db push` has created the tables.
--
-- Every establishment-scoped table is restricted to rows owned (directly or
-- transitively) by the requesting auth.uid(). Prisma's app-layer queries
-- already scope by establishmentId, but RLS is defense in depth: even a
-- direct Postgres connection or a bug in a query can't leak cross-tenant data.

alter table "Establishment" enable row level security;
alter table "Revenue" enable row level security;
alter table "Expense" enable row level security;
alter table "Supplier" enable row level security;
alter table "PurchaseOrder" enable row level security;
alter table "Employee" enable row level security;
alter table "Payroll" enable row level security;
alter table "StockItem" enable row level security;
alter table "StockLedger" enable row level security;
alter table "TaxSettings" enable row level security;
alter table "AuditLog" enable row level security;

create policy "own establishment" on "Establishment"
  for all using ("userId" = auth.uid()::text) with check ("userId" = auth.uid()::text);

create policy "own revenues" on "Revenue"
  for all using ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text))
  with check ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text));

create policy "own expenses" on "Expense"
  for all using ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text))
  with check ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text));

create policy "own suppliers" on "Supplier"
  for all using ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text))
  with check ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text));

create policy "own purchase orders" on "PurchaseOrder"
  for all using ("supplierId" in (
    select s.id from "Supplier" s join "Establishment" e on e.id = s."establishmentId" where e."userId" = auth.uid()::text
  ))
  with check ("supplierId" in (
    select s.id from "Supplier" s join "Establishment" e on e.id = s."establishmentId" where e."userId" = auth.uid()::text
  ));

create policy "own employees" on "Employee"
  for all using ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text))
  with check ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text));

create policy "own payroll" on "Payroll"
  for all using ("employeeId" in (
    select emp.id from "Employee" emp join "Establishment" e on e.id = emp."establishmentId" where e."userId" = auth.uid()::text
  ))
  with check ("employeeId" in (
    select emp.id from "Employee" emp join "Establishment" e on e.id = emp."establishmentId" where e."userId" = auth.uid()::text
  ));

create policy "own stock items" on "StockItem"
  for all using ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text))
  with check ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text));

create policy "own stock ledger" on "StockLedger"
  for all using ("itemId" in (
    select si.id from "StockItem" si join "Establishment" e on e.id = si."establishmentId" where e."userId" = auth.uid()::text
  ))
  with check ("itemId" in (
    select si.id from "StockItem" si join "Establishment" e on e.id = si."establishmentId" where e."userId" = auth.uid()::text
  ));

create policy "own tax settings" on "TaxSettings"
  for all using ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text))
  with check ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text));

create policy "own audit logs" on "AuditLog"
  for all using ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text))
  with check ("establishmentId" in (select id from "Establishment" where "userId" = auth.uid()::text));

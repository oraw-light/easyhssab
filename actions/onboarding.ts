'use server';

import { redirect } from 'next/navigation';
import { createAdminClient } from '../lib/supabase/admin';
import { createClient } from '../lib/supabase/server';
import { DEMO_USER_ID } from '../lib/demoUser';
import { generateSectorDemoData } from '../src/utils/mockData';
import type { SectorType } from '../src/types';

/**
 * (Re)initializes the signed-in user's establishment with sector demo data.
 * Mirrors the pre-migration handleInitializeSector: switching sector is a
 * destructive reset, not a merge — any existing establishment is replaced.
 */
export async function initializeSector(sector: SectorType, customName?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER_ID;

  const demo = generateSectorDemoData(sector, customName);
  const db = createAdminClient();

  const { data: existing } = await db.from('Establishment').select('id').eq('userId', userId).maybeSingle();
  if (existing) {
    await db.from('Establishment').delete().eq('id', existing.id); // cascades to all related rows
  }

  const { data: establishment, error } = await db.from('Establishment').insert({
    userId,
    name: demo.establishment.name,
    logo: demo.establishment.logo,
    address: demo.establishment.address,
    phone: demo.establishment.phone,
    ice: demo.establishment.ice,
    ifNum: demo.establishment.ifNum,
    patenteNum: demo.establishment.patenteNum,
    ville: demo.establishment.ville,
    commune: demo.establishment.commune,
    sector: demo.establishment.sector,
    currency: demo.establishment.currency,
  }).select().single();
  if (error || !establishment) throw new Error(error?.message ?? 'Failed to create establishment');

  await db.from('TaxSettings').insert({ establishmentId: establishment.id, ...demo.taxSettings });

  if (demo.revenues.length > 0) {
    await db.from('Revenue').insert(demo.revenues.map(r => ({
      establishmentId: establishment.id,
      date: r.date,
      category: r.category,
      amount: r.amount,
      paymentMethod: r.paymentMethod,
      description: r.description,
    })));
  }

  if (demo.expenses.length > 0) {
    await db.from('Expense').insert(demo.expenses.map(e => ({
      establishmentId: establishment.id,
      date: e.date,
      category: e.category,
      amount: e.amount,
      description: e.description,
      isRecurring: !!e.isRecurring,
    })));
  }

  // Client-side mock IDs don't survive into Postgres UUIDs — remap as we create.
  const supplierIdMap = new Map<string, string>();
  for (const s of demo.suppliers) {
    const { data: created } = await db.from('Supplier').insert({
      establishmentId: establishment.id, name: s.name, phone: s.phone, email: s.email, ice: s.ice, contactPerson: s.contactPerson,
    }).select().single();
    if (created) supplierIdMap.set(s.id, created.id);
  }

  if (demo.purchases.length > 0) {
    await db.from('PurchaseOrder').insert(demo.purchases.map(p => ({
      supplierId: supplierIdMap.get(p.supplierId)!,
      date: p.date,
      itemsDesc: p.itemsDescription,
      totalAmount: p.totalAmount,
      paidAmount: p.paidAmount,
      status: p.status,
    })));
  }

  const employeeIdMap = new Map<string, string>();
  for (const e of demo.employees) {
    const { data: created } = await db.from('Employee').insert({
      establishmentId: establishment.id,
      name: e.name,
      role: e.role,
      phone: e.phone,
      joinDate: e.joinDate,
      baseSalary: e.baseSalary,
      cnssRegistered: e.cnssRegistered,
      amoRegistered: e.amoRegistered,
      activeConges: e.activeConges,
    }).select().single();
    if (created) employeeIdMap.set(e.id, created.id);
  }

  if (demo.payrollList.length > 0) {
    await db.from('Payroll').insert(demo.payrollList.map(p => ({
      employeeId: employeeIdMap.get(p.employeeId)!,
      date: p.date,
      baseSalary: p.baseSalary,
      prime: p.prime,
      cnssDeduction: p.cnssDeduction,
      amoDeduction: p.amoDeduction,
      netPaid: p.netPaid,
      month: p.month,
    })));
  }

  const stockIdMap = new Map<string, string>();
  for (const item of demo.stockItems) {
    const { data: created } = await db.from('StockItem').insert({
      establishmentId: establishment.id,
      name: item.name,
      category: item.category,
      minStock: item.minStock,
      currentStock: item.currentStock,
      unit: item.unit,
      unitCost: item.unitCost,
    }).select().single();
    if (created) stockIdMap.set(item.id, created.id);
  }

  if (demo.stockLedger.length > 0) {
    await db.from('StockLedger').insert(demo.stockLedger.map(l => ({
      itemId: stockIdMap.get(l.itemId)!,
      date: l.date,
      type: l.type,
      quantity: l.quantity,
      notes: l.notes,
    })));
  }

  redirect('/dashboard');
}

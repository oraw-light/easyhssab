'use server';

import { redirect } from 'next/navigation';
import { db } from '../lib/db';
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

  await db.$transaction(async tx => {
    const existing = await tx.establishment.findUnique({ where: { userId } });
    if (existing) {
      await tx.establishment.delete({ where: { id: existing.id } }); // cascades to all related rows
    }

    const establishment = await tx.establishment.create({
      data: {
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
      },
    });

    await tx.taxSettings.create({ data: { establishmentId: establishment.id, ...demo.taxSettings } });

    await tx.revenue.createMany({
      data: demo.revenues.map(r => ({
        establishmentId: establishment.id,
        date: new Date(r.date),
        category: r.category,
        amount: r.amount,
        paymentMethod: r.paymentMethod,
        description: r.description,
      })),
    });

    await tx.expense.createMany({
      data: demo.expenses.map(e => ({
        establishmentId: establishment.id,
        date: new Date(e.date),
        category: e.category,
        amount: e.amount,
        description: e.description,
        isRecurring: !!e.isRecurring,
      })),
    });

    // Client-side mock IDs don't survive into Postgres UUIDs — remap as we create.
    const supplierIdMap = new Map<string, string>();
    for (const s of demo.suppliers) {
      const created = await tx.supplier.create({
        data: { establishmentId: establishment.id, name: s.name, phone: s.phone, email: s.email, ice: s.ice, contactPerson: s.contactPerson },
      });
      supplierIdMap.set(s.id, created.id);
    }

    await tx.purchaseOrder.createMany({
      data: demo.purchases.map(p => ({
        supplierId: supplierIdMap.get(p.supplierId)!,
        date: new Date(p.date),
        itemsDesc: p.itemsDescription,
        totalAmount: p.totalAmount,
        paidAmount: p.paidAmount,
        status: p.status,
      })),
    });

    const employeeIdMap = new Map<string, string>();
    for (const e of demo.employees) {
      const created = await tx.employee.create({
        data: {
          establishmentId: establishment.id,
          name: e.name,
          role: e.role,
          phone: e.phone,
          joinDate: new Date(e.joinDate),
          baseSalary: e.baseSalary,
          cnssRegistered: e.cnssRegistered,
          amoRegistered: e.amoRegistered,
          activeConges: e.activeConges,
        },
      });
      employeeIdMap.set(e.id, created.id);
    }

    await tx.payroll.createMany({
      data: demo.payrollList.map(p => ({
        employeeId: employeeIdMap.get(p.employeeId)!,
        date: new Date(p.date),
        baseSalary: p.baseSalary,
        prime: p.prime,
        cnssDeduction: p.cnssDeduction,
        amoDeduction: p.amoDeduction,
        netPaid: p.netPaid,
        month: p.month,
      })),
    });

    const stockIdMap = new Map<string, string>();
    for (const item of demo.stockItems) {
      const created = await tx.stockItem.create({
        data: {
          establishmentId: establishment.id,
          name: item.name,
          category: item.category,
          minStock: item.minStock,
          currentStock: item.currentStock,
          unit: item.unit,
          unitCost: item.unitCost,
        },
      });
      stockIdMap.set(item.id, created.id);
    }

    await tx.stockLedger.createMany({
      data: demo.stockLedger.map(l => ({
        itemId: stockIdMap.get(l.itemId)!,
        date: new Date(l.date),
        type: l.type,
        quantity: l.quantity,
        notes: l.notes,
      })),
    });
  });

  redirect('/dashboard');
}

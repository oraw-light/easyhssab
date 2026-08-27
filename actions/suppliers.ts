'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';
import type { PurchaseStatus } from '@prisma/client';

export async function addSupplier(formData: FormData) {
  const establishment = await requireEstablishment();

  await db.supplier.create({
    data: {
      establishmentId: establishment.id,
      name: String(formData.get('name')),
      phone: String(formData.get('phone') ?? ''),
      email: String(formData.get('email') ?? ''),
      ice: String(formData.get('ice') ?? ''),
      contactPerson: String(formData.get('contactPerson') ?? ''),
    },
  });

  revalidatePath('/suppliers');
}

export async function deleteSupplier(formData: FormData) {
  const establishment = await requireEstablishment();
  const id = String(formData.get('id'));

  await db.supplier.deleteMany({ where: { id, establishmentId: establishment.id } });

  revalidatePath('/suppliers');
}

export async function addPurchaseOrder(formData: FormData) {
  await requireEstablishment();

  await db.purchaseOrder.create({
    data: {
      supplierId: String(formData.get('supplierId')),
      date: new Date(String(formData.get('date'))),
      itemsDesc: String(formData.get('itemsDesc')),
      totalAmount: Number(formData.get('totalAmount')),
      paidAmount: Number(formData.get('paidAmount') ?? 0),
      status: String(formData.get('status')) as PurchaseStatus,
    },
  });

  revalidatePath('/suppliers');
}

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';

export async function addStockItem(formData: FormData) {
  const establishment = await requireEstablishment();

  await db.stockItem.create({
    data: {
      establishmentId: establishment.id,
      name: String(formData.get('name')),
      category: String(formData.get('category')),
      minStock: Number(formData.get('minStock')),
      currentStock: Number(formData.get('currentStock')),
      unit: String(formData.get('unit')),
      unitCost: Number(formData.get('unitCost')),
    },
  });

  revalidatePath('/stock');
}

export async function deleteStockItem(formData: FormData) {
  const establishment = await requireEstablishment();
  const id = String(formData.get('id'));

  await db.stockItem.deleteMany({ where: { id, establishmentId: establishment.id } });

  revalidatePath('/stock');
}

export async function adjustStock(formData: FormData) {
  await requireEstablishment();
  const itemId = String(formData.get('itemId'));
  const type = String(formData.get('type')) as 'IN' | 'OUT';
  const quantity = Number(formData.get('quantity'));
  const notes = String(formData.get('notes') ?? '');

  await db.$transaction([
    db.stockLedger.create({ data: { itemId, type, quantity, notes } }),
    db.stockItem.update({
      where: { id: itemId },
      data: { currentStock: { [type === 'IN' ? 'increment' : 'decrement']: quantity } },
    }),
  ]);

  revalidatePath('/stock');
}

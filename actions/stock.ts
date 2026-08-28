'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';

export async function addStockItem(formData: FormData) {
  const establishment = await requireEstablishment();

  await createAdminClient().from('StockItem').insert({
    establishmentId: establishment.id,
    name: String(formData.get('name')),
    category: String(formData.get('category')),
    minStock: Number(formData.get('minStock')),
    currentStock: Number(formData.get('currentStock')),
    unit: String(formData.get('unit')),
    unitCost: Number(formData.get('unitCost')),
  });

  revalidatePath('/stock');
}

export async function deleteStockItem(formData: FormData) {
  const establishment = await requireEstablishment();
  const id = String(formData.get('id'));

  await createAdminClient().from('StockItem').delete().eq('id', id).eq('establishmentId', establishment.id);

  revalidatePath('/stock');
}

export async function adjustStock(formData: FormData) {
  await requireEstablishment();
  const itemId = String(formData.get('itemId'));
  const type = String(formData.get('type')) as 'IN' | 'OUT';
  const quantity = Number(formData.get('quantity'));
  const notes = String(formData.get('notes') ?? '');

  const db = createAdminClient();
  const { data: item } = await db.from('StockItem').select('currentStock').eq('id', itemId).single();
  if (!item) throw new Error('Stock item not found');

  await db.from('StockLedger').insert({ itemId, type, quantity, notes });
  await db.from('StockItem').update({
    currentStock: item.currentStock + (type === 'IN' ? quantity : -quantity),
  }).eq('id', itemId);

  revalidatePath('/stock');
}

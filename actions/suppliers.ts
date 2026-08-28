'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';

type PurchaseStatus = 'Paid' | 'Partial' | 'Pending';

export async function addSupplier(formData: FormData) {
  const establishment = await requireEstablishment();

  await createAdminClient().from('Supplier').insert({
    establishmentId: establishment.id,
    name: String(formData.get('name')),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
    ice: String(formData.get('ice') ?? ''),
    contactPerson: String(formData.get('contactPerson') ?? ''),
  });

  revalidatePath('/suppliers');
}

export async function deleteSupplier(formData: FormData) {
  const establishment = await requireEstablishment();
  const id = String(formData.get('id'));

  await createAdminClient().from('Supplier').delete().eq('id', id).eq('establishmentId', establishment.id);

  revalidatePath('/suppliers');
}

export async function addPurchaseOrder(formData: FormData) {
  await requireEstablishment();

  await createAdminClient().from('PurchaseOrder').insert({
    supplierId: String(formData.get('supplierId')),
    date: String(formData.get('date')),
    itemsDesc: String(formData.get('itemsDesc')),
    totalAmount: Number(formData.get('totalAmount')),
    paidAmount: Number(formData.get('paidAmount') ?? 0),
    status: String(formData.get('status')) as PurchaseStatus,
  });

  revalidatePath('/suppliers');
}

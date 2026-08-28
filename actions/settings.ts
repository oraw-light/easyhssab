'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';

export async function updateEstablishment(formData: FormData) {
  const establishment = await requireEstablishment();

  await createAdminClient().from('Establishment').update({
    name: String(formData.get('name')),
    address: String(formData.get('address')),
    phone: String(formData.get('phone')),
    ice: String(formData.get('ice')),
    ifNum: String(formData.get('ifNum')),
    patenteNum: String(formData.get('patenteNum')),
    ville: String(formData.get('ville')),
    commune: String(formData.get('commune')),
    currency: String(formData.get('currency')),
  }).eq('id', establishment.id);

  revalidatePath('/settings');
  revalidatePath('/dashboard');
}

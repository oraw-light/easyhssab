'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';

export async function updateTaxSettings(formData: FormData) {
  const establishment = await requireEstablishment();

  await createAdminClient().from('TaxSettings').update({
    tvaRate: Number(formData.get('tvaRate')) / 100,
    isRate: Number(formData.get('isRate')) / 100,
    irRate: Number(formData.get('irRate')) / 100,
    patenteRate: Number(formData.get('patenteRate')) / 100,
    beverageTaxRate: Number(formData.get('beverageTaxRate')) / 100,
    cnssRate: Number(formData.get('cnssRate')) / 100,
    amoRate: Number(formData.get('amoRate')) / 100,
  }).eq('establishmentId', establishment.id);

  revalidatePath('/tax');
  revalidatePath('/dashboard');
}

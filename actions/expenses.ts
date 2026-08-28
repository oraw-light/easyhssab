'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';
import { parseCSV, csvRowsToObjects } from '@/lib/csv';

export async function addExpense(formData: FormData) {
  const establishment = await requireEstablishment();

  await createAdminClient().from('Expense').insert({
    establishmentId: establishment.id,
    date: String(formData.get('date')),
    category: String(formData.get('category')),
    amount: Number(formData.get('amount')),
    description: String(formData.get('description')),
    isRecurring: formData.get('isRecurring') === 'on',
  });

  revalidatePath('/expenses');
  revalidatePath('/dashboard');
}

export async function deleteExpense(formData: FormData) {
  const establishment = await requireEstablishment();
  const id = String(formData.get('id'));

  await createAdminClient().from('Expense').delete().eq('id', id).eq('establishmentId', establishment.id);

  revalidatePath('/expenses');
  revalidatePath('/dashboard');
}

/** Bulk-imports expense rows from a CSV file (columns: date, category, amount, description, isrecurring). Amounts are TTC. */
export async function bulkImportExpenses(formData: FormData): Promise<{ error?: string; imported?: number }> {
  const establishment = await requireEstablishment();
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { error: 'Aucun fichier fourni.' };

  const rows = csvRowsToObjects(parseCSV(await file.text()));
  const data = rows
    .filter(r => r.date && r.category && r.amount)
    .map(r => ({
      establishmentId: establishment.id,
      date: r.date,
      category: r.category,
      amount: Number(r.amount),
      description: r.description ?? '',
      isRecurring: ['true', '1', 'oui', 'yes'].includes((r.isrecurring ?? '').toLowerCase()),
    }))
    .filter(r => !isNaN(r.amount) && !isNaN(new Date(r.date).getTime()));

  if (data.length === 0) return { error: 'Aucune ligne valide trouvée dans le fichier CSV.' };

  await createAdminClient().from('Expense').insert(data);

  revalidatePath('/expenses');
  revalidatePath('/dashboard');
  return { imported: data.length };
}

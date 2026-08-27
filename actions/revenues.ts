'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';
import { parseCSV, csvRowsToObjects } from '@/lib/csv';
import type { PaymentMethod } from '@prisma/client';

const VALID_PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Mobile', 'Transfer'];

export async function addRevenue(formData: FormData) {
  const establishment = await requireEstablishment();

  await db.revenue.create({
    data: {
      establishmentId: establishment.id,
      date: new Date(String(formData.get('date'))),
      category: String(formData.get('category')),
      amount: Number(formData.get('amount')),
      paymentMethod: String(formData.get('paymentMethod')) as PaymentMethod,
      description: String(formData.get('description') ?? ''),
    },
  });

  revalidatePath('/revenues');
  revalidatePath('/dashboard');
}

export async function deleteRevenue(formData: FormData) {
  const establishment = await requireEstablishment();
  const id = String(formData.get('id'));

  await db.revenue.deleteMany({ where: { id, establishmentId: establishment.id } });

  revalidatePath('/revenues');
  revalidatePath('/dashboard');
}

/** Bulk-imports revenue rows from a CSV file (columns: date, category, amount, paymentmethod, description). Amounts are TTC. */
export async function bulkImportRevenues(formData: FormData): Promise<{ error?: string; imported?: number }> {
  const establishment = await requireEstablishment();
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { error: 'Aucun fichier fourni.' };

  const rows = csvRowsToObjects(parseCSV(await file.text()));
  const data = rows
    .filter(r => r.date && r.category && r.amount)
    .map(r => {
      const amount = Number(r.amount);
      const paymentMethod = VALID_PAYMENT_METHODS.includes(r.paymentmethod as PaymentMethod)
        ? (r.paymentmethod as PaymentMethod)
        : 'Cash';
      return {
        establishmentId: establishment.id,
        date: new Date(r.date),
        category: r.category,
        amount,
        paymentMethod,
        description: r.description ?? '',
      };
    })
    .filter(r => !isNaN(r.amount) && !isNaN(r.date.getTime()));

  if (data.length === 0) return { error: 'Aucune ligne valide trouvée dans le fichier CSV.' };

  await db.revenue.createMany({ data });

  revalidatePath('/revenues');
  revalidatePath('/dashboard');
  return { imported: data.length };
}

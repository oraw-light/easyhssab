'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';
import { calculatePayroll } from '@/lib/calculations';

export async function addEmployee(formData: FormData) {
  const establishment = await requireEstablishment();

  await createAdminClient().from('Employee').insert({
    establishmentId: establishment.id,
    name: String(formData.get('name')),
    role: String(formData.get('role')),
    phone: String(formData.get('phone') ?? ''),
    joinDate: String(formData.get('joinDate')),
    baseSalary: Number(formData.get('baseSalary')),
    cnssRegistered: formData.get('cnssRegistered') === 'on',
    amoRegistered: formData.get('amoRegistered') === 'on',
  });

  revalidatePath('/employees');
}

export async function deleteEmployee(formData: FormData) {
  const establishment = await requireEstablishment();
  const id = String(formData.get('id'));

  await createAdminClient().from('Employee').delete().eq('id', id).eq('establishmentId', establishment.id);

  revalidatePath('/employees');
}

export async function runPayroll(formData: FormData) {
  const establishment = await requireEstablishment();
  const employeeId = String(formData.get('employeeId'));
  const prime = Number(formData.get('prime') ?? 0);
  const month = new Date().toISOString().slice(0, 7);

  const db = createAdminClient();
  const [{ data: employee }, { data: taxSettings }] = await Promise.all([
    db.from('Employee').select('*').eq('id', employeeId).eq('establishmentId', establishment.id).single(),
    db.from('TaxSettings').select('*').eq('establishmentId', establishment.id).single(),
  ]);
  if (!employee || !taxSettings) throw new Error('Employee or tax settings not found');

  const { cnssDeduction, amoDeduction, netPaid } = calculatePayroll(
    { baseSalary: employee.baseSalary, prime, cnssRegistered: employee.cnssRegistered, amoRegistered: employee.amoRegistered },
    taxSettings,
  );

  await db.from('Payroll').insert({ employeeId, baseSalary: employee.baseSalary, prime, cnssDeduction, amoDeduction, netPaid, month });

  revalidatePath('/employees');
}

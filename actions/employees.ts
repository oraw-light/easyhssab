'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';
import { calculatePayroll } from '@/lib/calculations';

export async function addEmployee(formData: FormData) {
  const establishment = await requireEstablishment();

  await db.employee.create({
    data: {
      establishmentId: establishment.id,
      name: String(formData.get('name')),
      role: String(formData.get('role')),
      phone: String(formData.get('phone') ?? ''),
      joinDate: new Date(String(formData.get('joinDate'))),
      baseSalary: Number(formData.get('baseSalary')),
      cnssRegistered: formData.get('cnssRegistered') === 'on',
      amoRegistered: formData.get('amoRegistered') === 'on',
    },
  });

  revalidatePath('/employees');
}

export async function deleteEmployee(formData: FormData) {
  const establishment = await requireEstablishment();
  const id = String(formData.get('id'));

  await db.employee.deleteMany({ where: { id, establishmentId: establishment.id } });

  revalidatePath('/employees');
}

export async function runPayroll(formData: FormData) {
  const establishment = await requireEstablishment();
  const employeeId = String(formData.get('employeeId'));
  const prime = Number(formData.get('prime') ?? 0);
  const month = new Date().toISOString().slice(0, 7);

  const [employee, taxSettings] = await Promise.all([
    db.employee.findUniqueOrThrow({ where: { id: employeeId, establishmentId: establishment.id } }),
    db.taxSettings.findUniqueOrThrow({ where: { establishmentId: establishment.id } }),
  ]);

  const { cnssDeduction, amoDeduction, netPaid } = calculatePayroll(
    { baseSalary: employee.baseSalary, prime, cnssRegistered: employee.cnssRegistered, amoRegistered: employee.amoRegistered },
    taxSettings,
  );

  await db.payroll.create({
    data: { employeeId, baseSalary: employee.baseSalary, prime, cnssDeduction, amoDeduction, netPaid, month },
  });

  revalidatePath('/employees');
}

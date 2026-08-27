import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';
import { calculateFinancialSummary } from '@/lib/calculations';
import AssistantChat from './AssistantChat';

export default async function AssistantPage() {
  const establishment = await requireEstablishment();
  const [revenues, expenses, employees, taxSettings, stockItems] = await Promise.all([
    db.revenue.findMany({ where: { establishmentId: establishment.id }, select: { amount: true } }),
    db.expense.findMany({ where: { establishmentId: establishment.id }, select: { amount: true } }),
    db.employee.findMany({ where: { establishmentId: establishment.id } }),
    db.taxSettings.findUniqueOrThrow({ where: { establishmentId: establishment.id } }),
    db.stockItem.findMany({ where: { establishmentId: establishment.id } }),
  ]);

  const summary = calculateFinancialSummary({ revenues, expenses, employees, taxSettings });

  const financeData = {
    establishment: { name: establishment.name, sector: establishment.sector, currency: establishment.currency },
    summary,
    taxSettings,
    stockLowCount: stockItems.filter(i => i.currentStock <= i.minStock).length,
    employeeCount: employees.length,
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-black">Assistant IA</h2>
      <AssistantChat financeData={financeData} />
    </div>
  );
}

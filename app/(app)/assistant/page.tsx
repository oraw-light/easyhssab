import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';
import { calculateFinancialSummary } from '@/lib/calculations';
import AssistantChat from './AssistantChat';

export default async function AssistantPage() {
  const establishment = await requireEstablishment();
  const db = createAdminClient();
  const [{ data: revenues }, { data: expenses }, { data: employees }, { data: taxSettings }, { data: stockItems }] = await Promise.all([
    db.from('Revenue').select('amount').eq('establishmentId', establishment.id),
    db.from('Expense').select('amount').eq('establishmentId', establishment.id),
    db.from('Employee').select('*').eq('establishmentId', establishment.id),
    db.from('TaxSettings').select('*').eq('establishmentId', establishment.id).single(),
    db.from('StockItem').select('*').eq('establishmentId', establishment.id),
  ]);

  const summary = calculateFinancialSummary({ revenues: revenues ?? [], expenses: expenses ?? [], employees: employees ?? [], taxSettings: taxSettings! });

  const financeData = {
    establishment: { name: establishment.name, sector: establishment.sector, currency: establishment.currency },
    summary,
    taxSettings,
    stockLowCount: (stockItems ?? []).filter(i => i.currentStock <= i.minStock).length,
    employeeCount: (employees ?? []).length,
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-black">Assistant IA</h2>
      <AssistantChat financeData={financeData} />
    </div>
  );
}

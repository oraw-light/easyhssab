import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';
import { calculateFinancialSummary } from '@/lib/calculations';

export default async function ReportsPage() {
  const establishment = await requireEstablishment();
  const db = createAdminClient();
  const [{ data: revenues }, { data: expenses }, { data: employees }, { data: taxSettings }, { data: stockItems }, { count: suppliers }] = await Promise.all([
    db.from('Revenue').select('*').eq('establishmentId', establishment.id),
    db.from('Expense').select('*').eq('establishmentId', establishment.id),
    db.from('Employee').select('*').eq('establishmentId', establishment.id),
    db.from('TaxSettings').select('*').eq('establishmentId', establishment.id).single(),
    db.from('StockItem').select('*').eq('establishmentId', establishment.id),
    db.from('Supplier').select('*', { count: 'exact', head: true }).eq('establishmentId', establishment.id),
  ]);
  const currency = establishment.currency;

  const summary = calculateFinancialSummary({ revenues: revenues ?? [], expenses: expenses ?? [], employees: employees ?? [], taxSettings: taxSettings! });

  const revenueByCategory = (revenues ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + r.amount;
    return acc;
  }, {});
  const expenseByCategory = (expenses ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const stockValue = (stockItems ?? []).reduce((sum, i) => sum + i.currentStock * i.unitCost, 0);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-black">Rapports</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard label="Résultat Net" value={`${currency}${summary.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <ReportCard label="Marge Bénéficiaire" value={`${summary.profitMarginPct.toFixed(1)}%`} />
        <ReportCard label="Valeur du Stock" value={`${currency}${stockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <ReportCard label="Fournisseurs Actifs" value={String(suppliers ?? 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h4 className="text-sm font-black uppercase border-b border-gray-100 pb-3 mb-4">Revenus par Catégorie</h4>
          <div className="space-y-2.5">
            {Object.entries(revenueByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between text-xs font-bold">
                <span>{cat}</span>
                <span className="font-mono text-green-700">{currency}{amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
            {Object.keys(revenueByCategory).length === 0 && <p className="text-xs text-[#8C7B6E] font-bold">Aucune donnée.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h4 className="text-sm font-black uppercase border-b border-gray-100 pb-3 mb-4">Dépenses par Catégorie</h4>
          <div className="space-y-2.5">
            {Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between text-xs font-bold">
                <span>{cat}</span>
                <span className="font-mono text-red-600">{currency}{amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
            {Object.keys(expenseByCategory).length === 0 && <p className="text-xs text-[#8C7B6E] font-bold">Aucune donnée.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
      <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-serif font-black mt-1">{value}</h3>
    </div>
  );
}

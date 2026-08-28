import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';
import { updateTaxSettings } from '@/actions/tax';
import { calculateFinancialSummary, calculateNetVATPayable, calculatePatente, calculateBeverageTax, isCateringSector } from '@/lib/calculations';

const RATE_FIELDS = [
  { name: 'tvaRate', label: 'TVA (Taxe sur la Valeur Ajoutée)' },
  { name: 'isRate', label: 'IS (Impôt sur les Sociétés)' },
  { name: 'irRate', label: 'IR (Impôt sur le Revenu)' },
  { name: 'patenteRate', label: 'Taxe de Patente' },
  { name: 'beverageTaxRate', label: 'Taxe sur les Débits de Boissons' },
  { name: 'cnssRate', label: 'CNSS (part salariale)' },
  { name: 'amoRate', label: 'AMO (part salariale)' },
] as const;

export default async function TaxPage() {
  const establishment = await requireEstablishment();
  const db = createAdminClient();
  const [{ data: taxSettingsRow }, { data: revenues }, { data: expenses }, { data: employees }] = await Promise.all([
    db.from('TaxSettings').select('*').eq('establishmentId', establishment.id).single(),
    db.from('Revenue').select('amount').eq('establishmentId', establishment.id),
    db.from('Expense').select('amount').eq('establishmentId', establishment.id),
    db.from('Employee').select('*').eq('establishmentId', establishment.id),
  ]);
  const taxSettings = taxSettingsRow!;
  const currency = establishment.currency;

  const summary = calculateFinancialSummary({ revenues: revenues ?? [], expenses: expenses ?? [], employees: employees ?? [], taxSettings });

  const vat = calculateNetVATPayable({
    totalRevenueTTC: summary.totalRevenue,
    totalDeductibleCostsTTC: summary.totalExpenses,
    collectedRate: taxSettings.tvaRate,
  });
  const patente = calculatePatente(summary.totalRevenue, taxSettings.patenteRate);
  const beverageTax = calculateBeverageTax(summary.totalRevenue, taxSettings.beverageTaxRate, establishment.sector);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-black">Moteur Fiscal</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase">TVA nette due</p>
          <h3 className="text-2xl font-serif font-black mt-1">{currency}{vat.netVATPayable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase">IS (taux fixe)</p>
          <h3 className="text-2xl font-serif font-black mt-1">{currency}{summary.corporateTaxIS.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase">Taxe de Patente</p>
          <h3 className="text-2xl font-serif font-black mt-1">{currency}{patente.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase">Taxe Boissons {!isCateringSector(establishment.sector) && '(n/a)'}</p>
          <h3 className="text-2xl font-serif font-black mt-1">{currency}{beverageTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
        </div>
      </div>

      <form action={updateTaxSettings} className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-4">
        <h4 className="text-sm font-black uppercase border-b border-gray-100 pb-3">Taux fiscaux configurables</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RATE_FIELDS.map(f => (
            <label key={f.name} className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
              {f.label} (%)
              <input
                type="number"
                step="0.01"
                name={f.name}
                required
                defaultValue={(taxSettings[f.name] * 100).toFixed(2)}
                className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
        <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2.5 px-6 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition">
          Enregistrer les taux
        </button>
      </form>
    </div>
  );
}

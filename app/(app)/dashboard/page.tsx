import { TrendingUp, TrendingDown, DollarSign, Sparkles } from 'lucide-react';
import { createAdminClient } from '../../../lib/supabase/admin';
import { requireEstablishment } from '../../../lib/establishment';
import { calculateFinancialSummary } from '../../../lib/calculations';

export default async function DashboardPage() {
  const establishment = await requireEstablishment();
  const db = createAdminClient();

  const [{ data: revenues }, { data: expenses }, { data: employees }, { data: taxSettings }] = await Promise.all([
    db.from('Revenue').select('*').eq('establishmentId', establishment.id).order('date', { ascending: false }).limit(5),
    db.from('Expense').select('*').eq('establishmentId', establishment.id).order('date', { ascending: false }).limit(5),
    db.from('Employee').select('*').eq('establishmentId', establishment.id),
    db.from('TaxSettings').select('*').eq('establishmentId', establishment.id).single(),
  ]);

  // The dashboard's KPI totals are all-time, so they need the full revenue/expense sets, not just the recent-5 preview above.
  const [{ data: allRevenues }, { data: allExpenses }] = await Promise.all([
    db.from('Revenue').select('amount').eq('establishmentId', establishment.id),
    db.from('Expense').select('amount').eq('establishmentId', establishment.id),
  ]);

  const summary = calculateFinancialSummary({
    revenues: allRevenues ?? [],
    expenses: allExpenses ?? [],
    employees: employees ?? [],
    taxSettings: taxSettings!,
  });

  const currency = establishment.currency;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wider">Chiffre d&apos;Affaires (CA)</p>
              <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tight mt-1.5">
                {currency}{summary.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-[#8C7B6E] font-bold">
            TVA brute incluse: {currency}{summary.collectedTVA.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="bg-[#F3F1ED] p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wider">Charges d&apos;Exploitation</p>
              <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tight mt-1.5">
                {currency}{summary.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-800">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">
            Masse Sal : {currency}{summary.staffCosts.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(196,164,132,1)] flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-[#AFA9A0] uppercase tracking-widest">Taxes & TVA</p>
              <h3 className="text-3xl font-serif font-black text-[#C4A484] tracking-tight mt-1.5">
                {currency}{summary.corporateTaxIS.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFB74D] shadow-[0_0_8px_#FFB74D]" />
          </div>
          <div className="text-[10px] font-bold text-[#AFA9A0] uppercase">
            Calculé sur taux progressif de {(taxSettings!.isRate * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-[#C4A484] text-[#1A1A1A] p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-[#1A1A1A]/75 uppercase tracking-wider">Résultat Net Comptable</p>
              <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tight mt-1.5">
                {currency}{summary.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-2 bg-white text-[#1A1A1A] rounded-xl border border-[#1A1A1A]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] font-extrabold text-[#1A1A1A]/75 uppercase">
            Marge: {summary.profitMarginPct.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h4 className="text-sm font-black uppercase text-[#1A1A1A] border-b border-gray-100 pb-3 mb-4">Dernières Ventes Enregistrées</h4>
          <div className="space-y-3.5">
            {(revenues ?? []).map(rev => (
              <div key={rev.id} className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#1A1A1A]">{rev.category}</div>
                  <div className="text-[10px] text-[#8C7B6E] font-bold">{new Date(rev.date).toISOString().split('T')[0]} &bull; {rev.paymentMethod}</div>
                </div>
                <div className="font-mono font-black text-green-700">
                  +{currency}{rev.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h4 className="text-sm font-black uppercase text-[#1A1A1A] border-b border-gray-100 pb-3 mb-4">Charges d&apos;Exploitation Récentes</h4>
          <div className="space-y-3.5">
            {(expenses ?? []).map(exp => (
              <div key={exp.id} className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#1A1A1A]">{exp.description}</div>
                  <div className="text-[10px] text-[#8C7B6E] font-bold">{new Date(exp.date).toISOString().split('T')[0]} &bull; {exp.category}</div>
                </div>
                <div className="font-mono font-black text-red-600">
                  -{currency}{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(196,164,132,1)]">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-[#C4A484] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Optimisation Fiscale Recommandée par l&apos;Assistant IA
          </h4>
          <p className="text-xs text-[#AFA9A0] font-medium leading-relaxed max-w-2xl">
            En analysant votre activité ({establishment.sector}), vos charges de fonctionnement représentent des passifs admissibles. Utilisez l&apos;assistant IA pour modéliser des économies d&apos;IS sur votre prochain exercice fiscal au Maroc.
          </p>
        </div>
      </div>
    </div>
  );
}

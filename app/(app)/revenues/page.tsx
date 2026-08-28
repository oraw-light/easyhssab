import { Trash2 } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstablishment } from '@/lib/establishment';
import { addRevenue, deleteRevenue, bulkImportRevenues } from '@/actions/revenues';
import CsvImportForm from '../_components/CsvImportForm';

export default async function RevenuesPage() {
  const establishment = await requireEstablishment();
  const { data } = await createAdminClient()
    .from('Revenue')
    .select('*')
    .eq('establishmentId', establishment.id)
    .order('date', { ascending: false });
  const revenues = data ?? [];
  const currency = establishment.currency;
  const total = revenues.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-black">Revenus</h2>
        <div className="text-sm font-bold text-[#8C7B6E]">Total: {currency}{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      </div>

      <form action={addRevenue} className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Date
          <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Catégorie
          <input type="text" name="category" required placeholder="Ventes" className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Montant ({currency})
          <input type="number" step="0.01" name="amount" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Paiement
          <select name="paymentMethod" className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm">
            <option value="Cash">Espèces</option>
            <option value="Card">Carte</option>
            <option value="Mobile">Mobile</option>
            <option value="Transfer">Virement</option>
          </select>
        </label>
        <div className="col-span-full flex justify-end pt-2 border-t border-gray-100">
          <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2.5 px-6 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition">
            Ajouter
          </button>
        </div>
      </form>

      <CsvImportForm action={bulkImportRevenues} columns="date, category, amount, paymentmethod, description" />

      <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-x-auto">
        <table className="w-full min-w-[560px] text-xs">
          <thead className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-extrabold">
            <tr>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Catégorie</th>
              <th className="text-left p-4">Paiement</th>
              <th className="text-right p-4">Montant</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {revenues.map(r => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="p-4 font-bold">{new Date(r.date).toISOString().split('T')[0]}</td>
                <td className="p-4">{r.category}</td>
                <td className="p-4">{r.paymentMethod}</td>
                <td className="p-4 text-right font-mono font-black text-green-700">+{currency}{r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="p-4 text-right">
                  <form action={deleteRevenue}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-[#8C7B6E] hover:text-red-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {revenues.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-[#8C7B6E] font-bold">Aucun revenu enregistré.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

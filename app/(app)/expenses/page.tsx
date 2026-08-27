import { Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';
import { addExpense, deleteExpense, bulkImportExpenses } from '@/actions/expenses';
import CsvImportForm from '../_components/CsvImportForm';

export default async function ExpensesPage() {
  const establishment = await requireEstablishment();
  const expenses = await db.expense.findMany({
    where: { establishmentId: establishment.id },
    orderBy: { date: 'desc' },
  });
  const currency = establishment.currency;
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-black">Dépenses</h2>
        <div className="text-sm font-bold text-[#8C7B6E]">Total: {currency}{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      </div>

      <form action={addExpense} className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Date
          <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Catégorie
          <input type="text" name="category" required placeholder="Loyer" className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E] sm:col-span-2 lg:col-span-1">
          Description
          <input type="text" name="description" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Montant ({currency})
          <input type="number" step="0.01" name="amount" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <div className="col-span-full flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#8C7B6E]">
            <input type="checkbox" name="isRecurring" className="w-4 h-4" /> Récurrent
          </label>
          <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2.5 px-6 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition">
            Ajouter
          </button>
        </div>
      </form>

      <CsvImportForm action={bulkImportExpenses} columns="date, category, amount, description, isrecurring" />

      <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-x-auto">
        <table className="w-full min-w-[560px] text-xs">
          <thead className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-extrabold">
            <tr>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Catégorie</th>
              <th className="text-left p-4">Description</th>
              <th className="text-right p-4">Montant</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} className="border-t border-gray-100">
                <td className="p-4 font-bold">{e.date.toISOString().split('T')[0]}</td>
                <td className="p-4">{e.category}{e.isRecurring && <span className="ml-1.5 text-[9px] bg-[#C4A484] text-[#1A1A1A] px-1.5 py-0.5 rounded font-black">RÉCURRENT</span>}</td>
                <td className="p-4">{e.description}</td>
                <td className="p-4 text-right font-mono font-black text-red-600">-{currency}{e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="p-4 text-right">
                  <form action={deleteExpense}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="text-[#8C7B6E] hover:text-red-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-[#8C7B6E] font-bold">Aucune dépense enregistrée.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Trash2, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';
import { addStockItem, deleteStockItem, adjustStock } from '@/actions/stock';

export default async function StockPage() {
  const establishment = await requireEstablishment();
  const items = await db.stockItem.findMany({
    where: { establishmentId: establishment.id },
    orderBy: { name: 'asc' },
  });
  const currency = establishment.currency;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-black">Stocks</h2>

      <form action={addStockItem} className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Nom
          <input type="text" name="name" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Catégorie
          <input type="text" name="category" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Unité
          <input type="text" name="unit" required placeholder="kg / L / unité" className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Stock actuel
          <input type="number" step="0.01" name="currentStock" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Stock min.
          <input type="number" step="0.01" name="minStock" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Coût unitaire ({currency})
          <input type="number" step="0.01" name="unitCost" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2.5 px-4 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition lg:col-span-1">
          Ajouter
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => {
          const low = item.currentStock <= item.minStock;
          return (
            <div key={item.id} className={`bg-white p-5 rounded-3xl border-2 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-3 ${low ? 'border-red-500' : 'border-[#1A1A1A]'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-sm">{item.name}</div>
                  <div className="text-[10px] text-[#8C7B6E] font-bold uppercase">{item.category}</div>
                </div>
                <form action={deleteStockItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-[#8C7B6E] hover:text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-black">{item.currentStock}</span>
                <span className="text-xs font-bold text-[#8C7B6E]">{item.unit}</span>
                {low && <AlertTriangle className="w-4 h-4 text-red-500 ml-auto" />}
              </div>
              <div className="text-[10px] font-bold text-[#8C7B6E]">Min: {item.minStock} {item.unit} &bull; Coût: {currency}{item.unitCost}</div>
              <form action={adjustStock} className="flex gap-1.5">
                <input type="hidden" name="itemId" value={item.id} />
                <select name="type" className="border border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[10px] font-bold">
                  <option value="IN">Entrée</option>
                  <option value="OUT">Sortie</option>
                </select>
                <input type="number" step="0.01" name="quantity" required placeholder="Qté" className="border border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[10px] w-16" />
                <button type="submit" className="bg-[#F3F1ED] border border-[#1A1A1A] rounded-lg px-2.5 text-[10px] font-extrabold uppercase hover:bg-[#C4A484] transition">OK</button>
              </form>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full p-8 text-center text-[#8C7B6E] font-bold bg-white rounded-3xl border-2 border-[#1A1A1A]">Aucun article en stock.</div>
        )}
      </div>
    </div>
  );
}

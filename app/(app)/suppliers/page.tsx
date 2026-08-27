import { Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';
import { addSupplier, deleteSupplier, addPurchaseOrder } from '@/actions/suppliers';
import InvoiceButton from '../_components/InvoiceButton';

export default async function SuppliersPage() {
  const establishment = await requireEstablishment();
  const suppliers = await db.supplier.findMany({
    where: { establishmentId: establishment.id },
    include: { purchases: { orderBy: { date: 'desc' }, take: 3 } },
    orderBy: { name: 'asc' },
  });
  const currency = establishment.currency;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-black">Fournisseurs</h2>

      <form action={addSupplier} className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Nom
          <input type="text" name="name" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Téléphone
          <input type="text" name="phone" className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Email
          <input type="email" name="email" className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Contact
          <input type="text" name="contactPerson" className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <div className="col-span-full flex justify-end pt-2 border-t border-gray-100">
          <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2.5 px-6 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition">
            Ajouter
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-black text-sm">{sup.name}</div>
                <div className="text-[10px] text-[#8C7B6E] font-bold">{sup.phone} {sup.email && `• ${sup.email}`}</div>
              </div>
              <form action={deleteSupplier}>
                <input type="hidden" name="id" value={sup.id} />
                <button type="submit" className="text-[#8C7B6E] hover:text-red-600 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="space-y-1.5">
              {sup.purchases.map(p => (
                <div key={p.id} className="flex justify-between items-center gap-2 text-[10px] font-bold text-[#8C7B6E]">
                  <span className="truncate">{p.date.toISOString().split('T')[0]} &bull; {p.itemsDesc}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className={p.status === 'Paid' ? 'text-green-700' : p.status === 'Partial' ? 'text-amber-700' : 'text-red-600'}>
                      {currency}{p.totalAmount.toLocaleString()} ({p.status})
                    </span>
                    <InvoiceButton
                      order={{
                        id: p.id,
                        date: p.date.toISOString().split('T')[0],
                        itemsDesc: p.itemsDesc,
                        totalAmount: p.totalAmount,
                        paidAmount: p.paidAmount,
                      }}
                      supplier={{
                        name: sup.name,
                        phone: sup.phone,
                        email: sup.email,
                        ice: sup.ice,
                        contactPerson: sup.contactPerson,
                      }}
                      establishment={{
                        name: establishment.name,
                        address: establishment.address,
                        phone: establishment.phone,
                        ice: establishment.ice,
                        ifNum: establishment.ifNum,
                        patenteNum: establishment.patenteNum,
                        ville: establishment.ville,
                        commune: establishment.commune,
                      }}
                      currency={currency}
                    />
                  </span>
                </div>
              ))}
            </div>

            <form action={addPurchaseOrder} className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
              <input type="hidden" name="supplierId" value={sup.id} />
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="border border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[10px]" />
              <input type="text" name="itemsDesc" required placeholder="Articles" className="border border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[10px] flex-1 min-w-[80px]" />
              <input type="number" step="0.01" name="totalAmount" required placeholder="Total" className="border border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[10px] w-20" />
              <select name="status" className="border border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[10px]">
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
              <button type="submit" className="bg-[#F3F1ED] border border-[#1A1A1A] rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase hover:bg-[#C4A484] transition">Ajouter</button>
            </form>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full p-8 text-center text-[#8C7B6E] font-bold bg-white rounded-3xl border-2 border-[#1A1A1A]">Aucun fournisseur enregistré.</div>
        )}
      </div>
    </div>
  );
}

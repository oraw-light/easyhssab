'use client';

import { useState } from 'react';
import { FileText, Printer, X } from 'lucide-react';

type InvoiceOrder = {
  id: string;
  date: string;
  itemsDesc: string;
  totalAmount: number;
  paidAmount: number;
};

type InvoiceSupplier = {
  name: string;
  phone?: string | null;
  email?: string | null;
  ice?: string | null;
  contactPerson?: string | null;
};

type InvoiceEstablishment = {
  name: string;
  address: string;
  phone: string;
  ice: string;
  ifNum: string;
  patenteNum: string;
  ville: string;
  commune: string;
};

export default function InvoiceButton({
  order,
  supplier,
  establishment,
  currency,
}: {
  order: InvoiceOrder;
  supplier: InvoiceSupplier;
  establishment: InvoiceEstablishment;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const balanceDue = order.totalAmount - order.paidAmount;
  const invoiceNumber = `FA-${order.id.slice(-6).toUpperCase()}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 bg-[#F3F1ED] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/20 text-[#1A1A1A] text-[9px] font-black rounded-lg cursor-pointer transition uppercase"
      >
        <FileText className="w-3 h-3" />
        Facture
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:bg-white print:p-0">
          <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto print:rounded-none print:border-0 print:shadow-none print:max-h-none print:max-w-none">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#1A1A1A] print:hidden">
              <h3 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide">
                Aperçu de la Facture
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl border-2 border-[#1A1A1A] hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#1A1A1A]" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 print:p-0">
              <div className="flex items-start justify-between border-b-2 border-[#1A1A1A] pb-6">
                <div>
                  <h1 className="font-serif font-black text-xl text-[#1A1A1A]">{establishment.name}</h1>
                  <p className="text-xs text-gray-600 mt-1">{establishment.address}</p>
                  <p className="text-xs text-gray-600">{establishment.ville}{establishment.commune ? `, ${establishment.commune}` : ''}</p>
                  <p className="text-xs text-gray-600">{establishment.phone}</p>
                  <div className="mt-2 text-[10px] font-mono text-gray-500 space-y-0.5">
                    <p>ICE: {establishment.ice}</p>
                    <p>IF: {establishment.ifNum}</p>
                    <p>Patente: {establishment.patenteNum}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="font-serif font-black text-2xl text-[#C4A484] uppercase">Facture</h2>
                  <p className="text-xs font-mono font-bold text-gray-700 mt-1">{invoiceNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">Fournisseur</span>
                <p className="font-bold text-[#1A1A1A] mt-1">{supplier.name}</p>
                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                  {supplier.contactPerson && <p>{supplier.contactPerson}</p>}
                  <p>{supplier.phone} {supplier.phone && supplier.email && '•'} {supplier.email}</p>
                  {supplier.ice && <p className="font-mono text-gray-500">ICE: {supplier.ice}</p>}
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Désignation</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium text-gray-800">{order.itemsDesc}</td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-[#1A1A1A]">
                      {currency}{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total</span>
                    <span className="font-mono font-bold text-[#1A1A1A]">
                      {currency}{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Payé</span>
                    <span className="font-mono font-bold text-green-700">
                      {currency}{order.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t-2 border-[#1A1A1A] pt-2">
                    <span className="font-extrabold text-[#1A1A1A] uppercase">Solde Dû</span>
                    <span className="font-mono font-black text-amber-900">
                      {currency}{balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 text-center">
                <p className="text-[10px] text-gray-400">Document généré par EasyHssab</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

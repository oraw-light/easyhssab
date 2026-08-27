import React from 'react';
import { PurchaseOrder, Supplier, EstablishmentInfo } from '../types';
import { X, Printer } from 'lucide-react';

interface InvoiceModalProps {
  order: PurchaseOrder;
  supplier: Supplier | undefined;
  establishment: EstablishmentInfo;
  currency: string;
  language: 'FR' | 'EN' | 'AR';
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  supplier,
  establishment,
  currency,
  language,
  onClose
}) => {
  const balanceDue = order.totalAmount - order.paidAmount;
  const invoiceNumber = `FA-${order.id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto print:rounded-none print:border-0 print:shadow-none print:max-h-none print:max-w-none">
        {/* Toolbar - hidden on print */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#1A1A1A] print:hidden">
          <h3 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide">
            {language === 'FR' ? 'Aperçu de la Facture' : 'Invoice Preview'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {language === 'FR' ? 'Imprimer / PDF' : 'Print / Save PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border-2 border-[#1A1A1A] hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-4 h-4 text-[#1A1A1A]" />
            </button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="p-8 space-y-8 print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-[#1A1A1A] pb-6">
            <div>
              <h1 className="font-serif font-black text-xl text-[#1A1A1A]">{establishment.name}</h1>
              <p className="text-xs text-gray-600 mt-1">{establishment.address}</p>
              <p className="text-xs text-gray-600">{establishment.ville}{establishment.commune ? `, ${establishment.commune}` : ''}</p>
              <p className="text-xs text-gray-600">{establishment.phone}</p>
              <div className="mt-2 text-[10px] font-mono text-gray-500 space-y-0.5">
                <p>ICE: {establishment.ice}</p>
                <p>IF: {establishment.ifNum}</p>
                <p>{language === 'FR' ? 'Patente' : 'Business License'}: {establishment.patenteNum}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-serif font-black text-2xl text-[#C4A484] uppercase">
                {language === 'FR' ? 'Facture' : 'Invoice'}
              </h2>
              <p className="text-xs font-mono font-bold text-gray-700 mt-1">{invoiceNumber}</p>
              <p className="text-xs text-gray-500 mt-1">{order.date}</p>
            </div>
          </div>

          {/* Supplier (Bill from) */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">
              {language === 'FR' ? 'Fournisseur' : 'Supplier'}
            </span>
            <p className="font-bold text-[#1A1A1A] mt-1">{order.supplierName}</p>
            {supplier && (
              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                <p>{supplier.contactPerson}</p>
                <p>{supplier.phone} &bull; {supplier.email}</p>
                <p className="font-mono text-gray-500">ICE: {supplier.ice}</p>
              </div>
            )}
          </div>

          {/* Line items */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px]">
                <th className="py-3 px-4">{language === 'FR' ? 'Désignation' : 'Description'}</th>
                <th className="py-3 px-4 text-right">{language === 'FR' ? 'Montant' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 font-medium text-gray-800">{order.itemsDescription}</td>
                <td className="py-4 px-4 text-right font-mono font-bold text-[#1A1A1A]">
                  {currency}{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{language === 'FR' ? 'Total' : 'Total'}</span>
                <span className="font-mono font-bold text-[#1A1A1A]">
                  {currency}{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{language === 'FR' ? 'Payé' : 'Paid'}</span>
                <span className="font-mono font-bold text-green-700">
                  {currency}{order.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t-2 border-[#1A1A1A] pt-2">
                <span className="font-extrabold text-[#1A1A1A] uppercase">
                  {language === 'FR' ? 'Solde Dû' : 'Balance Due'}
                </span>
                <span className="font-mono font-black text-amber-900">
                  {currency}{balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-[10px] text-gray-400">
              {language === 'FR' ? 'Document généré par' : 'Document generated by'} EasyHssab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

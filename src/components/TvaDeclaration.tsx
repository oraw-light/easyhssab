import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { RevenueTransaction, ExpenseTransaction, PurchaseOrder, TaxSettings } from '../types';
import { computeTvaDeclaration, getPeriodRange, shiftAnchor, PeriodMode } from '../utils/tvaCalc';

interface TvaDeclarationProps {
  revenues: RevenueTransaction[];
  expenses: ExpenseTransaction[];
  purchases: PurchaseOrder[];
  taxSettings: TaxSettings;
  currency: string;
  language: 'FR' | 'EN' | 'AR';
}

const CATEGORY_LABELS: Record<string, { FR: string; EN: string }> = {
  sales: { FR: 'Ventes (CA)', EN: 'Sales' },
  purchases: { FR: 'Achats Fournisseurs', EN: 'Supplier Purchases' },
  Rent: { FR: 'Loyer', EN: 'Rent' },
  Electricity: { FR: 'Électricité', EN: 'Electricity' },
  Water: { FR: 'Eau', EN: 'Water' },
  Gaz: { FR: 'Gaz', EN: 'Gas' },
  Internet: { FR: 'Internet', EN: 'Internet' },
  Marketing: { FR: 'Marketing', EN: 'Marketing' },
  Maintenance: { FR: 'Maintenance', EN: 'Maintenance' },
};

export const TvaDeclaration: React.FC<TvaDeclarationProps> = ({
  revenues,
  expenses,
  purchases,
  taxSettings,
  currency,
  language
}) => {
  const [mode, setMode] = useState<PeriodMode>('month');
  const [anchor, setAnchor] = useState(new Date());

  const period = useMemo(() => getPeriodRange(mode, anchor, language), [mode, anchor, language]);
  const result = useMemo(
    () => computeTvaDeclaration(revenues, expenses, purchases, taxSettings.tvaRate, period),
    [revenues, expenses, purchases, taxSettings.tvaRate, period]
  );

  const labelFor = (key: string) => {
    const entry = CATEGORY_LABELS[key];
    if (!entry) return key;
    return language === 'FR' ? entry.FR : entry.EN;
  };

  const isCredit = result.netTVA < 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-serif font-black text-lg text-[#1A1A1A] flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-[#C4A484]" />
          {language === 'FR' ? 'Déclaration de TVA' : 'VAT Declaration'}
        </h4>

        <div className="flex items-center gap-2">
          <div className="flex border-2 border-[#1A1A1A] rounded-xl overflow-hidden">
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer ${
                mode === 'month' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'
              }`}
            >
              {language === 'FR' ? 'Mois' : 'Month'}
            </button>
            <button
              onClick={() => setMode('quarter')}
              className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer border-l-2 border-[#1A1A1A] ${
                mode === 'quarter' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'
              }`}
            >
              {language === 'FR' ? 'Trimestre' : 'Quarter'}
            </button>
          </div>

          <div className="flex items-center gap-1 border-2 border-[#1A1A1A] rounded-xl px-1.5 py-1">
            <button
              onClick={() => setAnchor(prev => shiftAnchor(mode, prev, -1))}
              className="p-1 cursor-pointer hover:bg-[#F3F1ED] rounded-lg"
              aria-label={language === 'FR' ? 'Période précédente' : 'Previous period'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-[#1A1A1A] min-w-[110px] text-center">
              {period.label}
            </span>
            <button
              onClick={() => setAnchor(prev => shiftAnchor(mode, prev, 1))}
              className="p-1 cursor-pointer hover:bg-[#F3F1ED] rounded-lg"
              aria-label={language === 'FR' ? 'Période suivante' : 'Next period'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`p-5 rounded-2xl border-2 border-[#1A1A1A] flex flex-col justify-between ${
          isCredit ? 'bg-green-50' : 'bg-[#1A1A1A] text-white'
        }`}
      >
        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isCredit ? 'text-green-700' : 'text-[#AFA9A0]'}`}>
          {isCredit
            ? (language === 'FR' ? 'Crédit de TVA Reportable' : 'VAT Credit Carried Forward')
            : (language === 'FR' ? 'TVA Nette à Verser' : 'Net VAT Payable')}
        </span>
        <h4 className={`text-3xl font-serif font-black mt-2 ${isCredit ? 'text-green-700' : 'text-[#C4A484]'}`}>
          {currency}{Math.abs(result.netTVA).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </h4>
        <span className={`text-[10px] font-bold mt-1 ${isCredit ? 'text-green-600' : 'text-[#AFA9A0]'}`}>
          {language === 'FR'
            ? `Collectée ${currency}${result.totalCollectedTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })} — Déductible ${currency}${result.totalDeductibleTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : `Collected ${currency}${result.totalCollectedTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })} — Deductible ${currency}${result.totalDeductibleTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold border-collapse">
          <thead>
            <tr className="bg-[#F3F1ED] text-[#8C7B6E] font-bold text-[10px] uppercase border-b border-[#1A1A1A]/10">
              <th className="py-2.5 px-4">{language === 'FR' ? 'Poste' : 'Line'}</th>
              <th className="py-2.5 px-4 text-right">{language === 'FR' ? 'Montant TTC' : 'Amount (incl. VAT)'}</th>
              <th className="py-2.5 px-4 text-right">{language === 'FR' ? 'TVA' : 'VAT'}</th>
              <th className="py-2.5 px-4 text-right">{language === 'FR' ? 'Opérations' : 'Transactions'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 bg-white">
              <td className="py-3 px-4 font-bold text-[#1A1A1A]">{labelFor('sales')} ({language === 'FR' ? 'collectée' : 'collected'})</td>
              <td className="py-3 px-4 text-right font-mono">{currency}{result.collected.amountTTC.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right font-mono text-green-700">+{currency}{result.collected.tva.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right font-mono text-[#8C7B6E]">{result.collected.count}</td>
            </tr>
            {result.deductibleLines.map(line => (
              <tr key={line.label} className="border-b border-gray-100">
                <td className="py-3 px-4 font-bold text-[#1A1A1A]">{labelFor(line.label)} ({language === 'FR' ? 'déductible' : 'deductible'})</td>
                <td className="py-3 px-4 text-right font-mono">{currency}{line.amountTTC.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right font-mono text-red-600">-{currency}{line.tva.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right font-mono text-[#8C7B6E]">{line.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

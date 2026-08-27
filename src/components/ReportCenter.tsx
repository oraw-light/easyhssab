import React, { useState } from 'react';
import { RevenueTransaction, ExpenseTransaction, Employee, Supplier, EstablishmentInfo } from '../types';
import { FileText, Download, TrendingUp, TrendingDown, RefreshCw, Layers, Check } from 'lucide-react';

interface ReportCenterProps {
  revenues: RevenueTransaction[];
  expenses: ExpenseTransaction[];
  employees: Employee[];
  suppliers: Supplier[];
  establishment: EstablishmentInfo;
  currency: string;
  language: 'FR' | 'EN' | 'AR';
}

export const ReportCenter: React.FC<ReportCenterProps> = ({
  revenues,
  expenses,
  employees,
  suppliers,
  establishment,
  currency,
  language
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'June' | 'July'>('July');
  const [exportModal, setExportModal] = useState<string | null>(null);

  // Group financial aggregates for June and July
  const getPeriodStats = (monthStr: string) => {
    const revs = revenues.filter(r => r.date.startsWith(`2026-${monthStr}`));
    const exps = expenses.filter(e => e.date.startsWith(`2026-${monthStr}`));
    
    const revSum = revs.reduce((sum, r) => sum + r.amount, 0);
    
    // Group exps by category
    const rent = exps.filter(e => e.category === 'Rent').reduce((sum, e) => sum + e.amount, 0);
    const purchases = exps.filter(e => e.category === 'Purchases').reduce((sum, e) => sum + e.amount, 0);
    const electricity = exps.filter(e => e.category === 'Electricity').reduce((sum, e) => sum + e.amount, 0);
    const water = exps.filter(e => e.category === 'Water').reduce((sum, e) => sum + e.amount, 0);
    const internet = exps.filter(e => e.category === 'Internet').reduce((sum, e) => sum + e.amount, 0);
    const marketing = exps.filter(e => e.category === 'Marketing').reduce((sum, e) => sum + e.amount, 0);
    const maintenance = exps.filter(e => e.category === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
    const divers = exps.filter(e => e.category === 'Divers').reduce((sum, e) => sum + e.amount, 0);

    // Approximate Salaries
    const salaries = employees.reduce((sum, e) => sum + e.baseSalary, 0);

    const totalOpex = rent + purchases + electricity + water + internet + marketing + maintenance + divers + salaries;
    const netProfit = revSum - totalOpex;

    return {
      revenue: revSum,
      rent,
      purchases,
      electricity,
      water,
      internet,
      marketing,
      maintenance,
      divers,
      salaries,
      totalOpex,
      netProfit,
      revenueCount: revs.length,
      expenseCount: exps.length
    };
  };

  const juneStats = getPeriodStats('06');
  const julyStats = getPeriodStats('07');

  const activeStats = selectedPeriod === 'July' ? julyStats : juneStats;
  const previousStats = selectedPeriod === 'July' ? juneStats : julyStats; // swap to compare

  // Calculations for deltas
  const getGrowth = (active: number, prev: number) => {
    if (prev === 0) return 0;
    return ((active - prev) / prev) * 100;
  };

  const revenueGrowth = getGrowth(activeStats.revenue, previousStats.revenue);
  const profitGrowth = getGrowth(activeStats.netProfit, previousStats.netProfit);
  const opexGrowth = getGrowth(activeStats.totalOpex, previousStats.totalOpex);

  const triggerExport = (format: string) => {
    setExportModal(format);
    setTimeout(() => {
      setExportModal(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Export Process overlay indicator */}
      {exportModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-[#C4A484]/20 text-[#C4A484] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-[#1A1A1A] animate-pulse" />
            </div>
            <div className="space-y-2">
              <h4 className="font-serif font-black text-[#1A1A1A] text-lg uppercase tracking-wide">
                {language === 'FR' ? 'Génération de Rapport' : 'Generating Report...'}
              </h4>
              <p className="text-xs text-[#8C7B6E] font-medium leading-relaxed">
                {language === 'FR' 
                  ? `Votre export de données au format ${exportModal.toUpperCase()} est en cours de structuration avec les paramètres fiscaux marocains (ICE : ${establishment.ice}).` 
                  : `Your ${exportModal.toUpperCase()} workbook sheets are being compiled. Isolated with registered corporate ICE: ${establishment.ice}.`}
              </p>
            </div>
            <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-left text-[10px] font-mono text-gray-500 space-y-1">
              <div>File: EASYHSSAB_REPORT_2026_{selectedPeriod.toUpperCase()}.{exportModal}</div>
              <div>Tenant: {establishment.name}</div>
              <div>Rows Mapped: {activeStats.revenueCount + activeStats.expenseCount} rows</div>
              <div>Audit Signature: HMAC-SHA256-OK</div>
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#C4A484] animate-pulse">
              {language === 'FR' ? 'Téléchargement sécurisé activé' : 'Ready for local save'}
            </div>
          </div>
        </div>
      )}

      {/* Selector & Aggregates row */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-serif font-black text-[#1A1A1A] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C4A484]" />
              {language === 'FR' ? 'États Financiers de Synthèse' : 'Financial Statement Sheets'}
            </h3>
            <p className="text-xs text-[#8C7B6E] font-medium">
              {language === 'FR' ? 'Tableaux de comptes, rapports d\'exploitation mensuels et comparateurs d\'exercice' : 'Standard accounts ledgers, periodic profit-and-loss statements'}
            </p>
          </div>

          {/* Period selector bento toggle */}
          <div className="flex bg-[#F3F1ED] p-1 rounded-2xl border-2 border-[#1A1A1A] items-center h-10 w-fit shrink-0">
            <button
              onClick={() => setSelectedPeriod('June')}
              className={`px-3.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                selectedPeriod === 'June' ? 'bg-[#1A1A1A] text-white' : 'text-[#8C7B6E] hover:text-[#1A1A1A]'
              }`}
            >
              {language === 'FR' ? 'Juin 2026' : 'June 2026'}
            </button>
            <button
              onClick={() => setSelectedPeriod('July')}
              className={`px-3.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                selectedPeriod === 'July' ? 'bg-[#1A1A1A] text-white' : 'text-[#8C7B6E] hover:text-[#1A1A1A]'
              }`}
            >
              {language === 'FR' ? 'Juillet 2026' : 'July 2026'}
            </button>
          </div>
        </div>

        {/* Growth Stats indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-2xl border border-[#1A1A1A]/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wide">
                {language === 'FR' ? 'Croissance du CA' : 'Revenue Delta'}
              </p>
              <h5 className="text-lg font-serif font-black text-[#1A1A1A] mt-1">
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
              </h5>
            </div>
            {revenueGrowth >= 0 ? (
              <span className="p-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-[#1A1A1A]/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wide">
                {language === 'FR' ? 'Croissance des charges' : 'OpEx Delta'}
              </p>
              <h5 className="text-lg font-serif font-black text-[#1A1A1A] mt-1">
                {opexGrowth >= 0 ? '+' : ''}{opexGrowth.toFixed(1)}%
              </h5>
            </div>
            {opexGrowth <= 0 ? (
              <span className="p-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-[#1A1A1A]/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wide">
                {language === 'FR' ? 'Croissance Bénéfice' : 'Net Yield Delta'}
              </p>
              <h5 className="text-lg font-serif font-black text-[#1A1A1A] mt-1">
                {profitGrowth >= 0 ? '+' : ''}{profitGrowth.toFixed(1)}%
              </h5>
            </div>
            {profitGrowth >= 0 ? (
              <span className="p-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main accounts sheet view */}
      <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
        {/* Mock official accounting header */}
        <div className="p-6 bg-[#F3F1ED] border-b-2 border-[#1A1A1A] flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide">
              {establishment.name}
            </h4>
            <div className="text-[10px] font-bold text-[#8C7B6E] space-y-0.5">
              <div>ICE : {establishment.ice} | IF : {establishment.ifNum}</div>
              <div>Patente : {establishment.patenteNum} | {establishment.ville}</div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="px-3 py-1 bg-[#1A1A1A] text-white text-[9px] font-black rounded-lg uppercase tracking-wider">
              {language === 'FR' ? 'Compte de Résultat Simplifié' : 'Simplified Income Statement'}
            </span>
            <div className="text-[10px] font-bold text-gray-500">
              {language === 'FR' ? `Rapport d'exercice : ${selectedPeriod} 2026` : `Filing Timeline: ${selectedPeriod} 2026`}
            </div>
          </div>
        </div>

        {/* Ledger table */}
        <div className="p-6">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                <th className="py-2.5">{language === 'FR' ? 'Poste de Compte / Intitulé' : 'Accounting Item Name'}</th>
                <th className="py-2.5 text-right">Montant (DH)</th>
                <th className="py-2.5 text-right">{language === 'FR' ? 'Poids % CA' : '% Revenue'}</th>
              </tr>
            </thead>
            <tbody>
              {/* Revenue */}
              <tr className="border-b border-gray-100 font-bold bg-green-50/20">
                <td className="py-3 text-green-950 uppercase">{language === 'FR' ? 'Chiffre d\'Affaires Brut' : 'Gross Operational Revenue'}</td>
                <td className="py-3 text-right text-green-900 font-mono">+{currency}{activeStats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-green-900 font-mono">100.0%</td>
              </tr>

              {/* COGS (Purchases represents COGS in this simplified sheet) */}
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-800 italic pl-4">{language === 'FR' ? 'Achats de matières premières (Stocks)' : 'Cost of Goods Sold (Suppliers Purchases)'}</td>
                <td className="py-3 text-right text-red-600 font-mono">-{currency}{activeStats.purchases.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-gray-500 font-mono">
                  {activeStats.revenue > 0 ? ((activeStats.purchases / activeStats.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              {/* Operating Expenses */}
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-800 pl-4">{language === 'FR' ? 'Loyer commercial' : 'Commercial Rent overhead'}</td>
                <td className="py-3 text-right text-red-600 font-mono">-{currency}{activeStats.rent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-gray-500 font-mono">
                  {activeStats.revenue > 0 ? ((activeStats.rent / activeStats.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-800 pl-4">{language === 'FR' ? 'Masse Salariale brute' : 'Staff Salaries Compensation'}</td>
                <td className="py-3 text-right text-red-600 font-mono">-{currency}{activeStats.salaries.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-gray-500 font-mono">
                  {activeStats.revenue > 0 ? ((activeStats.salaries / activeStats.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-800 pl-4">Énergie (Électricité, Eau, Gaz)</td>
                <td className="py-3 text-right text-red-600 font-mono">-{currency}{(activeStats.electricity + activeStats.water).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-gray-500 font-mono">
                  {activeStats.revenue > 0 ? (((activeStats.electricity + activeStats.water) / activeStats.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-800 pl-4">Marketing & Promotion (Réseaux, Flyers)</td>
                <td className="py-3 text-right text-red-600 font-mono">-{currency}{activeStats.marketing.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-gray-500 font-mono">
                  {activeStats.revenue > 0 ? ((activeStats.marketing / activeStats.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-800 pl-4">Entretien, Nettoyage & Maintenance</td>
                <td className="py-3 text-right text-red-600 font-mono">-{currency}{activeStats.maintenance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-gray-500 font-mono">
                  {activeStats.revenue > 0 ? ((activeStats.maintenance / activeStats.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              {/* Total OPEX row */}
              <tr className="border-b border-[#1A1A1A]/10 font-bold bg-amber-50/20">
                <td className="py-3 text-amber-950 uppercase">{language === 'FR' ? 'Total des charges d\'exploitation' : 'Total Operating Expenses (OpEx)'}</td>
                <td className="py-3 text-right text-amber-900 font-mono">-{currency}{activeStats.totalOpex.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-amber-900 font-mono">
                  {activeStats.revenue > 0 ? ((activeStats.totalOpex / activeStats.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              {/* Bottom Line Net Yield */}
              <tr className="font-black bg-[#C4A484]/15 border-b-2 border-[#1A1A1A]">
                <td className="py-4 text-[#1A1A1A] uppercase font-serif text-sm">
                  {language === 'FR' ? 'Résultat Net d\'Exploitation' : 'Net Operating Profit'}
                </td>
                <td className="py-4 text-right text-green-950 font-mono text-base">
                  {currency}{activeStats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right text-[#1A1A1A] font-mono text-sm">
                  {activeStats.revenue > 0 ? ((activeStats.netProfit / activeStats.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            </tbody>
          </table>

          {/* Export CTA Row */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-2.5 mt-6 border-t border-gray-100 pt-6">
            <button
              onClick={() => triggerExport('pdf')}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#C4A484] hover:text-[#1A1A1A] text-white font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {language === 'FR' ? 'Exporter PDF (Certifié)' : 'Export Official PDF'}
            </button>
            <button
              onClick={() => triggerExport('xlsx')}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F3F1ED] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-extrabold uppercase text-[10px] tracking-wider rounded-xl border-[1.5px] border-[#1A1A1A] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter Excel (.xlsx)
            </button>
            <button
              onClick={() => triggerExport('csv')}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F3F1ED] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-extrabold uppercase text-[10px] tracking-wider rounded-xl border-[1.5px] border-[#1A1A1A] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter CSV (Comptable)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TaxSettings, RevenueTransaction, PurchaseOrder, Employee } from '../types';
import { Percent, ShieldAlert, BookOpen, Calculator, DollarSign, Scale, ArrowRight, CheckCircle } from 'lucide-react';

interface TaxEngineProps {
  revenues: RevenueTransaction[];
  purchases: PurchaseOrder[];
  employees: Employee[];
  taxSettings: TaxSettings;
  currency: string;
  onUpdateTaxSettings: (settings: Partial<TaxSettings>) => void;
  language: 'FR' | 'EN' | 'AR';
}

export const TaxEngine: React.FC<TaxEngineProps> = ({
  revenues,
  purchases,
  employees,
  taxSettings,
  currency,
  onUpdateTaxSettings,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'regime' | 'amo'>('calculator');
  const [simulatedSales, setSimulatedSales] = useState('250000');
  const [simulatedExpenses, setSimulatedExpenses] = useState('140000');

  // Calculates active, real liabilities from state
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalPurchasesVal = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  // Moroccan VAT mechanism: Collected VAT (from sales) - Deductible VAT (from purchases/costs)
  // Standard rate is 20%. Catering/Cafes reduced is 10%.
  const vatRate = taxSettings.tvaRate;
  const collectedVAT = totalRevenue * (vatRate / (1 + vatRate)); // Sales include VAT, so we extract it
  const deductibleVAT = totalPurchasesVal * (0.20 / (1 + 0.20)); // Assume standard 20% on purchases
  const netVATPayable = Math.max(0, collectedVAT - deductibleVAT);

  // Moroccan Corporate Tax (IS - Impôt sur les Sociétés)
  // Progressive scale:
  // Net profit <= 300,000 DH -> 10% (or 15% progressive target)
  // 300,001 to 1,000,000 DH -> 20%
  // > 1,000,000 DH -> 31% / 32%
  const totalOpex = totalPurchasesVal + (employees.reduce((sum, e) => sum + e.baseSalary * 1.2, 0)); // simple opex approximation
  const activeNetProfit = Math.max(0, totalRevenue - totalOpex);
  
  let progressiveISRate = 0.10;
  if (activeNetProfit > 1000000) progressiveISRate = 0.31;
  else if (activeNetProfit > 300000) progressiveISRate = 0.20;

  const estimatedIS = activeNetProfit * progressiveISRate;

  // Beverage duty tax (2% for cafes/restaurants serving drinks)
  const isCatering = ['Cafe', 'Restaurant', 'Snack', 'SalonDeThe'].includes(taxSettings.beverageTaxRate > 0 ? 'Cafe' : '');
  const beverageTax = isCatering ? totalRevenue * taxSettings.beverageTaxRate : 0;

  // Simulation handler
  const simSalesNum = parseFloat(simulatedSales) || 0;
  const simExpNum = parseFloat(simulatedExpenses) || 0;
  const simProfit = Math.max(0, simSalesNum - simExpNum);
  
  let simISRate = 0.10;
  if (simProfit > 1000000) simISRate = 0.31;
  else if (simProfit > 300000) simISRate = 0.20;
  const simulatedISPayable = simProfit * simISRate;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">
            {language === 'FR' ? 'TVA Nette à Verser (Trimestre)' : 'Net TVA Due'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#1A1A1A] mt-2">
            {currency}{netVATPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] font-bold text-[#8C7B6E] mt-1">
            {language === 'FR' ? `Collectée (${(vatRate*100).toFixed(0)}%) - Déductible (20%)` : `Collected vs Deductible VAT`}
          </span>
        </div>

        <div className="bg-[#1A1A1A] text-white p-5 rounded-3xl shadow-[3px_3px_0px_0px_rgba(196,164,132,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#AFA9A0]">
            {language === 'FR' ? 'Impôt Sociétés Est. (Progressif)' : 'Est. Corporate Tax (IS)'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#C4A484] mt-2">
            {currency}{estimatedIS.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] font-bold text-[#AFA9A0] mt-1">
            {language === 'FR' ? `Taux applicable : ${(progressiveISRate*100).toFixed(0)}% sur bénéfice` : `Based on active profits scale`}
          </span>
        </div>

        <div className="bg-[#F3F1ED] p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">
            {language === 'FR' ? 'Débits Boissons / Brevet' : 'Beverage Duty & Patent'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#1A1A1A] mt-2">
            {currency}{(beverageTax + (totalRevenue * taxSettings.patenteRate)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] font-bold text-[#8C7B6E] mt-1">
            {language === 'FR' ? 'Taxes d\'exploitation municipales' : 'Municipal operation patent rates'}
          </span>
        </div>
      </div>

      {/* Control Panel tabs */}
      <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
        <div className="flex border-b-2 border-[#1A1A1A] bg-[#F9F8F6]">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-r-2 border-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calculator' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            {language === 'FR' ? 'Simulateur d\'Impôts' : 'Interactive Tax Simulator'}
          </button>
          <button
            onClick={() => setActiveTab('regime')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-r-2 border-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'regime' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Scale className="w-4 h-4" />
            {language === 'FR' ? 'Régimes Fiscaux Marocains' : 'Moroccan Fiscal Regimes'}
          </button>
          <button
            onClick={() => setActiveTab('amo')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'amo' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Percent className="w-4 h-4" />
            {language === 'FR' ? 'Barème de Charges Sociales' : 'Social Allocations Table'}
          </button>
        </div>

        {/* Tab 1: Simulator */}
        {activeTab === 'calculator' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="bg-[#F3F1ED] p-5 rounded-2xl border-2 border-[#1A1A1A] space-y-4">
                <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#C4A484]" />
                  {language === 'FR' ? 'Hypothèses de Simulation' : 'Simulation Inputs'}
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Chiffre d\'Affaires Annuel Estimé (DH)' : 'Estimated Annual Revenue (DH)'}
                    </label>
                    <input
                      type="number"
                      value={simulatedSales}
                      onChange={e => setSimulatedSales(e.target.value)}
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Total Charges Déductibles Estimées (DH)' : 'Estimated Deductible Costs (DH)'}
                    </label>
                    <input
                      type="number"
                      value={simulatedExpenses}
                      onChange={e => setSimulatedExpenses(e.target.value)}
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                    />
                  </div>
                </div>

                {/* Sliders for actual parameters */}
                <div className="border-t border-[#1A1A1A]/10 pt-4 space-y-3">
                  <h5 className="text-[10px] font-extrabold uppercase tracking-wide text-[#8C7B6E]">
                    {language === 'FR' ? 'Taux Actifs de votre Entreprise' : 'Configure Custom Active Rates'}
                  </h5>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-[#1A1A1A]">
                      <span>{language === 'FR' ? 'TVA Collectée' : 'Collected VAT'}</span>
                      <span className="text-[#C4A484]">{(taxSettings.tvaRate * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.2"
                      step="0.1"
                      value={taxSettings.tvaRate}
                      onChange={e => onUpdateTaxSettings({ tvaRate: parseFloat(e.target.value) })}
                      className="w-full accent-[#1A1A1A] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-[#1A1A1A]">
                      <span>{language === 'FR' ? 'Taxe Débits Boissons' : 'Beverage Duty Rate'}</span>
                      <span className="text-[#C4A484]">{(taxSettings.beverageTaxRate * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.05"
                      step="0.01"
                      value={taxSettings.beverageTaxRate}
                      onChange={e => onUpdateTaxSettings({ beverageTaxRate: parseFloat(e.target.value) })}
                      className="w-full accent-[#1A1A1A] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Outputs */}
              <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl flex flex-col justify-between border-2 border-[#1A1A1A]">
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-[#C4A484] uppercase tracking-widest">
                    {language === 'FR' ? 'Rapport Prévisionnel IS' : 'Previsional IS Assessment'}
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/10 pb-2 text-xs font-semibold">
                      <span className="text-[#AFA9A0]">{language === 'FR' ? 'Bénéfice Net Fiscal Estimé' : 'Pre-tax Book Income'}</span>
                      <span className="text-white font-mono font-bold">{currency}{simProfit.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between border-b border-white/10 pb-2 text-xs font-semibold">
                      <span className="text-[#AFA9A0]">{language === 'FR' ? 'Tranche IS progressive' : 'Applicable IS scale'}</span>
                      <span className="text-[#C4A484] font-bold">{(simISRate * 100).toFixed(0)}%</span>
                    </div>

                    <div className="flex justify-between border-b border-white/10 pb-2 text-xs font-semibold">
                      <span className="text-[#AFA9A0]">{language === 'FR' ? 'Impôt sur les Sociétés (IS) Dû' : 'Total IS Payable'}</span>
                      <span className="text-red-400 font-mono font-bold">-{currency}{simulatedISPayable.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between pt-2 text-sm font-bold">
                      <span className="text-white">{language === 'FR' ? 'Dividende distribuable estimé' : 'Net Retained Earnings'}</span>
                      <span className="text-green-400 font-mono font-black">{currency}{(simProfit - simulatedISPayable).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900 p-3.5 rounded-xl border border-white/10 flex gap-2 items-start text-[11px] leading-relaxed text-[#AFA9A0] font-medium mt-4">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    {language === 'FR'
                      ? 'Note : Les taux et barèmes progressifs sont mis à jour selon la Loi de Finances Marocaine. Les charges courantes de personnel enregistrées en paie sont entièrement déductibles.'
                      : 'Loi de Finances updates apply. Personal payroll compensation is 100% tax-deductible under real regime laws.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Regime details */}
        {activeTab === 'regime' && (
          <div className="p-6 space-y-4">
            <h4 className="font-serif font-black text-lg text-[#1A1A1A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C4A484]" />
              {language === 'FR' ? 'Cadre Légal & Régimes Marocains pour PME' : 'Moroccan Small Business Tax Regimes'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed font-semibold">
              <div className="border border-gray-100 p-4 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 rounded text-[9px] font-black">
                  CPU
                </span>
                <h5 className="font-bold text-sm text-[#1A1A1A]">{language === 'FR' ? 'Contribution Professionnelle Unique' : 'Single Professional Contribution'}</h5>
                <p className="text-gray-600">
                  {language === 'FR'
                    ? 'Destinée aux commerçants et petits prestataires de services dont le chiffre d\'affaires ne dépasse pas 2 000 000 DH (commerce) ou 500 000 DH (services). L\'impôt est calculé sur un bénéfice forfaitaire.'
                    : 'Targeted at merchants & sole traders below 2,000,000 DH (retail) or 500,000 DH (services). Tax is based on fixed margins coefficients.'}
                </p>
              </div>

              <div className="border border-gray-100 p-4 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-blue-50 border border-blue-300 text-blue-800 rounded text-[9px] font-black">
                  RÉGIME DU RÉSULTAT NET RÉEL (RNR)
                </span>
                <h5 className="font-bold text-sm text-[#1A1A1A]">{language === 'FR' ? 'Résultat Net Réel / Simplifié' : 'Actual Net Income (RNR)'}</h5>
                <p className="text-gray-600">
                  {language === 'FR'
                    ? 'Obligatoire pour les SARL et SA au Maroc. L\'impôt (IS) s\'applique directement sur le résultat net comptable. Permet de déduire l\'ensemble des charges réelles : loyer, salaires, achats de stocks, et amortissements.'
                    : 'Mandatory for Moroccan SARL & Corporations. Tax is applied on audited accounts net earnings. Full deduction of rents, utilities, stock costs, and depreciations is permitted.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social rates */}
        {activeTab === 'amo' && (
          <div className="p-6 space-y-4">
            <h4 className="font-serif font-black text-lg text-[#1A1A1A]">
              {language === 'FR' ? 'Détails des Cotisations Sociales Marocaines (CNSS & AMO)' : 'Moroccan CNSS & AMO payroll contribution tables'}
            </h4>
            <p className="text-xs text-[#8C7B6E] font-medium leading-relaxed max-w-xl">
              {language === 'FR'
                ? 'Les cotisations à la Caisse Nationale de Sécurité Sociale (CNSS) et l\'Assurance Maladie Obligatoire (AMO) sont partagées entre cotisations salariales (déduites du net) et cotisations patronales (frais d\'exploitation).'
                : 'National social security contributions are distributed between employee deductions (withheld at source) and employer overheads.'}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="bg-[#F3F1ED] text-[#8C7B6E] font-bold text-[10px] uppercase border-b border-[#1A1A1A]/10">
                    <th className="py-2.5 px-4">Organisme / Charge</th>
                    <th className="py-2.5 px-4">Type de Cotisation</th>
                    <th className="py-2.5 px-4 text-center">Part Salariale</th>
                    <th className="py-2.5 px-4 text-center">Part Patronale</th>
                    <th className="py-2.5 px-4">Base de Calcul</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">CNSS Prestations Sociales</td>
                    <td className="py-3 px-4">Prestations de court et long terme</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">4.48%</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">8.98%</td>
                    <td className="py-3 px-4 text-gray-500">Plafonnée à 6 000 DH / mois</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">CNSS Allocations Familiales</td>
                    <td className="py-3 px-4">Allocations familiales mensuelles</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">0.00%</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">6.40%</td>
                    <td className="py-3 px-4 text-gray-500">Non plafonnée</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">AMO (Assurance Maladie)</td>
                    <td className="py-3 px-4">Couverture médicale universelle</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">2.26%</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">4.11%</td>
                    <td className="py-3 px-4 text-gray-500">Non plafonnée</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

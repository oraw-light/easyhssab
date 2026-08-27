import React, { useState } from 'react';
import { Sparkles, Bot, Send, Trash2, HelpCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { FullSaaSSnapshot } from '../types';

interface SaaSAssistantProps {
  snapshot: FullSaaSSnapshot;
  currency: string;
  language: 'FR' | 'EN' | 'AR';
}

export const SaaSAssistant: React.FC<SaaSAssistantProps> = ({
  snapshot,
  currency,
  language
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAskAI = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          financeData: {
            establishment: snapshot.establishment,
            taxSettings: snapshot.taxSettings,
            totals: {
              revenue: snapshot.revenues.reduce((sum, r) => sum + r.amount, 0),
              opex: snapshot.expenses.reduce((sum, e) => sum + e.amount, 0),
              payroll: snapshot.employees.reduce((sum, e) => sum + e.baseSalary, 0),
              stockValuation: snapshot.stockItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
              outstandingDebts: snapshot.suppliers.reduce((sum, s) => sum + s.amountDue, 0)
            },
            recentRevenues: snapshot.revenues.slice(0, 10),
            recentExpenses: snapshot.expenses.slice(0, 10),
            employees: snapshot.employees.map(e => ({ name: e.name, role: e.role, salary: e.baseSalary }))
          }
        }),
      });

      if (!response.ok) {
        throw new Error('CPA Engine is currently busy or offline. Please configure your API credentials.');
      }

      const data = await response.json();
      setResponse(data.analysis);
    } catch (err: any) {
      setResponse(`[CPA AUDIT OFFLINE]: ${err.message}. S\'il vous plaît assurez-vous que la clé d'API GEMINI_API_KEY est bien configurée dans vos paramètres.`);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      titleFR: '🔍 Diagnostic de Rentabilité',
      titleEN: '🔍 Profitability Diagnostic',
      promptFR: 'Faites un audit complet de ma rentabilité. Quels sont mes plus grands centres de coûts et comment puis-je les réduire de 15% ?',
      promptEN: 'Run a profitability audit. What are my biggest cost categories and how can I slash them by 15%?'
    },
    {
      titleFR: '📊 Optimisation Fiscale Marocaine',
      titleEN: '📊 Moroccan Tax Optimization',
      promptFR: 'Analysez mon statut fiscal par rapport à mon chiffre d\'affaires actuel. Quelles dépenses professionnelles courantes puis-je amortir pour réduire mon impôt (IS) ?',
      promptEN: 'Analyze my tax status relative to my sales. Which commercial expenses can I deduct to reduce corporate income tax (IS)?'
    },
    {
      titleFR: '🌾 Analyse de Stock et Pertes',
      titleEN: '🌾 Stock & Cost-of-Goods Audit',
      promptFR: 'Analysez la valorisation de mon stock et mes dépenses de matières premières. Comment puis-je optimiser mes achats auprès de mes fournisseurs ?',
      promptEN: 'Audit my inventory valuation & supplier purchases. How can I optimize material costs and improve trade margins?'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="bg-[#1A1A1A] text-white p-6 md:p-8 rounded-3xl shadow-[4px_4px_0px_0px_rgba(196,164,132,1)] relative overflow-hidden border-2 border-[#1A1A1A]">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-6 translate-x-6">
          <Bot className="w-64 h-64" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#C4A484]/20 border border-[#C4A484]/35 text-[#C4A484] rounded-2xl">
              <Bot className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[10px] bg-[#C4A484] text-[#1A1A1A] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                Auditeur IA Expert
              </span>
              <h3 className="text-xl font-serif font-black tracking-wide text-white mt-1">
                {language === 'FR' ? 'Conseiller Comptable & Financier Virtuel' : 'CPA Virtual Financial Co-Pilot'}
              </h3>
            </div>
          </div>
          <p className="text-xs text-[#AFA9A0] font-semibold leading-relaxed max-w-xl">
            {language === 'FR' 
              ? 'Posez vos questions à l\'intelligence artificielle de comptabilité analytique. Elle analysera vos données courantes (CA, Salaires, Dettes fournisseurs, Stocks, Taxes) pour vous fournir des conseils sur-mesure conforme à la fiscalité marocaine.' 
              : 'Interact with your dedicated virtual CPA auditor. It evaluates active invoices, salary records, stock margins, and municipal patent indicators to optimize your financial standing.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Prompt Columns */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#8C7B6E] flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#C4A484]" />
            {language === 'FR' ? 'Modèles d\'Audits Recommandés' : 'Audit Prompt Templates'}
          </h4>

          <div className="space-y-3">
            {templates.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(language === 'FR' ? tpl.promptFR : tpl.promptEN);
                  handleAskAI(language === 'FR' ? tpl.promptFR : tpl.promptEN);
                }}
                className="w-full text-left p-4 bg-[#F3F1ED] hover:bg-[#1A1A1A] hover:text-white border-2 border-[#1A1A1A] rounded-2xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
              >
                <div className="text-xs font-bold font-serif mb-1.5">
                  {language === 'FR' ? tpl.titleFR : tpl.titleEN}
                </div>
                <p className="text-[10px] text-gray-500 hover:text-gray-200 line-clamp-2 leading-relaxed font-semibold">
                  {language === 'FR' ? tpl.promptFR : tpl.promptEN}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] border-b border-gray-100 pb-3 flex justify-between items-center">
              <span>{language === 'FR' ? 'Session d\'Audit Interactive' : 'Interactive Audit Thread'}</span>
              <span className="flex items-center gap-1.5 text-green-700 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                Gemini 3.5 Ready
              </span>
            </h4>

            {/* Response Section */}
            {response ? (
              <div className="bg-[#F3F1ED] border-2 border-[#1A1A1A] p-5 rounded-2xl text-xs text-[#1A1A1A] font-semibold leading-relaxed space-y-3 shadow-inner max-h-[350px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8C7B6E] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-700" />
                    {language === 'FR' ? 'Rapport Certifié CPA Virtuel' : 'CPA Audit Statement'}
                  </span>
                  <button
                    onClick={() => setResponse(null)}
                    className="text-[9px] font-black text-red-600 uppercase underline cursor-pointer"
                  >
                    {language === 'FR' ? 'Effacer' : 'Clear'}
                  </button>
                </div>
                <div className="whitespace-pre-wrap font-sans text-gray-800 text-[11px] leading-relaxed">
                  {response}
                </div>
              </div>
            ) : loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#C4A484] animate-spin mx-auto" />
                <p className="text-xs text-[#8C7B6E] font-black uppercase tracking-widest animate-pulse">
                  {language === 'FR' ? 'Traitement des balances et simulation fiscale marocaine...' : 'Analyzing bookkeeping balances...'}
                </p>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400 italic text-xs max-w-sm mx-auto leading-relaxed">
                {language === 'FR' 
                  ? 'Posez une question ci-dessous sur vos marges, vos employés, vos dettes ou optimisations fiscales pour démarrer.' 
                  : 'Submit a custom inquiry or click a diagnostic template to receive immediate fiscal audit reports.'}
              </div>
            )}
          </div>

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAI();
            }}
            className="flex gap-2 bg-[#F3F1ED] border-2 border-[#1A1A1A] p-1.5 rounded-2xl shadow-sm"
          >
            <input
              type="text"
              required
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={language === 'FR' ? 'e.g., Comment réduire mes taxes et optimiser mon stock ?' : 'e.g., Suggest tax reduction for my employee payroll.'}
              className="flex-1 bg-transparent px-3 text-xs text-[#1A1A1A] outline-none font-bold"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 py-3 bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] font-extrabold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

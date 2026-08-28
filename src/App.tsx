import React, { useState, useEffect } from 'react';
import { 
  SectorType, 
  EstablishmentInfo, 
  RevenueTransaction, 
  ExpenseTransaction, 
  Supplier, 
  PurchaseOrder, 
  Employee, 
  Payroll, 
  StockItem, 
  StockLedger, 
  TaxSettings,
  FullSaaSSnapshot
} from './types';
import { 
  SECTORS_LIST, 
  getSectorById 
} from './utils/sectorsConfig';
import { 
  generateSectorDemoData, 
  DEFAULT_ESTABLISHMENT, 
  DEFAULT_TAX_SETTINGS 
} from './utils/mockData';

// Component Imports
import { DbCenter } from './components/DbCenter';
import { EmployeeManager } from './components/EmployeeManager';
import { SupplierManager } from './components/SupplierManager';
import { StockManager } from './components/StockManager';
import { TaxEngine } from './components/TaxEngine';
import { ReportCenter } from './components/ReportCenter';
import { SaaSAssistant } from './components/SaaSAssistant';

// Icons mapping helper
import { 
  Coffee, Utensils, Croissant, Pizza, IceCream, Hotel, GlassWater, 
  ShoppingCart, Beef, Fish, Leaf, Pill, Dumbbell, Scissors, Sparkles, 
  Shirt, Wind, Car, Wrench, Package, Store, TrendingUp, TrendingDown, 
  DollarSign, Database, Settings, RefreshCw, Globe, Users, Truck, 
  Receipt, ListOrdered, Plus, Trash2, HelpCircle, FileText, MapPin, 
  Phone, PlusCircle, CreditCard, ChevronRight, Check, CheckCircle2,
  Activity, ArrowRight, Brain, AlertCircle, Percent
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Coffee, Utensils, Croissant, Pizza, IceCream, Hotel, GlassWater, 
  ShoppingCart, Beef, Fish, Leaf, Pill, Dumbbell, Scissors, Sparkles, 
  Shirt, Wind, Car, Wrench, Package, Store
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'Revenues' | 'Expenses' | 'Stock' | 'Employees' | 'Suppliers' | 'Taxes' | 'Reports' | 'Assistant' | 'DatabaseCenter' | 'Settings'
  >('Dashboard');
  
  const [language, setLanguage] = useState<'FR' | 'EN' | 'AR'>('FR');
  const [syncing, setSyncing] = useState(false);
  const [showSectorModal, setShowSectorModal] = useState(false);

  // Core App State
  const [establishment, setEstablishment] = useState<EstablishmentInfo | null>(null);
  const [revenues, setRevenues] = useState<RevenueTransaction[]>([]);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollList, setPayrollList] = useState<Payroll[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockLedger, setStockLedger] = useState<StockLedger[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);

  // Temporary States for manual inputs
  const [manualRevAmount, setManualRevAmount] = useState('');
  const [manualRevCategory, setManualRevCategory] = useState('');
  const [manualRevMethod, setManualRevMethod] = useState<'Cash' | 'Card' | 'Mobile' | 'Transfer'>('Cash');
  const [manualRevDesc, setManualRevDesc] = useState('');

  const [manualExpAmount, setManualExpAmount] = useState('');
  const [manualExpCategory, setManualExpCategory] = useState<'Rent' | 'Purchases' | 'Electricity' | 'Water' | 'Gaz' | 'Internet' | 'Marketing' | 'Maintenance' | 'Divers'>('Divers');
  const [manualExpDesc, setManualExpDesc] = useState('');

  // 1. Initial State Loading & Migration
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem('saas_language');
      if (storedLang === 'FR' || storedLang === 'EN' || storedLang === 'AR') {
        setLanguage(storedLang);
      }

      const storedEst = localStorage.getItem('saas_establishment');
      if (storedEst) {
        setEstablishment(JSON.parse(storedEst));
        setRevenues(JSON.parse(localStorage.getItem('saas_revenues') || '[]'));
        setExpenses(JSON.parse(localStorage.getItem('saas_expenses') || '[]'));
        setSuppliers(JSON.parse(localStorage.getItem('saas_suppliers') || '[]'));
        setPurchases(JSON.parse(localStorage.getItem('saas_purchases') || '[]'));
        setEmployees(JSON.parse(localStorage.getItem('saas_employees') || '[]'));
        setPayrollList(JSON.parse(localStorage.getItem('saas_payroll') || '[]'));
        setStockItems(JSON.parse(localStorage.getItem('saas_stock') || '[]'));
        setStockLedger(JSON.parse(localStorage.getItem('saas_stock_ledger') || '[]'));
        setTaxSettings(JSON.parse(localStorage.getItem('saas_tax_settings') || JSON.stringify(DEFAULT_TAX_SETTINGS)));
      } else {
        // First Time User: Automatically onboarding with default Restaurant sector data
        handleInitializeSector('Restaurant', 'Atlas Gourmet Casablanca');
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
  }, []);

  // 2. State persistence helper
  const handleInitializeSector = (sector: SectorType, customName?: string) => {
    const demo = generateSectorDemoData(sector, customName);
    
    setEstablishment(demo.establishment);
    setRevenues(demo.revenues);
    setExpenses(demo.expenses);
    setSuppliers(demo.suppliers);
    setPurchases(demo.purchases);
    setEmployees(demo.employees);
    setPayrollList(demo.payrollList);
    setStockItems(demo.stockItems);
    setStockLedger(demo.stockLedger);
    setTaxSettings(demo.taxSettings);

    localStorage.setItem('saas_establishment', JSON.stringify(demo.establishment));
    localStorage.setItem('saas_revenues', JSON.stringify(demo.revenues));
    localStorage.setItem('saas_expenses', JSON.stringify(demo.expenses));
    localStorage.setItem('saas_suppliers', JSON.stringify(demo.suppliers));
    localStorage.setItem('saas_purchases', JSON.stringify(demo.purchases));
    localStorage.setItem('saas_employees', JSON.stringify(demo.employees));
    localStorage.setItem('saas_payroll', JSON.stringify(demo.payrollList));
    localStorage.setItem('saas_stock', JSON.stringify(demo.stockItems));
    localStorage.setItem('saas_stock_ledger', JSON.stringify(demo.stockLedger));
    localStorage.setItem('saas_tax_settings', JSON.stringify(demo.taxSettings));

    // Preset defaults for forms
    const config = getSectorById(sector);
    setManualRevCategory(config.defaultCategories[0] || 'Général');
    setShowSectorModal(false);
  };

  const persistState = (key: string, state: any) => {
    localStorage.setItem(key, JSON.stringify(state));
  };

  // 3. Action State Mutators (Props bound)
  const handleAddEmployee = (emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...emp, id: `emp-${Date.now()}` };
    const updated = [newEmp, ...employees];
    setEmployees(updated);
    persistState('saas_employees', updated);
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    persistState('saas_employees', updated);
  };

  const handleAddPayroll = (payroll: Omit<Payroll, 'id'>) => {
    const newPay: Payroll = { ...payroll, id: `pay-${Date.now()}` };
    const updated = [newPay, ...payrollList];
    setPayrollList(updated);
    persistState('saas_payroll', updated);
  };

  const handleAddSupplier = (sup: Omit<Supplier, 'id' | 'totalPurchases' | 'amountDue'>) => {
    const newSup: Supplier = { ...sup, id: `sup-${Date.now()}`, totalPurchases: 0, amountDue: 0 };
    const updated = [newSup, ...suppliers];
    setSuppliers(updated);
    persistState('saas_suppliers', updated);
  };

  const handleAddPurchase = (order: Omit<PurchaseOrder, 'id'>) => {
    const newOrder: PurchaseOrder = { ...order, id: `pur-${Date.now()}` };
    const updatedOrders = [newOrder, ...purchases];
    setPurchases(updatedOrders);
    persistState('saas_purchases', updatedOrders);

    // Accumulate supplier balances
    const updatedSups = suppliers.map(sup => {
      if (sup.id === order.supplierId) {
        const remaining = order.totalAmount - order.paidAmount;
        return {
          ...sup,
          totalPurchases: sup.totalPurchases + order.totalAmount,
          amountDue: sup.amountDue + remaining
        };
      }
      return sup;
    });
    setSuppliers(updatedSups);
    persistState('saas_suppliers', updatedSups);
  };

  const handleAmortizeDue = (supplierId: string, amount: number) => {
    const updatedSups = suppliers.map(sup => {
      if (sup.id === supplierId) {
        return {
          ...sup,
          amountDue: Math.max(0, sup.amountDue - amount)
        };
      }
      return sup;
    });
    setSuppliers(updatedSups);
    persistState('saas_suppliers', updatedSups);
  };

  const handleAddStockItem = (item: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = { ...item, id: `stk-${Date.now()}` };
    const updated = [...stockItems, newItem];
    setStockItems(updated);
    persistState('saas_stock', updated);
  };

  const handleDeleteStockItem = (id: string) => {
    const updated = stockItems.filter(item => item.id !== id);
    setStockItems(updated);
    persistState('saas_stock', updated);
  };

  const handlePostStockMovement = (itemId: string, type: 'IN' | 'OUT', qty: number, notes: string) => {
    const item = stockItems.find(i => i.id === itemId);
    if (!item) return;

    // Update active level
    const updatedItems = stockItems.map(i => {
      if (i.id === itemId) {
        const newStock = type === 'IN' ? i.currentStock + qty : Math.max(0, i.currentStock - qty);
        return { ...i, currentStock: newStock };
      }
      return i;
    });
    setStockItems(updatedItems);
    persistState('saas_stock', updatedItems);

    // Log ledger entry
    const newLedger: StockLedger = {
      id: `lg-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      itemId,
      itemName: item.name,
      type,
      quantity: qty,
      notes
    };
    const updatedLedgers = [newLedger, ...stockLedger];
    setStockLedger(updatedLedgers);
    persistState('saas_stock_ledger', updatedLedgers);
  };

  const handleUpdateTaxSettings = (rates: Partial<TaxSettings>) => {
    const updated = { ...taxSettings, ...rates };
    setTaxSettings(updated);
    persistState('saas_tax_settings', updated);
  };

  const handleSaveSettings = (info: EstablishmentInfo) => {
    setEstablishment(info);
    persistState('saas_establishment', info);
  };

  // manual revenue transaction insert
  const handleAddManualRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRevAmount) return;

    const newRev: RevenueTransaction = {
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: manualRevCategory || 'Général',
      amount: parseFloat(manualRevAmount),
      paymentMethod: manualRevMethod,
      description: manualRevDesc || 'Saisie manuelle caisse'
    };

    const updated = [newRev, ...revenues];
    setRevenues(updated);
    persistState('saas_revenues', updated);

    // Reset Form
    setManualRevAmount('');
    setManualRevDesc('');
  };

  // manual expense transaction insert
  const handleAddManualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualExpAmount) return;

    const newExp: ExpenseTransaction = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: manualExpCategory,
      amount: parseFloat(manualExpAmount),
      description: manualExpDesc || 'Saisie manuelle opex'
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    persistState('saas_expenses', updated);

    // Reset Form
    setManualExpAmount('');
    setManualExpDesc('');
  };

  const handleTriggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  // 4. Financial Calculations for active dashboard
  const currency = establishment?.currency || 'DH';
  const totalRevenueAllTime = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpensesAllTime = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Salaries from staff
  const staffCosts = employees.reduce((sum, e) => sum + e.baseSalary, 0);
  const taxesCollectedTVA = totalRevenueAllTime * (taxSettings.tvaRate / (1 + taxSettings.tvaRate));
  
  const grossProfitAllTime = totalRevenueAllTime - totalExpensesAllTime;
  const corporateTaxIS = Math.max(0, grossProfitAllTime * taxSettings.isRate);
  const cashOnHand = Math.max(0, totalRevenueAllTime - totalExpensesAllTime - corporateTaxIS);
  const profitMargin = totalRevenueAllTime > 0 ? (grossProfitAllTime / totalRevenueAllTime) * 100 : 0;

  // Build Snapshot bundle for Assistant Tab
  const fullSnapshot: FullSaaSSnapshot = {
    establishment: establishment || DEFAULT_ESTABLISHMENT,
    revenues,
    expenses,
    suppliers,
    purchases,
    employees,
    payrollList,
    stockItems,
    stockLedger,
    taxSettings
  };

  if (!establishment) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6">
        <RefreshCw className="w-8 h-8 text-[#C4A484] animate-spin" />
      </div>
    );
  }

  const activeSectorConfig = getSectorById(establishment.sector);
  const SectorIcon = iconMap[activeSectorConfig.icon] || Store;

  // Dictionary for UI Translations
  const t = {
    FR: {
      dashboard: 'Tableau de bord',
      revenues: 'Revenus',
      expenses: 'Dépenses',
      stock: 'Stocks',
      employees: 'Employés & Paie',
      suppliers: 'Fournisseurs',
      taxes: 'Moteur Fiscal',
      reports: 'Rapports',
      assistant: 'Assistant IA',
      dbCenter: 'Base de données',
      settings: 'Paramètres',
      changeSector: 'Changer d\'activité',
      syncText: 'Données synchronisées',
      ice: 'ICE',
      if: 'IF',
      patente: 'Patente',
      revenueTitle: 'Chiffre d\'Affaires (CA)',
      expensesTitle: 'Charges d\'Exploitation',
      salariesTitle: 'Masse Salariale',
      taxesTitle: 'Taxes & TVA',
      netProfitTitle: 'Résultat Net Comptable',
      cashTitle: 'Trésorerie Disponible',
      marginTitle: 'Marge Commerciale',
      rentabilityTitle: 'Seuil de Rentabilité',
      moroccanTaxEngine: 'Calculateur de Taxes Marocaines',
      recentTransactions: 'Dernières Ventes Enregistrées',
      recentExpenses: 'Charges d\'Exploitation Récentes'
    },
    EN: {
      dashboard: 'Dashboard',
      revenues: 'Revenues',
      expenses: 'Expenses',
      stock: 'Stock Inventory',
      employees: 'Employees & Payroll',
      suppliers: 'Suppliers',
      taxes: 'Tax Engine',
      reports: 'Reports',
      assistant: 'AI Co-Pilot',
      dbCenter: 'DB Schema',
      settings: 'Settings',
      changeSector: 'Switch Activity',
      syncText: 'Ledger synced',
      ice: 'ICE',
      if: 'IF',
      patente: 'Patente',
      revenueTitle: 'Sales Revenue (CA)',
      expensesTitle: 'Operating Costs',
      salariesTitle: 'Masse Salariale',
      taxesTitle: 'Tax Liabilities',
      netProfitTitle: 'Net Profit',
      cashTitle: 'Cash on Hand',
      marginTitle: 'Commercial Margin',
      rentabilityTitle: 'Break-even Point',
      moroccanTaxEngine: 'Moroccan Taxes Engine',
      recentTransactions: 'Recent Sales',
      recentExpenses: 'Operating Expenses Log'
    },
    AR: {
      dashboard: 'لوحة القيادة',
      revenues: 'الإيرادات',
      expenses: 'المصاريف',
      stock: 'المخزون',
      employees: 'الموظفون والرواتب',
      suppliers: 'الموردون والشركاء',
      taxes: 'المحاسبة والضرائب',
      reports: 'التقارير المالية',
      assistant: 'المساعد الذكي',
      dbCenter: 'قاعدة البيانات',
      settings: 'الإعدادات العامة',
      changeSector: 'تغيير النشاط التجاري',
      syncText: 'مزامنة السجلات',
      ice: 'ICE (الموحد)',
      if: 'التعريف الجبائي',
      patente: 'الضريبة المهنية',
      revenueTitle: 'رقم المعاملات الإجمالي',
      expensesTitle: 'التكاليف والمصاريف',
      salariesTitle: 'مجموع الرواتب شهرياً',
      taxesTitle: 'مجموع المستحقات الضريبية',
      netProfitTitle: 'النتيجة الصافية للنشاط',
      cashTitle: 'السيولة النقدية المتوفرة',
      marginTitle: 'هامش الربح',
      rentabilityTitle: 'نقطة التعادل المالي',
      moroccanTaxEngine: 'محاسبة الضرائب المغربية',
      recentTransactions: 'سجل المبيعات الأخيرة',
      recentExpenses: 'سجل المصاريف التشغيلية'
    }
  }[language];

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] antialiased font-sans flex flex-col lg:flex-row" dir={language === 'AR' ? 'rtl' : 'ltr'}>
      
      {/* 1. Left Vertical Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-[#1A1A1A] text-white flex flex-col justify-between shrink-0 border-b-2 lg:border-b-0 lg:border-r-2 border-[#1A1A1A] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div>
          {/* Header & Establishment Badge */}
          <div className="p-6 border-b border-white/10 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-[#C4A484]/20 border border-[#C4A484]/35 text-[#C4A484] rounded-2xl">
                <SectorIcon className="w-5 h-5" />
              </span>
              <div>
                <h1 className="font-serif font-black text-base tracking-wide flex items-center gap-1">
                  EasyHssab <span className="text-[9px] bg-[#C4A484] text-[#1A1A1A] px-1 py-0.5 rounded font-black tracking-normal">SaaS</span>
                </h1>
                <p className="text-[10px] text-[#AFA9A0] font-semibold uppercase tracking-wider">
                  {establishment.name}
                </p>
              </div>
            </div>

            {/* Quick meta lines */}
            <div className="bg-neutral-900 border border-white/5 rounded-xl p-2.5 space-y-1">
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#AFA9A0]">
                <span>Secteur:</span>
                <span className="text-[#C4A484] flex items-center gap-1 font-bold">
                  {establishment.sector}
                </span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#AFA9A0]">
                <span>ICE:</span>
                <span className="font-mono text-white">{establishment.ice}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSectorModal(true)}
              className="w-full text-center py-1.5 bg-neutral-900 hover:bg-[#C4A484] hover:text-[#1A1A1A] text-white text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition cursor-pointer"
            >
              {t.changeSector}
            </button>
          </div>

          {/* Tab lists */}
          <nav className="p-4 space-y-1 text-xs font-bold uppercase tracking-wider">
            {(
              [
                { id: 'Dashboard', label: t.dashboard, icon: Activity },
                { id: 'Revenues', label: t.revenues, icon: DollarSign },
                { id: 'Expenses', label: t.expenses, icon: CreditCard },
                { id: 'Stock', label: t.stock, icon: Package },
                { id: 'Employees', label: t.employees, icon: Users },
                { id: 'Suppliers', label: t.suppliers, icon: Truck },
                { id: 'Taxes', label: t.taxes, icon: Percent },
                { id: 'Reports', label: t.reports, icon: FileText },
                { id: 'Assistant', label: t.assistant, icon: Brain },
                { id: 'DatabaseCenter', label: t.dbCenter, icon: Database },
                { id: 'Settings', label: t.settings, icon: Settings }
              ] as const
            ).map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-[#C4A484] text-[#1A1A1A]' 
                      : 'text-[#AFA9A0] hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <TabIcon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & i18n switcher */}
        <div className="p-6 border-t border-white/10 space-y-4">
          {/* i18n Selector */}
          <div className="flex bg-neutral-900 p-1 rounded-xl h-9 items-center border border-white/5">
            <button
              onClick={() => { setLanguage('EN'); localStorage.setItem('saas_language', 'EN'); }}
              className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                language === 'EN' ? 'bg-[#C4A484] text-[#1A1A1A]' : 'text-[#AFA9A0] hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => { setLanguage('FR'); localStorage.setItem('saas_language', 'FR'); }}
              className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                language === 'FR' ? 'bg-[#C4A484] text-[#1A1A1A]' : 'text-[#AFA9A0] hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => { setLanguage('AR'); localStorage.setItem('saas_language', 'AR'); }}
              className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                language === 'AR' ? 'bg-[#C4A484] text-[#1A1A1A]' : 'text-[#AFA9A0] hover:text-white'
              }`}
            >
              عربي
            </button>
          </div>

          <div className="text-[10px] text-[#AFA9A0] font-medium leading-normal">
            &copy; 2026 EasyHssab SaaS Pro &bull; {language === 'FR' ? 'Casablanca, Maroc' : 'Casablanca, Morocco'}
          </div>
        </div>
      </aside>

      {/* 2. Right Main Working Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Header bar */}
        <header className="bg-white border-b-2 border-[#1A1A1A] py-5 px-6 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-40">
          <div>
            <h2 className="text-xl font-serif font-black text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
              <SectorIcon className="w-5 h-5 text-[#C4A484]" />
              {activeTab === 'Dashboard' && t.dashboard}
              {activeTab === 'Revenues' && t.revenues}
              {activeTab === 'Expenses' && t.expenses}
              {activeTab === 'Stock' && t.stock}
              {activeTab === 'Employees' && t.employees}
              {activeTab === 'Suppliers' && t.suppliers}
              {activeTab === 'Taxes' && t.taxes}
              {activeTab === 'Reports' && t.reports}
              {activeTab === 'Assistant' && t.assistant}
              {activeTab === 'DatabaseCenter' && t.dbCenter}
              {activeTab === 'Settings' && t.settings}
            </h2>
            <p className="text-[10px] text-[#8C7B6E] font-bold uppercase tracking-widest mt-0.5">
              {establishment.name} &bull; {t.ice} {establishment.ice}
            </p>
          </div>

          {/* Sync status */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3F1ED] border border-[#1A1A1A]/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#8C7B6E]">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              {syncing ? 'Syncing...' : t.syncText}
            </span>
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="p-2 border-2 border-[#1A1A1A] rounded-xl hover:bg-[#F3F1ED] text-[#1A1A1A] transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Dynamic Inner Tab Canvas */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD / CORES */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* KPI indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. CA */}
                <div className="bg-white p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wider">{t.revenueTitle}</p>
                      <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tight mt-1.5">
                        {currency}{totalRevenueAllTime.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </h3>
                    </div>
                    <div className="p-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-[11px] text-[#8C7B6E] font-bold">
                    TVA brute incluse: {currency}{taxesCollectedTVA.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>

                {/* 2. Dépenses */}
                <div className="bg-[#F3F1ED] p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wider">{t.expensesTitle}</p>
                      <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tight mt-1.5">
                        {currency}{totalExpensesAllTime.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </h3>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-800">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">
                    <span>Masse Sal : {currency}{staffCosts.toLocaleString()}</span>
                  </div>
                </div>

                {/* 3. IS */}
                <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(196,164,132,1)] flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#AFA9A0] uppercase tracking-widest">{t.taxesTitle}</p>
                      <h3 className="text-3xl font-serif font-black text-[#C4A484] tracking-tight mt-1.5">
                        {currency}{corporateTaxIS.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </h3>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFB74D] shadow-[0_0_8px_#FFB74D]"></div>
                  </div>
                  <div className="text-[10px] font-bold text-[#AFA9A0] uppercase">
                    Calculé sur taux progressif de {(taxSettings.isRate * 100).toFixed(0)}%
                  </div>
                </div>

                {/* 4. Cash */}
                <div className="bg-[#C4A484] text-[#1A1A1A] p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#1A1A1A]/75 uppercase tracking-wider">{t.netProfitTitle}</p>
                      <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tight mt-1.5">
                        {currency}{(grossProfitAllTime - corporateTaxIS).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </h3>
                    </div>
                    <div className="p-2 bg-white text-[#1A1A1A] rounded-xl border border-[#1A1A1A]">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center text-[10px] font-extrabold text-[#1A1A1A]/75 justify-between uppercase">
                    <span>Marge: {profitMargin.toFixed(1)}%</span>
                  </div>
                </div>

              </div>

              {/* Grid with visual lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent transactions list */}
                <div className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <h4 className="text-sm font-black uppercase text-[#1A1A1A] border-b border-gray-100 pb-3 flex justify-between items-center mb-4">
                    <span>{t.recentTransactions}</span>
                    <span className="text-[10px] text-[#C4A484] font-black">{establishment.sector}</span>
                  </h4>
                  <div className="space-y-3.5">
                    {revenues.slice(0, 5).map(rev => (
                      <div key={rev.id} className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#1A1A1A]">{rev.category}</div>
                          <div className="text-[10px] text-[#8C7B6E] font-bold">{rev.date} &bull; {rev.paymentMethod}</div>
                        </div>
                        <div className="font-mono font-black text-green-700">
                          +{currency}{rev.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent expenses list */}
                <div className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <h4 className="text-sm font-black uppercase text-[#1A1A1A] border-b border-gray-100 pb-3 flex justify-between items-center mb-4">
                    <span>{t.recentExpenses}</span>
                    <span className="text-[10px] text-amber-800 font-black">OPEX</span>
                  </h4>
                  <div className="space-y-3.5">
                    {expenses.slice(0, 5).map(exp => (
                      <div key={exp.id} className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#1A1A1A]">{exp.description}</div>
                          <div className="text-[10px] text-[#8C7B6E] font-bold">{exp.date} &bull; {exp.category}</div>
                        </div>
                        <div className="font-mono font-black text-red-600">
                          -{currency}{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* CPA recommendation alert */}
              <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(196,164,132,1)]">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-[#C4A484] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Optimisation Fiscale Recommandée par l'Assistant IA
                  </h4>
                  <p className="text-xs text-[#AFA9A0] font-medium leading-relaxed max-w-2xl">
                    En analysant votre activité ({establishment.sector}), vos charges de fonctionnement représentent des passifs admissibles. Utilisez l'assistant IA ou le simulateur de taxes interactif pour modéliser des économies d'IS sur votre prochain exercice fiscal au Maroc.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('Assistant')}
                  className="px-4 py-2.5 bg-[#C4A484] hover:bg-white text-[#1A1A1A] font-black uppercase text-[10px] tracking-widest rounded-xl transition cursor-pointer shrink-0"
                >
                  Consulter l'IA
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: REVENUES WORKsheet */}
          {activeTab === 'Revenues' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to log transaction */}
                <div className="bg-[#F3F1ED] p-5 rounded-2xl border-2 border-[#1A1A1A] h-fit space-y-4">
                  <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#C4A484]" />
                    {language === 'FR' ? 'Enregistrer une Vente' : 'Log Cash Order'}
                  </h4>

                  <form onSubmit={handleAddManualRevenue} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Catégorie de vente
                      </label>
                      <select
                        value={manualRevCategory}
                        onChange={e => setManualRevCategory(e.target.value)}
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
                      >
                        {activeSectorConfig.defaultCategories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                        <option value="Divers">Divers / Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Montant de la Vente (DH)
                      </label>
                      <input
                        type="number"
                        required
                        value={manualRevAmount}
                        onChange={e => setManualRevAmount(e.target.value)}
                        placeholder="DH"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Méthode de Paiement
                      </label>
                      <select
                        value={manualRevMethod}
                        onChange={e => setManualRevMethod(e.target.value as any)}
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
                      >
                        <option value="Cash">Espèces (Cash)</option>
                        <option value="Card">Carte Bancaire (Card)</option>
                        <option value="Mobile">Mobile Pay (CIH / Wafapay)</option>
                        <option value="Transfer">Virement bancaire (Transfer)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Notes / Client description
                      </label>
                      <input
                        type="text"
                        value={manualRevDesc}
                        onChange={e => setManualRevDesc(e.target.value)}
                        placeholder="e.g., Client de passage"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] py-2.5 font-extrabold uppercase text-xs tracking-wider rounded-xl border-2 border-[#1A1A1A] transition cursor-pointer mt-2"
                    >
                      Enregistrer la transaction
                    </button>
                  </form>
                </div>

                {/* Table list of transactions */}
                <div className="lg:col-span-2 overflow-x-auto bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead>
                      <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Catégorie</th>
                        <th className="py-2.5 px-4 text-center">Méthode</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenues.map(rev => (
                        <tr key={rev.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-mono text-gray-500 font-semibold">{rev.date}</td>
                          <td className="py-3 px-4 font-bold text-[#1A1A1A]">{rev.category}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-md">
                              {rev.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-medium">{rev.description}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-green-700">
                            {currency}{rev.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPENSES WORKsheet */}
          {activeTab === 'Expenses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form column */}
                <div className="bg-[#F3F1ED] p-5 rounded-2xl border-2 border-[#1A1A1A] h-fit space-y-4">
                  <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#C4A484]" />
                    {language === 'FR' ? 'Enregistrer une Charge' : 'Log Expense'}
                  </h4>

                  <form onSubmit={handleAddManualExpense} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Catégorie de Charge
                      </label>
                      <select
                        value={manualExpCategory}
                        onChange={e => setManualExpCategory(e.target.value as any)}
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
                      >
                        <option value="Rent">Loyer Local Commercial (Rent)</option>
                        <option value="Purchases">Achats de marchandises (Purchases)</option>
                        <option value="Electricity">Facture Électricité (Electricity)</option>
                        <option value="Water">Facture Eau (Water)</option>
                        <option value="Gaz">Consommation Gaz (Gaz)</option>
                        <option value="Internet">Abonnement Télécom & Fibre (Internet)</option>
                        <option value="Marketing">Publicité & Marketing (Marketing)</option>
                        <option value="Maintenance">Entretien & Nettoyage (Maintenance)</option>
                        <option value="Divers">Frais Divers (Divers)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Montant de la charge (DH)
                      </label>
                      <input
                        type="number"
                        required
                        value={manualExpAmount}
                        onChange={e => setManualExpAmount(e.target.value)}
                        placeholder="DH"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Désignation / Détails
                      </label>
                      <input
                        type="text"
                        required
                        value={manualExpDesc}
                        onChange={e => setManualExpDesc(e.target.value)}
                        placeholder="e.g., Achat cartons emballages"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] py-2.5 font-extrabold uppercase text-xs tracking-wider rounded-xl border-2 border-[#1A1A1A] transition cursor-pointer mt-2"
                    >
                      Valider et Enregistrer
                    </button>
                  </form>
                </div>

                {/* Expenses logger table */}
                <div className="lg:col-span-2 overflow-x-auto bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead>
                      <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Catégorie</th>
                        <th className="py-2.5 px-4">Désignation</th>
                        <th className="py-2.5 px-4 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(exp => (
                        <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-mono text-gray-500 font-semibold">{exp.date}</td>
                          <td className="py-3 px-4 font-bold text-gray-800">{exp.category}</td>
                          <td className="py-3 px-4 text-gray-600 font-medium">{exp.description}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-red-600">
                            {currency}{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STOCKS MANAGER MODULE */}
          {activeTab === 'Stock' && (
            <div className="animate-fade-in">
              <StockManager 
                stockItems={stockItems}
                stockLedger={stockLedger}
                currency={currency}
                onAddStockItem={handleAddStockItem}
                onDeleteStockItem={handleDeleteStockItem}
                onPostStockMovement={handlePostStockMovement}
                language={language}
              />
            </div>
          )}

          {/* TAB 5: EMPLOYEES & PAYROLL MODULE */}
          {activeTab === 'Employees' && (
            <div className="animate-fade-in">
              <EmployeeManager 
                employees={employees}
                payrollList={payrollList}
                taxSettings={taxSettings}
                currency={currency}
                onAddEmployee={handleAddEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onAddPayroll={handleAddPayroll}
                language={language}
              />
            </div>
          )}

          {/* TAB 6: SUPPLIERS & PURCHASES MODULE */}
          {activeTab === 'Suppliers' && (
            <div className="animate-fade-in">
              <SupplierManager
                suppliers={suppliers}
                purchases={purchases}
                currency={currency}
                establishment={establishment}
                onAddSupplier={handleAddSupplier}
                onAddPurchase={handleAddPurchase}
                onAmortizeDue={handleAmortizeDue}
                language={language}
              />
            </div>
          )}

          {/* TAB 7: TAX ENGINE COMPONENT */}
          {activeTab === 'Taxes' && (
            <div className="animate-fade-in">
              <TaxEngine
                revenues={revenues}
                expenses={expenses}
                purchases={purchases}
                employees={employees}
                taxSettings={taxSettings}
                currency={currency}
                onUpdateTaxSettings={handleUpdateTaxSettings}
                language={language}
              />
            </div>
          )}

          {/* TAB 8: REPORTING CENTER */}
          {activeTab === 'Reports' && (
            <div className="animate-fade-in">
              <ReportCenter 
                revenues={revenues}
                expenses={expenses}
                employees={employees}
                suppliers={suppliers}
                establishment={establishment}
                currency={currency}
                language={language}
              />
            </div>
          )}

          {/* TAB 9: ASSISTANT IA WITH GEMINI */}
          {activeTab === 'Assistant' && (
            <div className="animate-fade-in">
              <SaaSAssistant 
                snapshot={fullSnapshot}
                currency={currency}
                language={language}
              />
            </div>
          )}

          {/* TAB 10: DEVELOPER DB & PRISMA CENTER */}
          {activeTab === 'DatabaseCenter' && (
            <div className="animate-fade-in">
              <DbCenter language={language} />
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'Settings' && (
            <div className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] max-w-xl mx-auto space-y-6 animate-fade-in">
              <h4 className="font-serif font-black text-lg text-[#1A1A1A]">
                {language === 'FR' ? 'Paramètres de l\'Établissement' : 'Establishment Settings'}
              </h4>

              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      Nom Commercial
                    </label>
                    <input
                      type="text"
                      value={establishment.name}
                      onChange={e => handleSaveSettings({ ...establishment, name: e.target.value })}
                      className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      Devise (Currency)
                    </label>
                    <input
                      type="text"
                      value={establishment.currency}
                      onChange={e => handleSaveSettings({ ...establishment, currency: e.target.value })}
                      className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      N° ICE (15 chiffres)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={establishment.ice}
                      onChange={e => handleSaveSettings({ ...establishment, ice: e.target.value })}
                      className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-mono text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      Identifiant Fiscal (IF)
                    </label>
                    <input
                      type="text"
                      value={establishment.ifNum}
                      onChange={e => handleSaveSettings({ ...establishment, ifNum: e.target.value })}
                      className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      N° Patente
                    </label>
                    <input
                      type="text"
                      value={establishment.patenteNum}
                      onChange={e => handleSaveSettings({ ...establishment, patenteNum: e.target.value })}
                      className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={establishment.ville}
                      onChange={e => handleSaveSettings({ ...establishment, ville: e.target.value })}
                      className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      Commune
                    </label>
                    <input
                      type="text"
                      value={establishment.commune}
                      onChange={e => handleSaveSettings({ ...establishment, commune: e.target.value })}
                      className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                    Adresse complète
                  </label>
                  <input
                    type="text"
                    value={establishment.address}
                    onChange={e => handleSaveSettings({ ...establishment, address: e.target.value })}
                    className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A]"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-extrabold text-[#8C7B6E] uppercase tracking-wider">
                  <span>Isolated Sandbox</span>
                  <span>Moroccan SME standard</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. Onboarding & Dynamic Sector Switching Bento Dialog Modal */}
      {showSectorModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <h3 className="font-serif font-black text-[#1A1A1A] text-lg uppercase tracking-wide">
                  {language === 'FR' ? 'Sélectionner l\'activité marocaine' : 'Select commercial sector'}
                </h3>
                <p className="text-xs text-[#8C7B6E] font-medium mt-1">
                  {language === 'FR' ? 'Choisissez l\'activité de votre établissement. Le système configurera instantanément les matières, les taxes et simulera des bilans comptables de démarrage.' : 'Choose the sector of activity. This populates customized categories and structures automatically.'}
                </p>
              </div>
              <button
                onClick={() => setShowSectorModal(false)}
                className="text-xs font-black uppercase text-[#8C7B6E] hover:text-[#1A1A1A] underline cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {/* Grid of 20+ Sectors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {SECTORS_LIST.map(sec => {
                const SecIconComponent = iconMap[sec.icon] || Store;
                const isSelected = establishment.sector === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      handleInitializeSector(sec.id, `${sec.labelFR} de Casablanca`);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer flex flex-col justify-between h-28 ${
                      isSelected 
                        ? 'bg-[#C4A484] border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]' 
                        : 'bg-white border-gray-200 hover:border-[#1A1A1A] hover:bg-white/90'
                    }`}
                  >
                    <div className={`p-2 rounded-xl w-fit ${isSelected ? 'bg-white/20 text-[#1A1A1A]' : 'bg-[#F3F1ED] text-gray-700'}`}>
                      <SecIconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold uppercase text-[#1A1A1A] line-clamp-1">
                        {language === 'FR' ? sec.labelFR : (language === 'AR' ? sec.labelAR : sec.labelEN)}
                      </div>
                      <div className="text-[9px] text-[#8C7B6E] font-medium uppercase tracking-wider">
                        {sec.defaultCategories.length} cats
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

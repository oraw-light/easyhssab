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
  TaxSettings 
} from '../types';
import { getSectorById } from './sectorsConfig';

// Default starter Moroccan tax settings
export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  tvaRate: 0.20, // 20% standard rate
  isRate: 0.20, // 20% corporate tax rate (CGI standard bracket)
  irRate: 0.10, // 10% average income tax rate
  patenteRate: 0.05, // 5% patent rate
  beverageTaxRate: 0.02, // 2% beverage débit tax
  cnssRate: 0.0448, // 4.48% employee deduction CNSS
  amoRate: 0.0226 // 2.26% employee deduction AMO
};

// TVA rate per sector, per CGI Maroc (fresh/unprocessed food and bread are TVA-exempt,
// medicines are super-reduced 7%, catering/hotels are reduced 10%, rest is standard 20%)
const SECTOR_TVA_RATES: Record<SectorType, number> = {
  Cafe: 0.10,
  Restaurant: 0.10,
  Boulangerie: 0.00,
  Snack: 0.10,
  Glacier: 0.10,
  Hotel: 0.10,
  SalonDeThe: 0.10,
  Epicerie: 0.10,
  Boucherie: 0.00,
  Poissonnerie: 0.00,
  Primeur: 0.00,
  Pharmacie: 0.07,
  SalleDeSport: 0.20,
  SalonDeCoiffure: 0.20,
  InstitutDeBeaute: 0.20,
  Boutique: 0.20,
  Pressing: 0.20,
  LocationVoitures: 0.20,
  Garage: 0.20,
  CommerceGros: 0.20,
  Autre: 0.20
};

export const DEFAULT_ESTABLISHMENT: EstablishmentInfo = {
  name: "Atlas Gourmet Casablanca",
  logo: "",
  address: "45 Rue Allal Ben Abdellah, Centre-ville, Casablanca",
  phone: "+212 522 34 56 78",
  ice: "001859632000147", // 15-digit Identifiant Commun de l'Entreprise
  ifNum: "45281739", // Identifiant Fiscal
  patenteNum: "34109852",
  ville: "Casablanca",
  commune: "Sidi Belyout",
  sector: "Restaurant",
  currency: "DH"
};

// Generates dynamic data based on the chosen sector
export const generateSectorDemoData = (sector: SectorType, brandName?: string) => {
  const config = getSectorById(sector);
  const name = brandName || `${config.labelFR} de Casablanca`;
  
  // Custom establishment settings
  const establishment: EstablishmentInfo = {
    name,
    logo: "",
    address: `Bvd de la Corniche, Anfa, Casablanca, Maroc`,
    phone: "+212 522 " + Math.floor(100000 + Math.random() * 900000),
    ice: "00" + Math.floor(1000000000000 + Math.random() * 9000000000000), // 15 digits
    ifNum: String(Math.floor(10000000 + Math.random() * 90000000)),
    patenteNum: String(Math.floor(10000000 + Math.random() * 90000000)),
    ville: "Casablanca",
    commune: "Anfa",
    sector,
    currency: "DH"
  };

  // Tax settings adjustment based on sector
  const taxSettings: TaxSettings = {
    ...DEFAULT_TAX_SETTINGS,
    tvaRate: SECTOR_TVA_RATES[sector],
    beverageTaxRate: ['Cafe', 'Restaurant', 'Snack', 'SalonDeThe'].includes(sector) ? 0.02 : 0.00
  };

  // Suggested stock items
  const stockItems: StockItem[] = config.suggestedStock.map((item, idx) => ({
    id: `stk-${idx + 1}-${sector}`,
    name: item.name,
    category: config.defaultCategories[0] || 'Général',
    minStock: item.minStock,
    currentStock: Math.floor(item.minStock * 2.5 + Math.random() * item.minStock),
    unit: item.unit,
    unitCost: item.unitCost
  }));

  // Initial stock ledger entries
  const stockLedger: StockLedger[] = stockItems.map((item, idx) => ({
    id: `lg-${idx + 1}-${sector}`,
    date: '2026-07-10',
    itemId: item.id,
    itemName: item.name,
    type: 'IN',
    quantity: item.currentStock,
    notes: 'Stock initial de démarrage'
  }));

  // Custom Sector-Specific Employees
  let employeeRoles: { name: string; role: string; baseSalary: number }[] = [];
  if (sector === 'Hotel') {
    employeeRoles = [
      { name: "Youssef Alaoui", role: "Réceptionniste de nuit", baseSalary: 4200 },
      { name: "Fatima Zahra", role: "Gouvernante de maison", baseSalary: 3800 },
      { name: "Reda El Amrani", role: "Directeur d'Hôtel", baseSalary: 12000 },
      { name: "Amine Sbai", role: "Masseur Spa", baseSalary: 4500 }
    ];
  } else if (['Cafe', 'Restaurant', 'Snack', 'SalonDeThe', 'Glacier'].includes(sector)) {
    employeeRoles = [
      { name: "Mehdi Tazi", role: "Chef de cuisine / Barista pro", baseSalary: 5500 },
      { name: "Soukaina Fassi", role: "Serveur Principal", baseSalary: 3500 },
      { name: "Anas Bouazza", role: "Aide-serveur", baseSalary: 3200 },
      { name: "Nadia Chraibi", role: "Caissière comptable", baseSalary: 4000 }
    ];
  } else if (sector === 'Pharmacie') {
    employeeRoles = [
      { name: "Dr. Tarik Filali", role: "Pharmacien gérant", baseSalary: 9500 },
      { name: "Ihssane Bennani", role: "Préparatrice en pharmacie", baseSalary: 4800 },
      { name: "Laila Jabri", role: "Conseillère parapharmacie", baseSalary: 4200 }
    ];
  } else {
    employeeRoles = [
      { name: "Karim Mansouri", role: "Gérant principal", baseSalary: 6000 },
      { name: "Wafae El Alami", role: "Conseillère clientèle", baseSalary: 3800 },
      { name: "Zakaria Oudghiri", role: "Technicien / Ouvrier pro", baseSalary: 4200 }
    ];
  }

  const employees: Employee[] = employeeRoles.map((emp, idx) => ({
    id: `emp-${idx + 1}-${sector}`,
    name: emp.name,
    role: emp.role,
    phone: "+212 66" + Math.floor(1000000 + Math.random() * 9000000),
    joinDate: '2025-02-01',
    baseSalary: emp.baseSalary,
    cnssRegistered: true,
    amoRegistered: true,
    activeConges: Math.floor(Math.random() * 10) + 10
  }));

  // Suppliers & purchases
  const suppliers: Supplier[] = [
    {
      id: `sup-1-${sector}`,
      name: "Société des Équipements du Maroc (SEQM)",
      phone: "+212 522 99 88 77",
      email: "commercial@seqm.ma",
      ice: "000284716000089",
      contactPerson: "Kamal Naciri",
      totalPurchases: 25000,
      amountDue: 5000
    },
    {
      id: `sup-2-${sector}`,
      name: "Gros & Distri Maroc S.A.",
      phone: "+212 522 41 42 43",
      email: "contact@grosdistri.ma",
      ice: "001948521000155",
      contactPerson: "Siham Alaoui",
      totalPurchases: 18400,
      amountDue: 0
    },
    {
      id: `sup-3-${sector}`,
      name: "Fournisseurs Locaux de la Région",
      phone: "+212 661 50 40 30",
      email: "locaux@atlas.ma",
      ice: "000452178000063",
      contactPerson: "Hassan Oudghiri",
      totalPurchases: 9500,
      amountDue: 1200
    }
  ];

  const purchases: PurchaseOrder[] = [
    {
      id: `pur-1-${sector}`,
      date: '2026-07-02',
      supplierId: `sup-1-${sector}`,
      supplierName: "Société des Équipements du Maroc (SEQM)",
      itemsDescription: "Achat d'équipements de travail, tables, étagères et consommables pro",
      totalAmount: 12000,
      paidAmount: 7000,
      status: 'Partial'
    },
    {
      id: `pur-2-${sector}`,
      date: '2026-07-08',
      supplierId: `sup-2-${sector}`,
      supplierName: "Gros & Distri Maroc S.A.",
      itemsDescription: "Achat de fournitures, matières premières et emballages",
      totalAmount: 6400,
      paidAmount: 6400,
      status: 'Paid'
    },
    {
      id: `pur-3-${sector}`,
      date: '2026-07-12',
      supplierId: `sup-3-${sector}`,
      supplierName: "Fournisseurs Locaux de la Région",
      itemsDescription: "Livraison hebdomadaire de consommables frais et herbes",
      totalAmount: 3200,
      paidAmount: 2000,
      status: 'Partial'
    }
  ];

  // Past payroll list for May and June
  const payrollList: Payroll[] = [];
  ['2026-05', '2026-06'].forEach(month => {
    employees.forEach(emp => {
      const prime = Math.random() > 0.6 ? 300 : 0;
      const cnss = emp.baseSalary * taxSettings.cnssRate;
      const amo = emp.baseSalary * taxSettings.amoRate;
      payrollList.push({
        id: `pay-${emp.id}-${month}`,
        date: month === '2026-05' ? '2026-05-31' : '2026-06-30',
        employeeId: emp.id,
        employeeName: emp.name,
        baseSalary: emp.baseSalary,
        prime,
        cnssDeduction: parseFloat(cnss.toFixed(2)),
        amoDeduction: parseFloat(amo.toFixed(2)),
        netPaid: parseFloat((emp.baseSalary + prime - cnss - amo).toFixed(2)),
        month
      });
    });
  });

  // Operating Expenses spread across 6 months
  const expenses: ExpenseTransaction[] = [];
  const opexCategories: ExpenseTransaction['category'][] = [
    'Rent', 'Electricity', 'Water', 'Gaz', 'Internet', 'Marketing', 'Maintenance', 'Divers'
  ];

  const monthsList = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
  
  // Rent: monthly recurring
  monthsList.forEach(m => {
    expenses.push({
      id: `exp-rent-${m}`,
      date: `${m}-01`,
      category: 'Rent',
      amount: sector === 'Hotel' ? 14000 : 4500,
      description: `Loyer mensuel commercial pour ${m}`,
      isRecurring: true
    });
  });

  // Utilities, Marketing, and Maintenance
  monthsList.forEach(m => {
    expenses.push({
      id: `exp-elec-${m}`,
      date: `${m}-12`,
      category: 'Electricity',
      amount: Math.floor(450 + Math.random() * 400),
      description: `Facture Lydec Électricité du mois ${m}`
    });
    expenses.push({
      id: `exp-water-${m}`,
      date: `${m}-15`,
      category: 'Water',
      amount: Math.floor(150 + Math.random() * 150),
      description: `Facture Lydec Eau du mois ${m}`
    });
    expenses.push({
      id: `exp-net-${m}`,
      date: `${m}-05`,
      category: 'Internet',
      amount: 299,
      description: `Abonnement Maroc Telecom fibre optique`,
      isRecurring: true
    });
    
    if (Math.random() > 0.4) {
      expenses.push({
        id: `exp-mkt-${m}`,
        date: `${m}-18`,
        category: 'Marketing',
        amount: Math.floor(300 + Math.random() * 500),
        description: `Promotion de l'établissement sur Instagram et flyers`
      });
    }
    if (Math.random() > 0.5) {
      expenses.push({
        id: `exp-maint-${m}`,
        date: `${m}-22`,
        category: 'Maintenance',
        amount: Math.floor(200 + Math.random() * 1000),
        description: `Frais d'entretien général et nettoyage pro`
      });
    }
  });

  // Salary expense is represented in payroll as well, but let's record some custom purchases
  monthsList.forEach(m => {
    expenses.push({
      id: `exp-pur-${m}`,
      date: `${m}-10`,
      category: 'Purchases',
      amount: Math.floor(3500 + Math.random() * 5000),
      description: `Achat de fournitures et approvisionnement régulier`
    });
  });

  // Dynamic Sector-Specific Revenues (Daily & Monthly orders simulated)
  const revenues: RevenueTransaction[] = [];
  let revenueIdSeq = 100;

  monthsList.forEach(m => {
    // Generate 4-8 lumped revenue transaction rows per month to show rich categories
    const categories = config.defaultCategories;
    const numTransactions = Math.floor(Math.random() * 3) + 5; // 5-8 entries
    const daysInMonth = m === '2026-07' ? 17 : 28;

    for (let i = 0; i < numTransactions; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)] || 'Divers';
      const day = String(Math.floor(Math.random() * daysInMonth) + 1).padStart(2, '0');
      const baseAmount = sector === 'Hotel' ? 2500 : 750;
      const amount = Math.floor(baseAmount + Math.random() * baseAmount * 4);
      
      const pMethods: RevenueTransaction['paymentMethod'][] = ['Cash', 'Card', 'Mobile', 'Transfer'];
      const paymentMethod = pMethods[Math.floor(Math.random() * pMethods.length)];

      revenues.push({
        id: `rev-${revenueIdSeq++}-${sector}`,
        date: `${m}-${day}`,
        category: cat,
        amount,
        paymentMethod,
        description: `Ventes ${cat} - Point de Vente Caisse`
      });
    }
  });

  return {
    establishment,
    revenues: revenues.sort((a, b) => b.date.localeCompare(a.date)),
    expenses: expenses.sort((a, b) => b.date.localeCompare(a.date)),
    suppliers,
    purchases,
    employees,
    payrollList,
    stockItems,
    stockLedger,
    taxSettings
  };
};

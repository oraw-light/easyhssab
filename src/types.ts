export type SectorType =
  | 'Cafe'
  | 'Restaurant'
  | 'Boulangerie'
  | 'Snack'
  | 'Glacier'
  | 'Hotel'
  | 'SalonDeThe'
  | 'Epicerie'
  | 'Boucherie'
  | 'Poissonnerie'
  | 'Primeur'
  | 'Pharmacie'
  | 'SalleDeSport'
  | 'SalonDeCoiffure'
  | 'InstitutDeBeaute'
  | 'Boutique'
  | 'Pressing'
  | 'LocationVoitures'
  | 'Garage'
  | 'CommerceGros'
  | 'Autre';

export interface SectorDefinition {
  id: SectorType;
  labelFR: string;
  labelAR: string;
  labelEN: string;
  icon: string;
  defaultCategories: string[];
  suggestedStock: { name: string; unit: string; minStock: number; unitCost: number }[];
}

export interface EstablishmentInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  ice: string; // Identifiant Commun de l'Entreprise
  ifNum: string; // Identifiant Fiscal
  patenteNum: string; // Numéro de Patente
  ville: string;
  commune: string;
  sector: SectorType;
  currency: string;
}

export interface RevenueTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'Mobile' | 'Transfer';
  description: string;
}

export interface ExpenseTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'Rent' | 'Purchases' | 'Electricity' | 'Water' | 'Gaz' | 'Internet' | 'Marketing' | 'Maintenance' | 'Divers';
  amount: number;
  description: string;
  isRecurring?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  ice: string;
  contactPerson: string;
  totalPurchases: number;
  amountDue: number;
}

export interface PurchaseOrder {
  id: string;
  date: string; // YYYY-MM-DD
  supplierId: string;
  supplierName: string;
  itemsDescription: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Partial' | 'Pending';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  joinDate: string; // YYYY-MM-DD
  baseSalary: number;
  cnssRegistered: boolean;
  amoRegistered: boolean;
  activeConges: number; // days taken or available
}

export interface Payroll {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  prime: number;
  cnssDeduction: number;
  amoDeduction: number;
  netPaid: number;
  month: string; // YYYY-MM
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  minStock: number;
  currentStock: number;
  unit: string;
  unitCost: number;
}

export interface StockLedger {
  id: string;
  date: string; // YYYY-MM-DD
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  notes: string;
}

export interface TaxSettings {
  tvaRate: number; // e.g., 0.20 for 20%
  isRate: number; // corporate tax, e.g. 0.15 for 15%
  irRate: number; // employee income tax, e.g. 0.10 for 10%
  patenteRate: number; // e.g. 0.05
  beverageTaxRate: number; // e.g. 0.02
  cnssRate: number; // employee payroll CNSS rate, e.g. 0.0448
  amoRate: number; // employee payroll AMO rate, e.g. 0.0226
}

export interface FullSaaSSnapshot {
  establishment: EstablishmentInfo;
  revenues: RevenueTransaction[];
  expenses: ExpenseTransaction[];
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  employees: Employee[];
  payrollList: Payroll[];
  stockItems: StockItem[];
  stockLedger: StockLedger[];
  taxSettings: TaxSettings;
}

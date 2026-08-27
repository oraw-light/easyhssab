import React, { useState } from 'react';
import { Employee, Payroll, TaxSettings } from '../types';
import { Users, UserPlus, ShieldCheck, DollarSign, ListOrdered, Receipt, Trash2, CheckCircle2 } from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  payrollList: Payroll[];
  taxSettings: TaxSettings;
  currency: string;
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onDeleteEmployee: (id: string) => void;
  onAddPayroll: (payroll: Omit<Payroll, 'id'>) => void;
  language: 'FR' | 'EN' | 'AR';
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  payrollList,
  taxSettings,
  currency,
  onAddEmployee,
  onDeleteEmployee,
  onAddPayroll,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'payroll' | 'ledger'>('directory');
  
  // State for Add Employee form
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [cnss, setCnss] = useState(true);
  const [amo, setAmo] = useState(true);

  // State for process payroll form
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('2026-07');
  const [prime, setPrime] = useState('');

  const handleAddEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !baseSalary) return;
    
    onAddEmployee({
      name,
      role,
      phone: phone || '+212 600 00 00 00',
      joinDate: new Date().toISOString().split('T')[0],
      baseSalary: parseFloat(baseSalary),
      cnssRegistered: cnss,
      amoRegistered: amo,
      activeConges: 0
    });

    // Reset Form
    setName('');
    setRole('');
    setPhone('');
    setBaseSalary('');
    setCnss(true);
    setAmo(true);
  };

  const handleAddPayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !payrollMonth) return;

    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    const base = emp.baseSalary;
    const extra = prime ? parseFloat(prime) : 0;
    
    // Auto-calculates deductions based on settings
    const cnssDeduction = emp.cnssRegistered ? parseFloat((base * taxSettings.cnssRate).toFixed(2)) : 0;
    const amoDeduction = emp.amoRegistered ? parseFloat((base * taxSettings.amoRate).toFixed(2)) : 0;
    const netPaid = parseFloat((base + extra - cnssDeduction - amoDeduction).toFixed(2));

    // Prevent duplicates for same employee and month in dummy UI
    if (payrollList.some(p => p.employeeId === selectedEmpId && p.month === payrollMonth)) {
      alert(language === 'FR' ? 'Un bulletin de paie existe déjà pour cet employé ce mois-ci.' : 'A payslip already exists for this employee for this month.');
      return;
    }

    onAddPayroll({
      date: new Date().toISOString().split('T')[0],
      employeeId: selectedEmpId,
      employeeName: emp.name,
      baseSalary: base,
      prime: extra,
      cnssDeduction,
      amoDeduction,
      netPaid,
      month: payrollMonth
    });

    // Reset Form
    setPrime('');
    setSelectedEmpId('');
  };

  // Calculations for dashboard
  const totalSalaries = employees.reduce((sum, e) => sum + e.baseSalary, 0);
  const totalCNSSPaid = payrollList.reduce((sum, p) => sum + p.cnssDeduction, 0);
  const totalAMOPaid = payrollList.reduce((sum, p) => sum + p.amoDeduction, 0);
  const totalNetSalaryPaid = payrollList.reduce((sum, p) => sum + p.netPaid, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">
            {language === 'FR' ? 'Masse Salariale' : 'Total Base Payroll'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#1A1A1A] mt-2">
            {currency}{totalSalaries.toLocaleString()} <span className="text-xs text-[#8C7B6E]">/ mois</span>
          </h4>
          <span className="text-[10px] font-bold text-green-700 mt-1">
            {employees.length} {language === 'FR' ? 'employés actifs' : 'active staff'}
          </span>
        </div>

        <div className="bg-[#F3F1ED] p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">
            {language === 'FR' ? 'Déductions CNSS' : 'CNSS Contributions'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#1A1A1A] mt-2">
            {currency}{totalCNSSPaid.toLocaleString()}
          </h4>
          <span className="text-[10px] font-bold text-[#8C7B6E] mt-1">
            {language === 'FR' ? `Taux : ${(taxSettings.cnssRate * 100).toFixed(2)}% sur salaire de base` : `Rate: ${(taxSettings.cnssRate * 100).toFixed(2)}%`}
          </span>
        </div>

        <div className="bg-[#1A1A1A] text-white p-5 rounded-3xl shadow-[3px_3px_0px_0px_rgba(196,164,132,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#AFA9A0]">
            {language === 'FR' ? 'Déductions AMO' : 'AMO Contributions'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#C4A484] mt-2">
            {currency}{totalAMOPaid.toLocaleString()}
          </h4>
          <span className="text-[10px] font-bold text-[#AFA9A0] mt-1">
            {language === 'FR' ? `Taux : ${(taxSettings.amoRate * 100).toFixed(2)}%` : `Rate: ${(taxSettings.amoRate * 100).toFixed(2)}%`}
          </span>
        </div>

        <div className="bg-[#C4A484] text-[#1A1A1A] p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1A1A1A]/70">
            {language === 'FR' ? 'Salaires Nets Versés' : 'Net Salaries Disbursed'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#1A1A1A] mt-2">
            {currency}{totalNetSalaryPaid.toLocaleString()}
          </h4>
          <span className="text-[10px] font-bold text-[#1A1A1A]/70 mt-1">
            {language === 'FR' ? 'Cumul historique des bulletins' : 'Cumulative payslip ledger sum'}
          </span>
        </div>
      </div>

      {/* Main Panel Box */}
      <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
        {/* Tab Selection Row */}
        <div className="flex border-b-2 border-[#1A1A1A] bg-[#F9F8F6]">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-r-2 border-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directory' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Users className="w-4 h-4" />
            {language === 'FR' ? 'Répertoire des Employés' : 'Staff Directory'}
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-r-2 border-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payroll' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            {language === 'FR' ? 'Émettre Paie (Bulletins)' : 'Process Monthly Payroll'}
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ledger' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            {language === 'FR' ? 'Historique des Salaires' : 'Payroll Ledger'}
          </button>
        </div>

        {/* Directory Tab */}
        {activeTab === 'directory' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Column */}
              <div className="bg-[#F3F1ED] p-5 rounded-2xl border-2 border-[#1A1A1A] space-y-4 h-fit">
                <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#C4A484]" />
                  {language === 'FR' ? 'Nouvel Employé' : 'Add New Employee'}
                </h4>
                
                <form onSubmit={handleAddEmpSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Nom complet' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., Youssef El Alami"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#C4A484] font-medium text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Rôle / Poste' : 'Job Role'}
                    </label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      placeholder="e.g., Barista, Serveur, Gérant"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#C4A484] font-medium text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'N° Téléphone' : 'Phone'}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+212 600 00 00 00"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#C4A484] font-medium text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Salaire de Base Brut (DH)' : 'Base Gross Salary (DH)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="3120" // Moroccan SMIG is approx 3120 DH
                      value={baseSalary}
                      onChange={e => setBaseSalary(e.target.value)}
                      placeholder="e.g., 4000"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#C4A484] font-medium text-[#1A1A1A]"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1A1A1A]">
                      <input
                        type="checkbox"
                        checked={cnss}
                        onChange={e => setCnss(e.target.checked)}
                        className="w-4 h-4 accent-[#1A1A1A]"
                      />
                      <span>{language === 'FR' ? 'Enregistré à la CNSS' : 'Registered in CNSS'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1A1A1A]">
                      <input
                        type="checkbox"
                        checked={amo}
                        onChange={e => setAmo(e.target.checked)}
                        className="w-4 h-4 accent-[#1A1A1A]"
                      />
                      <span>{language === 'FR' ? 'Assuré AMO (Maladie)' : 'Enrolled in AMO'}</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] py-2.5 font-extrabold uppercase text-xs tracking-wider rounded-xl border-2 border-[#1A1A1A] transition cursor-pointer mt-2"
                  >
                    {language === 'FR' ? 'Enregistrer l\'employé' : 'Enroll Employee'}
                  </button>
                </form>
              </div>

              {/* Directory List Table */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                      <th className="py-3 px-4">{language === 'FR' ? 'Nom' : 'Name'}</th>
                      <th className="py-3 px-4">{language === 'FR' ? 'Rôle' : 'Role'}</th>
                      <th className="py-3 px-4">{language === 'FR' ? 'Téléphone' : 'Phone'}</th>
                      <th className="py-3 px-4 text-right">{language === 'FR' ? 'Base Brut' : 'Base Gross'}</th>
                      <th className="py-3 px-4 text-center">CNSS / AMO</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">{emp.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200 font-semibold text-[#1A1A1A]">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-500">{emp.phone}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#1A1A1A]">
                          {currency}{emp.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                              emp.cnssRegistered ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              CNSS
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                              emp.amoRegistered ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              AMO
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onDeleteEmployee(emp.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition border border-transparent hover:border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400 italic">
                          {language === 'FR' ? 'Aucun employé enregistré.' : 'No employees enrolled yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Issue Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="p-6 max-w-xl mx-auto space-y-6">
            <div className="bg-[#F3F1ED] p-6 rounded-2xl border-2 border-[#1A1A1A] space-y-4">
              <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-green-700" />
                {language === 'FR' ? 'Émettre un bulletin de paie' : 'Process Pay Slip'}
              </h4>
              <p className="text-xs text-[#8C7B6E] font-medium leading-relaxed">
                {language === 'FR'
                  ? 'Générez un bulletin de paie certifié. Le système calculera automatiquement les prélèvements marocains légaux (CNSS et AMO) basés sur l\'état d\'enregistrement de l\'employé.'
                  : 'Log monthly compensation. Dues for CNSS & AMO social security allocations will be automatically calculated.'}
              </p>

              <form onSubmit={handleAddPayrollSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                    {language === 'FR' ? 'Sélectionner l\'employé' : 'Select Employee'}
                  </label>
                  <select
                    required
                    value={selectedEmpId}
                    onChange={e => setSelectedEmpId(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#C4A484] font-bold text-[#1A1A1A]"
                  >
                    <option value="">-- {language === 'FR' ? 'Choisir' : 'Choose'} --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role} - Base: {currency}{emp.baseSalary})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Mois de Paie' : 'Payroll Month'}
                    </label>
                    <input
                      type="month"
                      required
                      value={payrollMonth}
                      onChange={e => setPayrollMonth(e.target.value)}
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs font-bold outline-none text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Prime de Rendement (DH)' : 'Bonus / Prime (DH)'}
                    </label>
                    <input
                      type="number"
                      value={prime}
                      onChange={e => setPrime(e.target.value)}
                      placeholder="e.g., 300"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                    />
                  </div>
                </div>

                <div className="bg-white border-[1.5px] border-[#1A1A1A]/10 p-4 rounded-xl text-[11px] font-semibold text-[#1A1A1A] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#8C7B6E]">{language === 'FR' ? 'Taux Cotisation CNSS Employé' : 'CNSS Employee Rate'}</span>
                    <span>{(taxSettings.cnssRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B6E]">{language === 'FR' ? 'Taux Cotisation AMO Employé' : 'AMO Employee Rate'}</span>
                    <span>{(taxSettings.amoRate * 100).toFixed(2)}%</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedEmpId}
                  className="w-full bg-green-800 hover:bg-[#1A1A1A] text-white py-3 font-extrabold uppercase text-xs tracking-wider rounded-xl transition cursor-pointer"
                >
                  {language === 'FR' ? 'Générer et Enregistrer le Bulletin' : 'Generate & Pay Slip'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Ledger Tab */}
        {activeTab === 'ledger' && (
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                  <th className="py-3 px-4">{language === 'FR' ? 'Employé' : 'Employee'}</th>
                  <th className="py-3 px-4">{language === 'FR' ? 'Mois' : 'Month'}</th>
                  <th className="py-3 px-4 text-right">{language === 'FR' ? 'Salaire Base' : 'Base Salary'}</th>
                  <th className="py-3 px-4 text-right">{language === 'FR' ? 'Prime' : 'Prime'}</th>
                  <th className="py-3 px-4 text-right">CNSS Ded.</th>
                  <th className="py-3 px-4 text-right">AMO Ded.</th>
                  <th className="py-3 px-4 text-right bg-green-50 text-green-800">{language === 'FR' ? 'Net Payé' : 'Net Disbursed'}</th>
                  <th className="py-3 px-4 text-center">{language === 'FR' ? 'Statut' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {payrollList.map(pay => (
                  <tr key={pay.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">{pay.employeeName}</td>
                    <td className="py-3 px-4 font-bold text-gray-500">{pay.month}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-600">{currency}{pay.baseSalary.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-green-700">+{currency}{pay.prime.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-red-600">-{currency}{pay.cnssDeduction.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-red-600">-{currency}{pay.amoDeduction.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-black bg-green-50 text-green-900">
                      {currency}{pay.netPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-md text-[9px] font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {language === 'FR' ? 'PAYÉ' : 'PAID'}
                      </span>
                    </td>
                  </tr>
                ))}
                {payrollList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400 italic">
                      {language === 'FR' ? 'Aucun bulletin de paie historique.' : 'No payslips logged in historical records.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

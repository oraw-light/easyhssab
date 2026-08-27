import { Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { requireEstablishment } from '@/lib/establishment';
import { addEmployee, deleteEmployee, runPayroll } from '@/actions/employees';

export default async function EmployeesPage() {
  const establishment = await requireEstablishment();
  const employees = await db.employee.findMany({
    where: { establishmentId: establishment.id },
    include: { payrolls: { orderBy: { date: 'desc' }, take: 1 } },
    orderBy: { name: 'asc' },
  });
  const currency = establishment.currency;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-black">Employés & Paie</h2>

      <form action={addEmployee} className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Nom
          <input type="text" name="name" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Poste
          <input type="text" name="role" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Téléphone
          <input type="text" name="phone" className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Date d&apos;embauche
          <input type="date" name="joinDate" required defaultValue={new Date().toISOString().split('T')[0]} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Salaire de base ({currency})
          <input type="number" step="0.01" name="baseSalary" required className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <div className="col-span-full flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#8C7B6E]">
              <input type="checkbox" name="cnssRegistered" defaultChecked className="w-4 h-4" /> CNSS
            </label>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#8C7B6E]">
              <input type="checkbox" name="amoRegistered" defaultChecked className="w-4 h-4" /> AMO
            </label>
          </div>
          <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2.5 px-6 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition">
            Ajouter
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-black text-sm">{emp.name}</div>
                <div className="text-[10px] text-[#8C7B6E] font-bold uppercase">{emp.role}</div>
              </div>
              <form action={deleteEmployee}>
                <input type="hidden" name="id" value={emp.id} />
                <button type="submit" className="text-[#8C7B6E] hover:text-red-600 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
            <div className="text-xs font-bold text-[#1A1A1A]">Salaire: {currency}{emp.baseSalary.toLocaleString()}</div>
            {emp.payrolls[0] && (
              <div className="text-[10px] text-[#8C7B6E] font-bold">Dernière paie ({emp.payrolls[0].month}): net {currency}{emp.payrolls[0].netPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            )}
            <form action={runPayroll} className="flex gap-1.5">
              <input type="hidden" name="employeeId" value={emp.id} />
              <input type="number" step="0.01" name="prime" placeholder="Prime" className="border border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[10px] w-20" />
              <button type="submit" className="bg-[#F3F1ED] border border-[#1A1A1A] rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase hover:bg-[#C4A484] transition">Exécuter la paie</button>
            </form>
          </div>
        ))}
        {employees.length === 0 && (
          <div className="col-span-full p-8 text-center text-[#8C7B6E] font-bold bg-white rounded-3xl border-2 border-[#1A1A1A]">Aucun employé enregistré.</div>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Activity, DollarSign, CreditCard, Package, Users, Truck, Percent, FileText, Settings, RefreshCw } from 'lucide-react';
import { signOut } from '../../actions/auth';
import MobileNavToggle from './_components/MobileNavToggle';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Activity },
  { href: '/revenues', label: 'Revenus', icon: DollarSign },
  { href: '/expenses', label: 'Dépenses', icon: CreditCard },
  { href: '/stock', label: 'Stocks', icon: Package },
  { href: '/employees', label: 'Employés & Paie', icon: Users },
  { href: '/suppliers', label: 'Fournisseurs', icon: Truck },
  { href: '/tax', label: 'Moteur Fiscal', icon: Percent },
  { href: '/reports', label: 'Rapports', icon: FileText },
  { href: '/settings', label: 'Paramètres', icon: Settings },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navLinks = (
    <nav className="p-4 space-y-1 text-xs font-bold uppercase tracking-wider">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all text-[#AFA9A0] hover:bg-neutral-900 hover:text-white"
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const signOutButton = (
    <form action={signOut} className="p-6 border-t border-white/10">
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 hover:bg-[#C4A484] hover:text-[#1A1A1A] text-white text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Déconnexion
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] antialiased font-sans flex flex-col lg:flex-row">
      <aside className="bg-[#1A1A1A] text-white flex flex-col shrink-0 lg:w-72 lg:justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-[#1A1A1A]">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3">
          <h1 className="font-serif font-black text-base tracking-wide flex items-center gap-1">
            EasyHssab <span className="text-[9px] bg-[#C4A484] text-[#1A1A1A] px-1 py-0.5 rounded font-black tracking-normal">SaaS</span>
          </h1>
          <MobileNavToggle nav={<>{navLinks}{signOutButton}</>} />
        </div>

        <div className="hidden lg:block">{navLinks}</div>
        <div className="hidden lg:block">{signOutButton}</div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-8 overflow-y-auto overflow-x-hidden max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

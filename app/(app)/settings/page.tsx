import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { requireEstablishment } from '@/lib/establishment';
import { updateEstablishment } from '@/actions/settings';
import { getSectorById } from '@/src/utils/sectorsConfig';

export default async function SettingsPage() {
  const establishment = await requireEstablishment();
  const sector = getSectorById(establishment.sector);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-black">Paramètres</h2>

      <form action={updateEstablishment} className="bg-white p-6 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Nom de l&apos;établissement
          <input type="text" name="name" required defaultValue={establishment.name} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Devise
          <input type="text" name="currency" required defaultValue={establishment.currency} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E] sm:col-span-2">
          Adresse
          <input type="text" name="address" required defaultValue={establishment.address} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Ville
          <input type="text" name="ville" required defaultValue={establishment.ville} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Commune
          <input type="text" name="commune" required defaultValue={establishment.commune} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Téléphone
          <input type="text" name="phone" required defaultValue={establishment.phone} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          ICE
          <input type="text" name="ice" required defaultValue={establishment.ice} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Identifiant Fiscal (IF)
          <input type="text" name="ifNum" required defaultValue={establishment.ifNum} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#8C7B6E]">
          Numéro de Patente
          <input type="text" name="patenteNum" required defaultValue={establishment.patenteNum} className="border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2.5 px-6 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition">
            Enregistrer
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-3xl border-2 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] space-y-3">
        <h4 className="text-sm font-black uppercase text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Zone Sensible
        </h4>
        <p className="text-xs text-[#8C7B6E] font-medium leading-relaxed">
          Secteur actuel : <span className="font-bold text-[#1A1A1A]">{sector.labelFR}</span>. Changer de secteur régénère toutes les données de démonstration (revenus, dépenses, stock, employés, fournisseurs) et supprime définitivement les données actuelles.
        </p>
        <Link
          href="/onboarding"
          className="inline-block bg-red-600 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2.5 px-6 hover:bg-red-700 transition"
        >
          Changer de secteur
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useActionState } from 'react';
import { Upload } from 'lucide-react';

type ImportAction = (formData: FormData) => Promise<{ error?: string; imported?: number }>;

export default function CsvImportForm({ action, columns }: { action: ImportAction; columns: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; imported?: number } | null, formData: FormData) => action(formData),
    null,
  );

  return (
    <form action={formAction} className="bg-[#F3F1ED] p-4 rounded-2xl border-2 border-dashed border-[#8C7B6E] flex flex-wrap items-center gap-3">
      <Upload className="w-4 h-4 text-[#8C7B6E] shrink-0" />
      <div className="text-[10px] font-bold text-[#8C7B6E] flex-1 min-w-[180px]">
        Import CSV en masse — colonnes: <span className="font-mono">{columns}</span>
      </div>
      <input type="file" name="file" accept=".csv,text/csv" required className="text-xs" />
      <button
        type="submit"
        disabled={pending}
        className="bg-[#1A1A1A] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl py-2 px-4 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition disabled:opacity-50"
      >
        {pending ? 'Import...' : 'Importer'}
      </button>
      {state?.error && <div className="w-full text-xs font-bold text-red-600">{state.error}</div>}
      {state?.imported !== undefined && <div className="w-full text-xs font-bold text-green-700">{state.imported} lignes importées.</div>}
    </form>
  );
}

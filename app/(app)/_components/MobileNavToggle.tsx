'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileNavToggle({ nav }: { nav: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="lg:hidden shrink-0 p-2 rounded-xl border border-white/20 text-white hover:bg-white/10 transition"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="lg:hidden" onClick={() => setOpen(false)}>
          {nav}
        </div>
      )}
    </>
  );
}

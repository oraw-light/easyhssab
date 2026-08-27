'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn } from '../../../actions/auth';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, {});

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6">
      <form
        action={formAction}
        className="bg-white p-8 rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] w-full max-w-sm space-y-4"
      >
        <h1 className="font-serif font-black text-xl text-[#1A1A1A]">EasyHssab</h1>
        <p className="text-xs text-[#8C7B6E] font-semibold uppercase tracking-wide">Connexion</p>

        {state?.error && (
          <p className="text-xs font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl px-3 py-2">
            {state.error}
          </p>
        )}

        <div>
          <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">Mot de passe</label>
          <input
            type="password"
            name="password"
            required
            className="w-full bg-[#F3F1ED] border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] py-2.5 font-extrabold uppercase text-xs tracking-wider rounded-xl border-2 border-[#1A1A1A] transition cursor-pointer disabled:opacity-50"
        >
          {pending ? 'Connexion...' : 'Se connecter'}
        </button>

        <p className="text-[10px] text-[#8C7B6E] text-center">
          Pas de compte ? <Link href="/signup" className="font-bold text-[#1A1A1A] underline">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}

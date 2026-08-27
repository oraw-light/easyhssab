'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../lib/supabase/server';

export async function signIn(prevState: unknown, formData: FormData): Promise<{ error?: string; message?: string }> {
  const supabase = await createClient();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect('/dashboard');
}

export async function signUp(prevState: unknown, formData: FormData): Promise<{ error?: string; message?: string }> {
  const supabase = await createClient();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  // Email confirmation is enabled on the project: signUp succeeds but returns no
  // active session until the user clicks the confirmation link — don't redirect yet.
  if (!data.session) {
    return { message: 'Compte créé. Vérifiez votre email pour confirmer votre compte avant de vous connecter.' };
  }

  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

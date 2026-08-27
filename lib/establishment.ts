import { redirect } from 'next/navigation';
import { db } from './db';
import { createClient } from './supabase/server';
import { DEMO_USER_ID } from './demoUser';

/** Loads the establishment for the signed-in user (or the demo user, since login is bypassed), or sends to onboarding if none exists yet. */
export async function requireEstablishment() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER_ID;

  const establishment = await db.establishment.findUnique({ where: { userId } });
  if (!establishment) redirect('/onboarding');

  return establishment;
}

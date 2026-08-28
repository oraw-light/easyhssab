import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only, service-role client. Bypasses RLS.
 * Login is bypassed in this app (demo user, no auth.uid()), so server actions
 * and Server Components need a privileged client to read/write establishment
 * data — the same trust boundary the old direct-Postgres Prisma connection had.
 * Never import this from client components or expose the key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

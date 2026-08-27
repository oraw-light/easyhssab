import { NextResponse, type NextRequest } from 'next/server';

/** Login is bypassed — every request passes through as the demo user (see lib/demoUser.ts). */
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/analyze|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

import type { SessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'finance.session',
  ttl: 60 * 60 * 24,
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession() {
  const coo = await cookies();
  return await getIronSession<any>(coo, sessionOptions);
}
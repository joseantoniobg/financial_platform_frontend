import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  const session = await getSession();

  session.user = {
    token: ''
  };
  await session.save();

  return response;
}

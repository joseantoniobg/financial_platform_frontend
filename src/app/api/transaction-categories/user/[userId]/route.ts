import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  const sessionUser = session.user;
  const token = sessionUser?.token;
  
  try {
    const res = await fetch(`${BACKEND_URL}/transactions/categories/user/${(await params).userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching transaction categories' },
      { status: 500 }
    );
  }
}

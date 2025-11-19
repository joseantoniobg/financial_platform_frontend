import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;
    const userId = (await params).userId;

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/patrimony/properties/user/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Erro ao criar imóvel' }, { status: 500 });
  }
}

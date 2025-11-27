import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  const token = session.user?.token;
  const userId = (await params).userId;

  try {
    const res = await fetch(`${BACKEND_URL}/financial-goals/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Erro ao buscar objetivos financeiros' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  const token = session.user?.token;
  const userId = (await params).userId;

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/financial-goals/user/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Erro ao criar objetivo financeiro' },
      { status: 500 }
    );
  }
}

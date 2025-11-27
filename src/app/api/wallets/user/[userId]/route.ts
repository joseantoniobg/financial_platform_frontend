import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getSession();
    const token = session.user?.token;
    if (!token) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const { userId } = await params;
    const response = await fetch(`${BACKEND_URL}/wallets/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Wallets fetch error:', error);
    return NextResponse.json({ message: 'Erro ao buscar carteiras' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getSession();
    const token = session.user?.token;
    if (!token) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/wallets/user/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Wallet create error:', error);
    return NextResponse.json({ message: 'Erro ao criar carteira' }, { status: 500 });
  }
}

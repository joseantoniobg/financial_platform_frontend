import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;
    if (!token) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    // Support userId query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const url = userId 
      ? `${backendUrl}/transaction-types-users?userId=${userId}`
      : `${backendUrl}/transaction-types-users`;

    const response = await fetch(url, {
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
    console.error('User transaction types fetch error:', error);
  return NextResponse.json({ message: 'Erro ao buscar sub-categorias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;
    if (!token) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${backendUrl}/transaction-types-users`, {
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
  console.error('User transaction type create error:', error);
  return NextResponse.json({ message: 'Erro ao criar sub-categoria' }, { status: 500 });
  }
}

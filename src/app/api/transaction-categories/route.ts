import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;

    if (!token) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/categories`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction categories fetch error:', error);
    return NextResponse.json({ message: 'Erro ao buscar categorias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;

    if (!token) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });

    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json(data, { status: response.status });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction categories create error:', error);
    return NextResponse.json({ message: 'Erro ao criar categoria' }, { status: 500 });
  }
}

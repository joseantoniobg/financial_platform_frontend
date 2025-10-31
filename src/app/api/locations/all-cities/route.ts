import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado - faça login novamente' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/locations/cities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar cidades' },
        { status: response.status }
      );
    }

    const cities = await response.json();
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching all cities:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  const sessionUser = session.user;
  const token = sessionUser?.token;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const response = await fetch(`${backendUrl}/locations/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

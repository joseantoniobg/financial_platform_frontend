import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type RouteContext<T> = {
  params: Promise<T>;
};

// GET /api/dependents/user/[userId] - Get all dependents for a user (Admin/Consultor)
export async function GET(
  request: Request,
  { params }: RouteContext<{ userId: string }>
) {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;
    
    const { userId } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/dependents/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar dependentes' },
      { status: 500 }
    );
  }
}

// POST /api/dependents/user/[userId] - Create dependent for a user (Admin/Consultor)
export async function POST(
  request: Request,
  { params }: RouteContext<{ userId: string }>
) {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;

  try {
    const body = await request.json();
    const { userId } = await params;

    const res = await fetch(`${BACKEND_URL}/dependents/user/${userId}`, {
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
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar dependente' },
      { status: 500 }
    );
  }
}

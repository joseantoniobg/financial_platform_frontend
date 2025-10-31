import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const sessionUser = session.user;
  const token = sessionUser?.token;

  if (!token) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${backendUrl}/transaction-types-users/${id}`, {
      method: 'PUT',
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
    console.error('User transaction type update error:', error);
    return NextResponse.json({ message: 'Erro ao atualizar sub-categoria' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const sessionUser = session.user;
  const token = sessionUser?.token;

  if (!token) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const response = await fetch(`${backendUrl}/transaction-types-users/${id}`, {
      method: 'DELETE',
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
    console.error('User transaction type delete error:', error);
    return NextResponse.json({ message: 'Erro ao remover sub-categoria' }, { status: 500 });
  }
}

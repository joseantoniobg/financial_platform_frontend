import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// PUT /api/dependents/[id] - Update dependent (Admin/Consultor)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;

  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/dependents/${params.id}`, {
      method: 'PUT',
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
      { message: 'Erro ao atualizar dependente' },
      { status: 500 }
    );
  }
}

// DELETE /api/dependents/[id] - Delete dependent (Admin/Consultor)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;

  try {
    const res = await fetch(`${BACKEND_URL}/dependents/${params.id}`, {
      method: 'DELETE',
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
      { message: 'Erro ao deletar dependente' },
      { status: 500 }
    );
  }
}

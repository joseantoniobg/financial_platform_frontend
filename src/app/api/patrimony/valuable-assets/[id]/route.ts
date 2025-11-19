import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const token = session.user?.token;
  const id = (await params).id;

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/patrimony/valuable-assets/${id}`, {
      method: 'PUT',
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
    return NextResponse.json({ message: 'Erro ao atualizar bem de valor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const token = session.user?.token;
  const id = (await params).id;

  try {
    const res = await fetch(`${BACKEND_URL}/patrimony/valuable-assets/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Erro ao deletar bem de valor' }, { status: 500 });
  }
}

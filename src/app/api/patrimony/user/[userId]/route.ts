import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;
    const userId = (await params).userId;

  try {
    const res = await fetch(`${BACKEND_URL}/patrimony/user/${userId}`, {
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
      { message: 'Erro ao buscar patrimônio' },
      { status: 500 }
    );
  }
}

import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const queryParams = date ? `?date=${date}` : '';

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/services/${id}/pricing${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Pricing fetch error:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar precificações' },
      { status: 500 }
    );
  }
}

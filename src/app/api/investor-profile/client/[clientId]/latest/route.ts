import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;

    if (!token) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { clientId } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/investor-profile/client/${clientId}/latest`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 404 || response.status === 204) {
      return NextResponse.json(null);
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Erro ao buscar questionário' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching client latest questionnaire:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar questionário do cliente' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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

    const res = await fetch(`${API_URL}/investor-profile/my-questionnaires`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao buscar histórico' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching questionnaire history:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}

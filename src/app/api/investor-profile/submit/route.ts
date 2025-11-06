import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const res = await fetch(`${API_URL}/investor-profile/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao enviar respostas' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    return NextResponse.json(
      { message: 'Erro ao enviar respostas' },
      { status: 500 }
    );
  }
}

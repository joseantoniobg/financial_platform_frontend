import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
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

    const res = await fetch(`${API_URL}/investor-profile/latest`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 404 || res.status === 204) {
      return NextResponse.json(null);
    }

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao buscar perfil' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching latest profile:', error);
    return NextResponse.json(null);
  }
}

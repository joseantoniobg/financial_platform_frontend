import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
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

    const { assignmentId } = await params;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/services/assign/${assignmentId}`,
      {
        method: 'DELETE',
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
    console.error('Assignment removal error:', error);
    return NextResponse.json(
      { message: 'Erro ao remover atribuição' },
      { status: 500 }
    );
  }
}

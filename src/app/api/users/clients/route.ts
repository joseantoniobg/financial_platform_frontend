import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Get all users and filter by Cliente role on frontend
    // Backend doesn't have a specific endpoint for clients only
    const queryParams = new URLSearchParams();
    queryParams.append('page', '1');
    queryParams.append('limit', '100'); // Get more users for selection
    if (search) queryParams.append('search', search);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users?${queryParams.toString()}`,
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

    // Filter only clients (users with Cliente role)
    // Backend returns { users, total }, not { data }
    type UserShape = { roles?: Array<{ name?: string }> };

    const users = (data.users ?? []) as UserShape[];

    const clients = users.filter((user) =>
      Array.isArray(user.roles) && user.roles.some((role) => role?.name === 'Cliente')
    );

    return NextResponse.json({ data: clients, total: clients.length });
  } catch (error) {
    console.error('Clients fetch error:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
}

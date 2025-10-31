import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { getSession } from '@/lib/session';

interface JWTPayload {
  username: string;
  sub: string;
  name: string;
  roles: Array<{ id: number; name: string }>;
  iat?: number;
  exp?: number;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const sessionUser = session.user;
    const token = sessionUser?.token;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'No token found' },
        { status: 401 }
      );
    }

    // Decode and verify token
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return NextResponse.json(
        { authenticated: false, message: 'Token expired' },
        { status: 401 }
      );
    }

    // Return user data
    const userData = {
      username: decoded.username,
      sub: decoded.sub,
      name: decoded.name,
      roles: decoded.roles,
    };

    return NextResponse.json(
      { authenticated: true, user: userData },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}

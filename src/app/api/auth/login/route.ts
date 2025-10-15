import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface JWTPayload {
  username: string;
  sub: string;
  name: string;
  roles: Array<{ id: number; name: string }>;
  iat?: number;
  exp?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      clientId: body.login,
      clientSecret: body.password,
    });
    
    const token = response.data.access_token;
    const mustChangePassword = response.data.mustChangePassword;
    
    // Decode JWT to get user data
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Create response with user data only (no token exposed)
    const userData = {
      username: decoded.username,
      sub: decoded.sub,
      name: decoded.name,
      roles: decoded.roles,
    };
    
    // Create response
    const res = NextResponse.json(
      { user: userData, mustChangePassword, success: true },
      { status: 200 }
    );
    
    // Set HTTP-only cookie with JWT token (not accessible from JavaScript)
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour (match JWT expiration)
      path: '/',
    });
    
    return res;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Login failed', success: false },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { message: 'An error occurred during login', success: false },
      { status: 500 }
    );
  }
}

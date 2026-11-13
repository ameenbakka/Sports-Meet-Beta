import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Delete the cookie with exact options matching login
  response.cookies.set('sports_meet_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const loginUrl = new URL('/login', url.origin);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.set('sports_meet_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

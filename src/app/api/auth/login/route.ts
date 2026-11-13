import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { ensureInitialized } from '@/lib/seed';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await ensureInitialized();

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({
      username: cleanUsername,
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      clubId: user.clubId ? user.clubId.toString() : undefined,
      name: user.name,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl: user.role === 'ADMIN' ? '/admin' : '/club',
    });

    response.cookies.set('sports_meet_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { ensureInitialized } from '@/lib/seed';
import { comparePassword, hashPassword, signToken } from '@/lib/auth';

function isUserAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'TENANT_ADMIN' || role === 'SUPER_ADMIN';
}

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

    // Query user case-insensitively
    let user = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
      isActive: true,
    });

    // Special fallback for default admin: if username is admin and password is Admin@123
    if (cleanUsername === 'admin' && password === 'Admin@123') {
      if (!user) {
        const passwordHash = await hashPassword('Admin@123');
        user = await User.create({
          username: 'admin',
          name: 'Sports Council Administrator',
          role: 'ADMIN',
          passwordHash,
          isActive: true,
        });
      } else {
        // Ensure role is normalized to ADMIN and password hash matches
        const isMatch = await comparePassword(password, user.passwordHash);
        if (!isMatch || user.role !== 'ADMIN') {
          user.role = 'ADMIN';
          user.passwordHash = await hashPassword('Admin@123');
          await user.save();
        }
      }
    } else {
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
    }

    const isAdmin = isUserAdmin(user.role);

    // If admin has a legacy role, normalize to ADMIN
    if (isAdmin && user.role !== 'ADMIN') {
      user.role = 'ADMIN';
      await user.save();
    }

    const sessionPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: isAdmin ? ('ADMIN' as const) : ('CLUB_MANAGER' as const),
      clubId: user.clubId ? user.clubId.toString() : undefined,
      name: user.name,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl: isAdmin ? '/admin' : '/club',
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

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { UserRole } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'sports-meet-super-secret-jwt-key-2024';

export interface AuthSession {
  userId: string;
  username: string;
  role: UserRole;
  clubId?: string;
  name: string;
  tenantId?: string;
  tenantSlug?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(session: AuthSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('sports_meet_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function isAdminRole(role?: string): boolean {
  return role === 'ADMIN' || role === 'TENANT_ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdmin(role?: string): boolean {
  return role === 'SUPER_ADMIN';
}

export function generateRandomPassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

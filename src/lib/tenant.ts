import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Tenant, ITenant } from '@/lib/models/Tenant';
import mongoose from 'mongoose';

/**
 * Extracts the tenant slug from a hostname.
 * Examples:
 * - farook.kalolsavam.online -> 'farook'
 * - farook.localhost:3000 -> 'farook'
 * - kalolsavam.online -> null (root domain)
 * - www.kalolsavam.online -> null (root domain)
 * - localhost:3000 -> null (root domain)
 */
export function getTenantSlugFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;

  // Remove port if present
  const host = hostHeader.split(':')[0].toLowerCase();

  // Root domains that should NOT be treated as tenants
  const rootDomains = [
    'localhost',
    '127.0.0.1',
    'kalolsavam.online',
    'www.kalolsavam.online',
  ];

  // If exact match with a root domain
  if (rootDomains.includes(host)) {
    return null;
  }

  // Check if ending with .kalolsavam.online
  if (host.endsWith('.kalolsavam.online')) {
    const slug = host.replace('.kalolsavam.online', '');
    if (slug === 'www' || !slug) return null;
    return slug;
  }

  // Check if ending with .localhost (e.g. farook.localhost)
  if (host.endsWith('.localhost')) {
    const slug = host.replace('.localhost', '');
    if (slug === 'www' || !slug) return null;
    return slug;
  }

  // Check if Vercel preview domain (e.g. *.vercel.app)
  if (host.endsWith('.vercel.app')) {
    // If it has multiple subdomains e.g. farook.sportsmeet.vercel.app
    const parts = host.split('.');
    if (parts.length > 3) {
      return parts[0];
    }
    return null;
  }

  // Fallback for custom school domains if any, or first segment of multi-segment host
  const parts = host.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }

  return null;
}

/**
 * Retrieves the current tenant based on incoming request headers (x-tenant-slug or host).
 */
export async function getCurrentTenant(): Promise<ITenant | null> {
  try {
    const headerList = await headers();
    let slug = headerList.get('x-tenant-slug');

    if (!slug) {
      const host = headerList.get('host');
      slug = getTenantSlugFromHost(host);
    }

    if (!slug) {
      return null;
    }

    await connectDB();
    const tenant = await Tenant.findOne({ slug: slug.toLowerCase() }).lean();
    return tenant as unknown as ITenant | null;
  } catch (err) {
    console.error('Error fetching current tenant:', err);
    return null;
  }
}

/**
 * Retrieves a tenant by slug.
 */
export async function getTenantBySlug(slug: string): Promise<ITenant | null> {
  if (!slug) return null;
  await connectDB();
  const tenant = await Tenant.findOne({ slug: slug.toLowerCase(), status: 'ACTIVE' }).lean();
  return tenant as unknown as ITenant | null;
}

/**
 * Retrieves a tenant by ID.
 */
export async function getTenantById(id: string | mongoose.Types.ObjectId): Promise<ITenant | null> {
  if (!id) return null;
  await connectDB();
  const tenant = await Tenant.findById(id).lean();
  return tenant as unknown as ITenant | null;
}

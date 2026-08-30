import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/user/User';

export async function getCurrentUser() {
  await connectDB();

  const cookieStore = await cookies();

  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);

    const user = await User.findById(payload.userId)
      .select('_id name email role permissions status')
      .lean();

    if (!user || user.status !== 'active') {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function hasPermission(permission: string) {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  // Admin has access to everything
  if (user.role === 'admin') {
    return true;
  }

  return (user.permissions || []).includes(permission);
}

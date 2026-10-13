import { isObjectIdOrHexString } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const token = await getAuthCookie();
  if (!token) return false;

  const decoded = await verifyToken(token);
  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    !('adminId' in decoded) ||
    typeof decoded.adminId !== 'string' ||
    !isObjectIdOrHexString(decoded.adminId)
  ) {
    return false;
  }

  await connectDB();
  return Boolean(await Admin.exists({ _id: decoded.adminId }));
}

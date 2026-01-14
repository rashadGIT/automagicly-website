import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

// Create handler at request time to ensure env vars are available
// Lazy initialization prevents NextAuth from reading env vars at module load
const handler = async (req: Request, context: any) => {
  const nextAuthHandler = NextAuth(getAuthOptions());
  return nextAuthHandler(req, context);
};

export { handler as GET, handler as POST };

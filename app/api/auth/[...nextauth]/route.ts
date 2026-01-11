import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

// Initialize NextAuth with options at request time (not build time)
// This ensures environment variables are available from process.env
const handler = NextAuth(getAuthOptions());

export { handler as GET, handler as POST };

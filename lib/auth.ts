import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@automagicly.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Get admin credentials from environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) {
          // Admin credentials not configured
          return null;
        }

        // Check if email matches
        if (credentials.email !== adminEmail) {
          return null;
        }

        // Verify password against hash
        const passwordValid = await compare(credentials.password, adminPasswordHash);

        if (!passwordValid) {
          return null;
        }

        // Return user object (will be stored in session)
        return {
          id: '1',
          email: adminEmail,
          name: 'Admin',
          role: 'admin', // Add role for authorization checks
        };
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30)
    updateAge: 24 * 60 * 60, // Update session every 24 hours (idle timeout)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role || 'user'; // Store role in JWT
        token.iat = Math.floor(Date.now() / 1000); // Track last activity
      }

      // Check for idle timeout (24 hours of inactivity)
      const now = Math.floor(Date.now() / 1000);
      const lastActivity = token.iat as number || now;
      const idleTimeout = 24 * 60 * 60; // 24 hours

      if (now - lastActivity > idleTimeout) {
        // Session expired due to inactivity - return minimal token to trigger logout
        // NextAuth will handle the cleanup when it detects an invalid token
        return {} as typeof token;
      }

      // Update last activity timestamp
      token.iat = now;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        (session.user as any).role = token.role as string; // Include role in session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

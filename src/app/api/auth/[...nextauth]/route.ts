import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { UserType } from "@/contexts/AuthContextWithNextAuth";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user in the database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log('Usuário não encontrado:', credentials.email);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log('Senha inválida para usuário:', credentials.email);
            return null;
          }

          console.log('Login bem-sucedido para usuário:', user.email, 'Tipo:', user.type);

          // Return user without password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            type: user.type,
          };
        } catch (error) {
          console.error('Erro durante autenticação:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user type to token when signing in
      if (user) {
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user type to session
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.type = token.type as UserType;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
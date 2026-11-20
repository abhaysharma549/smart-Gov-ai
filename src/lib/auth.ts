import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { userStore } from "@/lib/user-store";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: "ADMIN" | "CITIZEN" | "OFFICER";
      registrationNumber?: string;
      designation?: string;
      departmentId?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: "ADMIN" | "CITIZEN" | "OFFICER";
    registrationNumber?: string;
    designation?: string;
    departmentId?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CITIZEN" | "OFFICER";
    registrationNumber?: string;
    designation?: string;
    departmentId?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Registration Number", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawIdentifier = (credentials?.identifier || credentials?.email) as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!rawIdentifier || !password) {
          return null;
        }

        // 1. Check userStore (local secure persistent store with 3 authorized admins)
        const user = userStore.findByIdentifier(rawIdentifier);
        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          registrationNumber: user.registrationNumber,
          designation: user.designation,
          departmentId: null,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.registrationNumber = user.registrationNumber;
        token.designation = user.designation;
        token.departmentId = user.departmentId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.registrationNumber = token.registrationNumber;
        session.user.designation = token.designation;
        session.user.departmentId = token.departmentId ?? null;
      }
      return session;
    },
  },
});

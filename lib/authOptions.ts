import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, User, Session } from "next-auth"; 
import { JWT } from "next-auth/jwt"; 

// Extend Session type to include custom id property
declare module "next-auth" {
  interface Session {
    id: string;
    user: {
      id: string;
      email: string;
      role: string;
      name: string;
    }
    token: string;
  }

  interface User {
    id: string;
    email: string;
    role: string;
    name: string;
    token: string;
  }
}

async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const responseText = await res.text();

    if (res.ok) {
      const data = JSON.parse(responseText);
      return {
        id: data.user.id.toString(),
        email: data.user.email,
        name: `${data.user.firstName} ${data.user.lastName}`,
        role: data.user.role,
        token: data.token,
      };
    }
  } catch (error) {
    console.error("Authentication error:", error);
  }
  return null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          return await authenticateUser(credentials.email, credentials.password);
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 3600,
  },
  jwt: {
    maxAge: 3600,
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.id = token.id as string;
        session.user = {
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
          name: token.name as string,
        };
        session.token = token.accessToken as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

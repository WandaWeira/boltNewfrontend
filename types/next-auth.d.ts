// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: string;
    name: string;
    token: string;
  }

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
}

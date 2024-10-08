import NextAuth from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';

const handlers = NextAuth(authOptions);

export {handlers as GET, handlers as POST, handlers as PUT, handlers as DELETE, handlers as PATCH};

import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

import { incrementSignInCount, incrementSessionRefreshCount } from './utils/cloud/redisRestClient';


/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
/*
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
};
*/

export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.email) {
        console.error("Email is required for sign in");
        return false; // Prevent sign-in
      }
      const dateKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      await incrementSignInCount(user.email, dateKey);
      return true;
    },
    async session({ session, token }) {
      const userId = token.sub ?? 'default-sub-value';

      // Extend session object here
      session.user = {
        ...session.user,
        id: userId,
      };

      // Assuming the email is stored in the token and not directly in the session.user object
      if (!token?.email) {
        console.error("Email is required for session handling");
        // Modify the session object as needed or return a modified session
        // For example, you might want to set a flag indicating an incomplete session
        session.error = "Email is missing";
        return session; // Return the modified session
      }
      const dateKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      await incrementSessionRefreshCount(token.email, dateKey);

      return session;
    },
    // Add other callbacks with async as needed
  },
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  // ... other options if any
};


/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);

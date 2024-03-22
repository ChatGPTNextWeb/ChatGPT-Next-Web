import NextAuth from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    FacebookProvider({
      clientId: process.env.IDAPPFB as string,
      clientSecret: process.env.IDAPPSECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
});

export { handler as GET, handler as POST };

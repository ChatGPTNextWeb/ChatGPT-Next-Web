import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions, getServerSession } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { NextRequest, NextResponse } from "next/server";
import { CustomToken } from "./[...nextauth]/typing";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: { scope: "openid api://chewbacca/.default offline_access" },
      },
      idToken: true,
    }),
  ],

  // TO ENV
  jwt: { secret: process.env.JWT_COOKIE_SECRET },
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, account }) {
      const customToken = token as CustomToken;
      if (account) {
        customToken.access_token = account.access_token;
        customToken.refresh_token = account.refresh_token;
        customToken.expiry = account.expires_at ?? Date.now() + 30 * 60 * 1000;
        customToken.refresh_expiry = Date.now() + 24 * 60 * 60 * 1000;
      } else if (customToken.expiry && Date.now() > customToken.expiry) {
        const refreshedToken: CustomToken | undefined =
          await refreshAccessToken(customToken);
        return refreshedToken ?? customToken;
      }
      return customToken;
    },

    async session({ session, token }) {
      const customToken = token as CustomToken;
      if (session) {
        session = Object.assign({}, session, {
          refresh_token_expiry: customToken.refresh_expiry,
          access_token: customToken.access_token,
        });
      }
      return session;
    },
  },
};

export async function getProperServerSession(
  req: NextRequest,
  res: NextResponse,
) {
  return await getServerSession(
    req as unknown as NextApiRequest,
    {
      ...res,
      getHeader: (name: string) => res.headers?.get(name),
      setHeader: (name: string, value: string) => res.headers?.set(name, value),
    } as unknown as NextApiResponse,
    authOptions,
  );
}

async function refreshAccessToken(
  token: CustomToken,
): Promise<CustomToken | undefined> {
  const refreshToken = token.refresh_token;
  if (!refreshToken) {
    // If there is no refresh token, you can't refresh the access token.
    return token;
  }

  // Make a request to your Azure AD token endpoint to refresh the access token
  const tokenEndpoint = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/token`;

  const requestBody = new URLSearchParams();
  requestBody.append("grant_type", "refresh_token");
  requestBody.append("refresh_token", refreshToken);
  requestBody.append("client_id", process.env.AZURE_AD_CLIENT_ID ?? "");
  requestBody.append("client_secret", process.env.AZURE_AD_CLIENT_SECRET ?? "");
  requestBody.append("scope", "openid api://chewbacca/.default");

  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody.toString(),
    });
    if (response.ok) {
      const data = await response.json();
      // Update the token with the new access token and possibly a new refresh token
      token.access_token = data.access_token;
      token.expiry = data.expires_at ?? Date.now() + 30 * 60 * 1000; //expires after 30 minutes
      if (data.refresh_token) {
        token.refresh_token = data.refresh_token;
        token.refresh_expiry = Date.now() + 24 * 60 * 60 * 1000;
      }
      return token;
    } else {
      console.error("Failed to refresh access token:", response.statusText);
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
}

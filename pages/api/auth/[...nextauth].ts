import NextAuth from 'next-auth'
import Okta from 'next-auth/providers/okta'

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        Okta({
            clientId: process.env.OKTA_OAUTH2_CLIENT_ID as string,
            clientSecret: process.env.OKTA_OAUTH2_CLIENT_SECRET as string,
            issuer: process.env.OKTA_OAUTH2_ISSUER as string,
        }),
    ],
    secret: process.env.SECRET as string
}

export default NextAuth(authOptions)
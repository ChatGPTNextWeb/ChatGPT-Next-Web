import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import Okta from "next-auth/providers/okta"

const options = {
    providers: [
        Okta({
            clientId: process.env.OKTA_OAUTH2_CLIENT_ID as string,
            clientSecret: process.env.OKTA_OAUTH2_CLIENT_SECRET as string,
            issuer: process.env.OKTA_OAUTH2_ISSUER as string,
        }),
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID as string,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET as string,
            tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID as string,
        }),
    ],
    secret: process.env.SECRET as string,
}

export default NextAuth(options)

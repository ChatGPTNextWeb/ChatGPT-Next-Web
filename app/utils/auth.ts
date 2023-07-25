import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import { USER_TOKEN, getJwtSecretKey } from './constants'

interface UserJwtPayload {
  jti: string
  iat: number
}

export class AuthError extends Error {}

/**
 * Verifies the user's JWT token and returns its payload if it's valid.
 */
export async function verifyAuth(req: NextRequest) {
  const token = req.cookies.get(USER_TOKEN)?.value

  if (!token) throw new AuthError('Missing user token')

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    )
    return verified.payload as UserJwtPayload
  } catch (err) {
    throw new AuthError('Your token has expired.')
  }
}


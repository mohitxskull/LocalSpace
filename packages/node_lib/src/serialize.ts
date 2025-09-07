import { AccessToken } from '@adonisjs/auth/access_tokens'
import { DateTime } from 'luxon'

export const serializeAccessToken = (accessToken: AccessToken) => {
  return {
    type: 'bearer',
    value: accessToken.value!.release(),
    expiresAt: accessToken.expiresAt ? DateTime.fromJSDate(accessToken.expiresAt).toISO() : null,
  }
}

export function serializeDateTime(dt: DateTime<true>): string
export function serializeDateTime(dt: DateTime<true> | null): string | null
export function serializeDateTime(dt: any): any {
  if (dt instanceof DateTime) {
    if (!dt.isValid) {
      throw new Error('Invalid DateTime')
    }

    return dt.toISO()
  } else {
    return null
  }
}

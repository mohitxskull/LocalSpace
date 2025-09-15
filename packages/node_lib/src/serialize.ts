import { DateTime } from 'luxon'

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

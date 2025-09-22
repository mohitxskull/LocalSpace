/**
 * Parses a nested property from an object.
 */
const getNestedProperty = (data: unknown, key: string): unknown => {
  if (data === null || typeof data !== 'object') {
    return undefined
  }

  try {
    // Attempt direct access if no dots
    if (!key.includes('.')) {
      return (data as Record<string, unknown>)[key]
    }

    return key.split('.').reduce((acc: any, part) => {
      if (acc === null || typeof acc !== 'object' || !Object.hasOwn(acc, part)) {
        return undefined
      }
      return acc[part]
    }, data)
  } catch (error) {
    // Catch potential type errors during property access.
    return undefined
  }
}

/**
 * Interpolates values inside double curly braces.
 * Supports escaping with backslashes.
 *
 * Example:
 * interpolate('hello {{ username }}', { username: 'skull' }) // 'hello skull'
 * interpolate('hello \\{{ username }}', { username: 'skull' }) // 'hello {{ username }}'
 * interpolate('{{ user.profile.name }}', { user: { profile: { name: 'Skull' } } }) // 'Skull'
 * interpolate('{{ user.profile.age }}', { user: { profile: { name: 'Skull' } } }) // undefined
 */
export const interpolate = (input: string, data: unknown): string => {
  if (typeof input !== 'string') {
    return '' // Or throw an error, depending on your needs.
  }
  return input.replace(/(\\)?{{(.*?)}}/g, (_, escapeChar, key) => {
    if (escapeChar) {
      return `{{${key}}}`
    }

    const value = getNestedProperty(data, key.trim())

    return value !== undefined && value !== null ? String(value) : ''
  })
}

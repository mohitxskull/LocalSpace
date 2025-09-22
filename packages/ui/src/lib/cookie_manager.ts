import { getCookie, setCookie, deleteCookie, type OptionsType } from 'cookies-next'

/**
 * A type-safe, centralized manager for handling browser cookies.
 * It maps abstract keys to actual cookie names for consistency and easy refactoring.
 *
 * @template CookieKeys - An object mapping descriptive keys to cookie string names.
 */
export class CookieManager<CookieKeys extends Record<string, string>> {
  // Encapsulate properties to prevent external modification
  private readonly cookieKeys: CookieKeys
  private readonly defaultOptions?: OptionsType

  /**
   * Initializes the CookieManager.
   * @param {object} params - The initialization parameters.
   * @param {CookieKeys} params.cookieKeys - A map of descriptive names to cookie keys.
   * @param {OptionsType} [params.defaultOptions] - Default options to apply to all `setCookie` calls.
   */
  constructor(params: { cookieKeys: CookieKeys; defaultOptions?: OptionsType }) {
    this.cookieKeys = params.cookieKeys
    this.defaultOptions = params.defaultOptions
  }

  /**
   * Retrieves a cookie value as a string.
   * @param {keyof CookieKeys} key - The descriptive key of the cookie.
   * @param {OptionsType} [options] - Optional server-side context (req, res).
   * @returns {string | null} The cookie value or null if not found.
   */
  public getCookie = (key: keyof CookieKeys, options?: OptionsType): string | null => {
    const cookieValue = getCookie(this.cookieKeys[key], options)

    // The library can return string, boolean, or undefined. We only want strings.
    if (typeof cookieValue === 'string') {
      return cookieValue
    }

    return null
  }

  /**
   * Retrieves and parses a JSON cookie value into a specific type.
   * @template T - The expected type of the parsed JSON object.
   * @param {keyof CookieKeys} key - The descriptive key of the cookie.
   * @param {OptionsType} [options] - Optional server-side context (req, res).
   * @returns {T | null} The parsed object or null if the cookie doesn't exist or parsing fails.
   */
  public getParsedCookie = <T>(key: keyof CookieKeys, options?: OptionsType): T | null => {
    const cookieValue = this.getCookie(key, options)
    if (!cookieValue) {
      return null
    }

    try {
      return JSON.parse(cookieValue) as T
    } catch (error) {
      console.error(`Failed to parse cookie "${String(key)}":`, error)
      return null
    }
  }

  /**
   * Sets a cookie's value. Merges provided options with default options.
   * @param {keyof CookieKeys} key - The descriptive key of the cookie.
   * @param {string | object} value - The value to set. Objects will be stringified.
   * @param {OptionsType} [options] - Per-call cookie options (e.g., maxAge, path).
   */
  public setCookie = (
    key: keyof CookieKeys,
    value: string | object,
    options?: OptionsType
  ): void => {
    const valueToSet = typeof value === 'string' ? value : JSON.stringify(value)

    // Merge default options with per-call options
    const finalOptions = { ...this.defaultOptions, ...options }

    setCookie(this.cookieKeys[key], valueToSet, finalOptions)
  }

  /**
   * Deletes a cookie.
   * @param {keyof CookieKeys} key - The descriptive key of the cookie.
   * @param {OptionsType} [options] - Per-call options, useful for specifying path/domain.
   */
  public removeCookie = (key: keyof CookieKeys, options?: OptionsType): void => {
    const finalOptions = { ...this.defaultOptions, ...options }
    deleteCookie(this.cookieKeys[key], finalOptions)
  }
}

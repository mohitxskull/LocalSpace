import { LucidRow } from '@adonisjs/lucid/types/model'
import { serializeDateTime } from './serialize.js'

export abstract class BaseTransformer<TR extends LucidRow> {
  constructor(protected readonly resource: TR) {}

  /**
   * The primary method to transform the resource into a plain
   * JSON-serializable object.
   *
   * This method can be synchronous or asynchronous.
   */
  abstract serialize(): Promise<Record<string, unknown>>

  /**
   * Creates a new object containing only the specified keys from the source object.
   *
   * @param source The source object (usually `this.resource`).
   * @param keys An array of keys to pick.
   */
  protected pick<T extends object, K extends keyof T>(source: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>
    for (const key of keys) {
      if (key in source) {
        result[key] = source[key]
      }
    }
    return result
  }

  /**
   * Creates a new object omitting the specified keys from the source object.
   *
   * @param source The source object (usually `this.resource`).
   * @param keys An array of keys to omit.
   */
  protected omit<T extends object, K extends keyof T>(source: T, keys: K[]): Omit<T, K> {
    const result = { ...source }
    for (const key of keys) {
      delete (result as any)[key]
    }
    return result
  }

  protected datetime = serializeDateTime
}

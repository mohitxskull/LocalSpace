import { LucidRow } from '@adonisjs/lucid/types/model'
import { serializeDateTime } from './serialize.js'

/**
 * An abstract base class for creating data transformers for Lucid models.
 * Transformers are used to shape the model's data for API responses,
 * ensuring a consistent and controlled output.
 *
 * @template TR - The type of the Lucid model instance (`LucidRow`).
 */
export abstract class BaseTransformer<TR extends LucidRow> {
  /**
   * Creates an instance of the BaseTransformer.
   *
   * @param resource - The Lucid model instance to be transformed.
   */
  constructor(protected readonly resource: TR) {}

  /**
   * The primary method to transform the resource into a plain
   * JSON-serializable object.
   *
   * This method must be implemented by subclasses.
   */
  abstract serialize(): Promise<Record<string, unknown>>

  /**
   * Creates a new object containing only the specified keys from the source object.
   *
   * @param source - The source object (usually `this.resource`).
   * @param keys - An array of keys to pick.
   * @returns A new object with only the picked properties.
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
   * @param source - The source object (usually `this.resource`).
   * @param keys - An array of keys to omit.
   * @returns A new object with the specified properties omitted.
   */
  protected omit<T extends object, K extends keyof T>(source: T, keys: K[]): Omit<T, K> {
    const result = { ...source }
    for (const key of keys) {
      delete (result as any)[key]
    }
    return result
  }

  /**
   * A utility method to serialize a `DateTime` object to an ISO string.
   * Handles null values gracefully.
   */
  protected datetime = serializeDateTime
}

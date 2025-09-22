import { CacheProvider } from '@adonisjs/cache/types'
import { BaseModel } from '@adonisjs/lucid/orm'

/**
 * An abstract base class for creating model-specific caching services.
 * It provides a structured way to manage caching logic for a Lucid model,
 * including namespacing and easy access to the cache provider.
 *
 * @template T - The type of the Lucid model (e.g., `typeof User`).
 * @template Spaces - A string literal type for allowed sub-namespaces.
 */
export abstract class BaseCacher<T extends typeof BaseModel, Spaces extends string = 'self'> {
  /** The Lucid model class associated with this cacher. */
  readonly model: T

  /** The base cache provider, namespaced for the model. */
  readonly #space: CacheProvider

  /**
   * Returns a namespaced cache provider. This can be the base model's namespace,
   * a sub-namespace, or a namespace for a specific model instance.
   *
   * @param params - Optional parameters for further namespacing.
   * @param params.namespace - A specific sub-namespace to use.
   * @param params.id - An ID to create a namespace for a specific model instance.
   * @returns A `CacheProvider` instance.
   *
   * @example
   * // Get the base space for the model
   * cacher.space()
   *
   * // Get a space for a specific sub-category
   * cacher.space({ namespace: 'active' })
   *
   * // Get a space for a specific user instance
   * cacher.space({ id: '123' })
   */
  space(params?: { namespace?: Spaces; id?: string }): CacheProvider {
    const baseSpace = params?.namespace ? this.#space.namespace(params.namespace) : this.#space

    return params?.id ? baseSpace.namespace(params.id) : baseSpace
  }

  /**
   * Creates an instance of the BaseCacher.
   *
   * @param model - The Lucid model class.
   * @param space - The AdonisJS cache provider, typically namespaced for the model.
   */
  constructor(model: T, space: CacheProvider) {
    this.model = model
    this.#space = space
  }
}

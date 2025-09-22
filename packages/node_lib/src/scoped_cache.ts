import { CacheProvider, GetSetFactory, SetCommonOptions } from '@adonisjs/cache/types'

/**
 * Configuration options for creating a `ScopedCache` instance.
 */
export type ScopedCacheOptions<T> = {
  /** The unique key for this cache scope. */
  key: string
  /** The factory function to generate the value if it's not in the cache. */
  factory: GetSetFactory<T>
  /** A reference to the parent cache, used for creating hierarchies. */
  parent?: ScopedCache<any>
} & SetCommonOptions

/**
 * The default internal key used to store the value within a namespace.
 * This is an implementation detail and should not be relied upon by consumers.
 * @internal
 */
const DEFAULT_KEY = 'D0'

/**
 * A type-safe, hierarchical cache manager that simplifies working with namespaced keys.
 * Each instance of ScopedCache manages a single value within its own namespace
 * and can be extended to create child caches in nested namespaces.
 *
 * @template T The type of the data being cached.
 */
export class ScopedCache<T> {
  /** The unique key for this cache instance, defining its namespace. */
  public readonly key: string

  /** The namespaced cache provider this instance operates on. */
  public readonly space: CacheProvider

  /** Default options for cache operations (ttl, grace period, etc.). */
  public readonly options: SetCommonOptions

  /** A reference to the parent ScopedCache instance, if this is a child. */
  public readonly parent?: ScopedCache<any>

  /** The internal factory function to generate the value. */
  readonly #factory: GetSetFactory<T>

  private constructor(space: CacheProvider, params: ScopedCacheOptions<T>) {
    const { key, factory, parent, ...options } = params

    this.key = key
    this.options = options
    this.parent = parent
    this.#factory = factory

    // Each instance gets its own namespace based on its key.
    this.space = space.namespace(key)
  }

  /**
   * A static factory method to create a new root ScopedCache instance.
   * Provides a cleaner entry point than using the constructor directly.
   *
   * @param space The base cache provider (e.g., `cache.driver()`).
   * @param params Configuration for the cache instance.
   */
  static create<T>(space: CacheProvider, params: ScopedCacheOptions<T>): ScopedCache<T> {
    return new ScopedCache<T>(space, params)
  }

  /**
   * Retrieves the value from the cache. If the value does not exist,
   * it is generated using the factory, stored in the cache, and then returned.
   *
   * @param options.latest If true, it will force a refresh by deleting the key before fetching.
   * @returns The cached or newly generated value.
   */
  async get(options?: { latest?: boolean }): Promise<T> {
    if (options?.latest) {
      await this.delete()
    }

    return this.space.getOrSet({
      key: DEFAULT_KEY,
      factory: this.#factory,
      ...this.options,
    })
  }

  /**
   * Retrieves the value from the cache without triggering the factory if it's missing.
   * This is useful for checking the existence of a value without causing a potentially
   * expensive factory execution.
   *
   * @returns The cached value or `undefined` if it does not exist.
   */
  async peek(): Promise<T | undefined> {
    return await this.space.get<T>({
      key: DEFAULT_KEY,
    })
  }

  /**
   * Manually sets or overwrites the value in the cache.
   * This bypasses the factory and directly stores the provided value.
   *
   * @param value The value to store in the cache.
   */
  async set(value: T): Promise<void> {
    await this.space.set({
      key: DEFAULT_KEY,
      value,
      ...this.options,
    })
  }

  /**
   * Creates a new child ScopedCache in a nested namespace that depends on the parent's data.
   * The child's factory receives the parent's resolved value.
   *
   * @template U The data type of the new child cache.
   * @param key The key for the child cache, which will be nested under the parent's key.
   * @param factory A factory function that receives the parent's value and returns the child's value.
   * @param options Optional cache settings to override the parent's options for this child.
   * @returns A new ScopedCache instance for the child.
   */
  extend<U>(
    key: string,
    factory: (parentValue: T) => U | Promise<U>,
    options?: SetCommonOptions
  ): ScopedCache<U> {
    return new ScopedCache<U>(this.space, {
      key: key,
      // The child's factory first gets the parent's value, then transforms it.
      factory: async () => {
        const parentValue = await this.get()
        return factory(parentValue)
      },
      parent: this,
      ...this.options, // Inherit parent options
      ...options, // Override with specific child options
    })
  }

  /**
   * Creates a new child ScopedCache in a nested namespace that is logically grouped
   * but does not depend on the parent's data.
   *
   * @template U The data type of the new child cache.
   * @param key The key for the child cache.
   * @param factory A standard factory function for the child's value.
   * @param options Optional cache settings to override the parent's options.
   * @returns A new ScopedCache instance for the child.
   */
  derive<U>(key: string, factory: GetSetFactory<U>, options?: SetCommonOptions): ScopedCache<U> {
    return new ScopedCache<U>(this.space, {
      key: key,
      // The factory is passed directly; it has no dependency on the parent.
      factory: factory,
      parent: this,
      ...this.options, // Inherit parent options
      ...options, // Override with specific child options
    })
  }

  /**
   * DANGER: Removes all items from this cache's namespace AND all of its descendants.
   * For example, calling this on a 'user:1' cache will also clear 'user:1:posts'
   * and any other nested caches.
   *
   * If you only want to remove this cache's specific value, use `delete()` instead.
   *
   * @returns A promise that resolves to true on success.
   */
  async clearNamespace() {
    return await this.space.clear()
  }

  /**
   * Deletes this instance's specific value from the cache.
   * This does not affect any child caches.
   *
   * @returns A promise that resolves to true if the key existed and was deleted, false otherwise.
   */
  async delete(): Promise<boolean> {
    return await this.space.delete({
      key: DEFAULT_KEY,
    })
  }

  /**
   * Expires this instance's specific value from the cache. The entry will not be
   * fully deleted but marked as expired, allowing it to be served during a grace period if configured.
   *
   * @returns A promise that resolves to true if the key was expired, false otherwise.
   */
  async expire(): Promise<boolean> {
    return await this.space.expire({
      key: DEFAULT_KEY,
    })
  }
}

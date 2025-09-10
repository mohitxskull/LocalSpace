import { CacheProvider } from '@adonisjs/cache/types'
import { BaseModel } from '@adonisjs/lucid/orm'

export abstract class BaseCacher<
  T extends typeof BaseModel,
  Spaces extends string | undefined = undefined,
> {
  readonly model: T

  readonly #space: CacheProvider

  space(namespace?: Spaces): CacheProvider {
    return namespace ? this.#space.namespace(namespace) : this.#space
  }

  constructor(model: T, space: CacheProvider) {
    this.model = model
    this.#space = space
  }
}

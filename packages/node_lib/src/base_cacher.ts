import { CacheProvider } from '@adonisjs/cache/types'
import { BaseModel } from '@adonisjs/lucid/orm'

export abstract class BaseCacher<T extends typeof BaseModel, Spaces extends string = 'self'> {
  readonly model: T

  readonly #space: CacheProvider

  space(params?: { namespace?: Spaces; id?: string }): CacheProvider {
    const baseSpace = params?.namespace ? this.#space.namespace(params.namespace) : this.#space

    return params?.id ? baseSpace.namespace(params.id) : baseSpace
  }

  constructor(model: T, space: CacheProvider) {
    this.model = model
    this.#space = space
  }
}

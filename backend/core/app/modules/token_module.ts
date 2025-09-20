import { dbRef } from '#database/reference'
import Token from '#models/token'
import User from '#models/user'
import { TokenTypeT } from '#types/literals'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { Secret } from '@adonisjs/core/helpers'
import { QueryClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

export class TokenHolder extends AccessToken {
  declare type: TokenTypeT
  declare identifier: string | number

  constructor(params: {
    id: number
    userId: string
    type: string
    hash: string
    createdAt: DateTime<true>
    updatedAt: DateTime<true>
    lastUsedAt?: DateTime<true>
    expiresAt?: DateTime<true>
    name?: string
    prefix?: string
    secret?: Secret<string>
  }) {
    super({
      identifier: params.id,
      tokenableId: params.userId,
      type: params.type,
      hash: params.hash,
      createdAt: params.createdAt.toJSDate(),
      updatedAt: params.updatedAt.toJSDate(),
      lastUsedAt: params.lastUsedAt?.toJSDate() || null,
      expiresAt: params.expiresAt?.toJSDate() || null,
      name: params.name || null,
      prefix: params.prefix,
      secret: params.secret,
    })
  }

  getValueOrFail() {
    if (!this.value) {
      throw new Error('Access token value is missing')
    }
    return this.value
  }

  serialize() {
    return {
      type: 'bearer',
      value: this.value!.release(),
      expiresAt: this.expiresAt ? DateTime.fromJSDate(this.expiresAt).toISO() : null,
    }
  }

  async delete(options?: { client?: QueryClientContract }) {
    await Token.query({ client: options?.client }).where('id', this.identifier).delete()
  }
}

export default class TokenModule {
  static prefix = 'at_'

  async create(
    params: {
      name?: string
      user: User
      type: TokenTypeT
      expiresIn?: string
    },
    options?: {
      deleteIfExists?: boolean
      client?: QueryClientContract
    }
  ) {
    if (options?.deleteIfExists) {
      const existingToken = await Token.findBy(
        {
          [dbRef.token.tokenableIdC]: params.user.id,
          [dbRef.token.typeC]: params.type,
        },
        {
          client: options?.client,
        }
      )

      if (existingToken) {
        await existingToken.delete()
      }
    }

    const transientToken = AccessToken.createTransientToken(params.user.id, 42, params.expiresIn)

    const dateTimeExpiresAt = transientToken.expiresAt
      ? DateTime.fromJSDate(transientToken.expiresAt)
      : null

    if (dateTimeExpiresAt && !dateTimeExpiresAt.isValid) {
      throw new Error('Invalid expiration date')
    }

    const actionToken = await Token.create(
      {
        [dbRef.token.tokenableIdC]: params.user.id,
        [dbRef.token.typeC]: params.type,
        [dbRef.token.nameC]: params.name,
        [dbRef.token.hashC]: transientToken.hash,
        [dbRef.token.abilitiesC]: JSON.stringify([]),
        [dbRef.token.expiresAtC]: dateTimeExpiresAt,
      },
      {
        client: options?.client,
      }
    )

    return new TokenHolder({
      id: actionToken.id,
      userId: params.user.id,
      type: actionToken.type,
      prefix: TokenModule.prefix,
      secret: transientToken.secret,
      hash: transientToken.hash,
      createdAt: actionToken.createdAt,
      updatedAt: actionToken.updatedAt,
      expiresAt: actionToken.expiresAt || undefined,
    })
  }

  async verify(
    params: { token: string; type: TokenTypeT },
    options?: { client?: QueryClientContract }
  ) {
    const decodedToken = TokenHolder.decode(TokenModule.prefix, params.token)

    if (!decodedToken) {
      return null
    }

    const accessToken = await Token.findBy(
      {
        [dbRef.token.idC]: decodedToken.identifier,
        [dbRef.token.typeC]: params.type,
      },
      {
        client: options?.client,
      }
    )

    if (!accessToken) {
      return null
    }

    accessToken.lastUsedAt = DateTime.now()

    await accessToken.save()

    const accessTokenHolder = new TokenHolder({
      id: accessToken.id,
      userId: accessToken.tokenableId,
      type: accessToken.type,
      prefix: TokenModule.prefix,
      secret: decodedToken.secret,
      hash: accessToken.hash,
      createdAt: accessToken.createdAt,
      updatedAt: accessToken.updatedAt,
      expiresAt: accessToken.expiresAt || undefined,
    })

    if (!accessTokenHolder.verify(decodedToken.secret) || accessTokenHolder.isExpired()) {
      return null
    }

    return accessTokenHolder
  }
}

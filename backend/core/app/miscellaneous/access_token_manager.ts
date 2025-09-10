import { dbRef } from '#database/reference'
import AccessToken from '#models/access_token'
import User from '#models/user'
import { AccessTokenTypeT } from '#types/literals'
import { AccessToken as AccessTokenHolderOriginal } from '@adonisjs/auth/access_tokens'
import { Secret } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'

export class AccessTokenHolder extends AccessTokenHolderOriginal {
  declare type: AccessTokenTypeT

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
}

export class AccessTokenManager {
  static prefix = 'at_'

  static async create(params: {
    name?: string
    user: User
    type: AccessTokenTypeT
    expiresIn?: string
  }) {
    const transientToken = AccessTokenHolderOriginal.createTransientToken(
      params.user.id,
      32,
      params.expiresIn
    )

    const dateTimeExpiresAt = transientToken.expiresAt
      ? DateTime.fromJSDate(transientToken.expiresAt)
      : null

    if (dateTimeExpiresAt && !dateTimeExpiresAt.isValid) {
      throw new Error('Invalid expiration date')
    }

    const actionToken = await AccessToken.create({
      tokenableId: params.user.id,
      type: params.type,
      name: params.name,
      hash: transientToken.hash,
      abilities: '',
      expiresAt: dateTimeExpiresAt,
    })

    return new AccessTokenHolder({
      id: actionToken.id,
      userId: params.user.id,
      type: actionToken.type,
      prefix: this.prefix,
      secret: transientToken.secret,
      hash: transientToken.hash,
      createdAt: actionToken.createdAt,
      updatedAt: actionToken.updatedAt,
      expiresAt: actionToken.expiresAt || undefined,
    })
  }

  static async verify(params: { token: string; type: AccessTokenTypeT }) {
    const decodedToken = AccessTokenHolder.decode(this.prefix, params.token)

    if (!decodedToken) {
      return null
    }

    const accessToken = await AccessToken.findBy({
      [dbRef.accessToken.id]: decodedToken.identifier,
      [dbRef.accessToken.type]: params.type,
    })

    if (!accessToken) {
      return null
    }

    accessToken.lastUsedAt = DateTime.now()

    await accessToken.save()

    const accessTokenHolder = new AccessTokenHolder({
      id: accessToken.id,
      userId: accessToken.tokenableId,
      type: accessToken.type,
      prefix: this.prefix,
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

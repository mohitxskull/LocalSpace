import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import { type ActionTokenTypeT } from '#validators/index'
import User from './user.js'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { Secret } from '@adonisjs/core/helpers'

const PREFIX = 'aat_'

export default class ActionToken extends BaseModel {
  static table = dbRef.actionToken.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare type: ActionTokenTypeT

  @column()
  declare hash: string

  @column.dateTime()
  declare expiresAt: DateTime<true> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  // Hooks =============================

  // Relations =========================

  // Extra =============================

  declare value: Secret<string>

  static async createToken(params: { user: User; type: ActionTokenTypeT; expiresIn?: string }) {
    const transientToken = AccessToken.createTransientToken(params.user.id, 32, params.expiresIn)

    const dateTimeExpiresAt = transientToken.expiresAt
      ? DateTime.fromJSDate(transientToken.expiresAt)
      : null

    if (dateTimeExpiresAt && !dateTimeExpiresAt.isValid) {
      throw new Error('Invalid expiration date')
    }

    const actionToken = await ActionToken.create({
      hash: transientToken.hash,
      type: params.type,
      userId: params.user.id,
      expiresAt: dateTimeExpiresAt,
    })

    const accessToken = new AccessToken({
      identifier: actionToken.id,
      tokenableId: params.user.id,
      type: actionToken.type,
      prefix: PREFIX,
      secret: transientToken.secret,
      name: 'Action Token',
      hash: transientToken.hash,
      abilities: [],
      createdAt: actionToken.createdAt.toJSDate(),
      updatedAt: actionToken.updatedAt.toJSDate(),
      expiresAt: actionToken.expiresAt?.toJSDate() || null,
      lastUsedAt: null,
    })

    actionToken.value = accessToken.value!

    return actionToken
  }

  static async verifyToken(params: { token: string; type: ActionTokenTypeT }) {
    const decodedToken = AccessToken.decode(PREFIX, params.token)

    if (!decodedToken) {
      return null
    }

    const actionToken = await ActionToken.findBy({
      [dbRef.actionToken.id]: decodedToken.identifier,
      [dbRef.actionToken.type]: params.type,
    })

    if (!actionToken) {
      return null
    }

    const accessToken = new AccessToken({
      identifier: actionToken.id,
      tokenableId: actionToken.userId,
      type: actionToken.type,
      prefix: PREFIX,
      secret: decodedToken.secret,
      name: 'Action Token',
      hash: actionToken.hash,
      abilities: [],
      createdAt: actionToken.createdAt.toJSDate(),
      updatedAt: actionToken.updatedAt.toJSDate(),
      expiresAt: actionToken.expiresAt?.toJSDate() || null,
      lastUsedAt: null,
    })

    if (!accessToken.verify(decodedToken.secret) || accessToken.isExpired()) {
      return null
    }

    actionToken.value = accessToken.value!

    return actionToken
  }
}

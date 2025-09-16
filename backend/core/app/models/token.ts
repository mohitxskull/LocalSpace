import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { type TokenTypeT } from '#types/literals'

export default class Token extends BaseModel {
  static table = dbRef.token.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tokenableId: string

  @column()
  declare type: TokenTypeT

  @column()
  declare name: string | null

  @column()
  declare hash: string

  @column()
  declare abilities: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  @column.dateTime()
  declare lastUsedAt: DateTime<true> | null

  @column.dateTime()
  declare expiresAt: DateTime<true> | null

  // Relations =========================

  @belongsTo(() => User, {
    foreignKey: dbRef.token.tokenableIdC,
  })
  declare user: BelongsTo<typeof User>

  // Extras =========================

  isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < DateTime.now() : false
  }
}

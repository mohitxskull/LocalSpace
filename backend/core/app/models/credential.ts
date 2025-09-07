import { BaseModel, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { type CredentialTypeT } from '#validators/index'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export default class Credential extends BaseModel {
  static table = dbRef.credential.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare type: CredentialTypeT

  @column()
  declare identifier: string

  @column({ serializeAs: null })
  declare password: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  @column.dateTime()
  declare usedAt: DateTime<true> | null

  @column.dateTime()
  declare verifiedAt: DateTime<true> | null

  // Hooks =============================

  @beforeSave()
  static async hashPassword(row: Credential) {
    if (row.$dirty.password) {
      row.password = row.password ? await hash.make(row.password) : null
    }
  }

  // Relations =========================

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Extra =============================

  getPasswordOrFail() {
    if (!this.password) {
      throw new Error('Password not found', {
        cause: this.toJSON(),
      })
    }
    return this.password
  }
}

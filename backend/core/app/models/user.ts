import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import {
  AccessToken as AccessTokenHolderOriginal,
  DbAccessTokensProvider,
} from '@adonisjs/auth/access_tokens'
import { dbRef } from '#database/reference'
import { ulid } from '#config/ulid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { UserTransformer } from '#transformers/user'
import Token from './token.js'
import { tokenTypeE, type RoleT } from '#types/literals'
import cache from '@adonisjs/cache/services/main'
import { UserCacher } from '../cacher/user.js'
import WorkspaceMember from './workspace_member.js'
import hash from '@adonisjs/core/services/hash'
import { UserHelper } from '#helper/user'
import { getSetting } from '#util/get_setting'

export default class User extends BaseModel {
  static selfAssignPrimaryKey = true
  static table = dbRef.user.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string | null

  @column()
  declare role: RoleT

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime()
  declare verifiedAt: DateTime<true> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  // Hooks =============================

  @beforeCreate()
  static assignUlid(row: User) {
    row.id = ulid()
  }

  @beforeSave()
  static async hashPassword(row: User) {
    if (row.$dirty.password) {
      row.password = await hash.make(row.password)
    }
  }

  // Relations =========================

  @hasMany(() => Token)
  declare tokens: HasMany<typeof Token>

  @hasMany(() => WorkspaceMember)
  declare workspaceMember: HasMany<typeof WorkspaceMember>

  // Extra =============================

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: getSetting().session.expiresIn,
    type: tokenTypeE('access'),
    table: dbRef.token.table.name,
    tokenSecretLength: 42,
    prefix: 'at_',
  })

  declare currentAccessToken: AccessTokenHolderOriginal

  get transformer() {
    return new UserTransformer(this)
  }

  get helper() {
    return new UserHelper(this)
  }

  static get cacher() {
    return new UserCacher(User, cache.namespace(this.table))
  }
}

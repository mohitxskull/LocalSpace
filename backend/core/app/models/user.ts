import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import {
  AccessToken as AccessTokenHolderOriginal,
  DbAccessTokensProvider,
} from '@adonisjs/auth/access_tokens'
import { dbRef } from '#database/reference'
import { ulid } from '#config/ulid'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import Credential from './credential.js'
import Permission from './permission.js'
import CustomerProfile from './customer_profile.js'
import AdminProfile from './admin_profile.js'
import { UserTransformer } from '#transformers/user'
import { setting } from '#config/setting'
import Token from './token.js'
import { tokenTypeE, type RoleT } from '#types/literals'
import cache from '@adonisjs/cache/services/main'
import { UserCacher } from '../cacher/user.js'
import Workspace from './workspace.js'
import WorkspaceMember from './workspace_member.js'
import Blog from './blog.js'
import riManager from '#services/ri_service'

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  // Hooks =============================

  @beforeCreate()
  static assignUlid(row: User) {
    row.id = ulid()
  }

  // Relations =========================

  @hasMany(() => Credential)
  declare credentials: HasMany<typeof Credential>

  @hasMany(() => Permission)
  declare permissions: HasMany<typeof Permission>

  @hasOne(() => CustomerProfile)
  declare customerProfile: HasOne<typeof CustomerProfile>

  @hasOne(() => AdminProfile)
  declare adminProfile: HasOne<typeof AdminProfile>

  @hasMany(() => Token)
  declare tokens: HasMany<typeof Token>

  @manyToMany(() => Workspace, dbRef.workspaceMember.table.pivot())
  declare workspaces: ManyToMany<typeof Workspace>

  @hasMany(() => WorkspaceMember)
  declare workspaceMember: HasMany<typeof WorkspaceMember>

  @hasMany(() => Blog, {
    foreignKey: dbRef.blog.authorId,
  })
  declare blogs: HasMany<typeof Blog>

  // Extra =============================

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: setting.session.expiresIn,
    type: tokenTypeE('access'),
    table: dbRef.token.table.name,
    tokenSecretLength: 42,
  })

  declare currentAccessToken: AccessTokenHolderOriginal

  get transformer() {
    return new UserTransformer(this)
  }

  static get cacher() {
    return new UserCacher(User, cache.namespace(this.table))
  }

  async hasPermission(ri: string, action: string): Promise<boolean> {
    const permissions = await this.related('permissions').query()
    for (const p of permissions) {
      if (riManager.matches(p.riPattern, ri) && p.actions.includes(action)) {
        return true
      }
    }
    return false
  }
}

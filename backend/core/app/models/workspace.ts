import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import { ulid } from '#config/ulid'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import WorkspaceMember from './workspace_member.js'
import User from './user.js'
import Blog from './blog.js'
import { WorkspaceTransformer } from '#transformers/workspace'
import { WorkspaceCacher } from '#cacher/workspace'
import cache from '@adonisjs/cache/services/main'
import { flattenPermissions } from '@localspace/node-lib'
import riManager from '#services/ri_service'
import { permissionSchema } from '#config/permissions'
import { workspaceMemberRoleE } from '#types/literals'

export default class Workspace extends BaseModel {
  static selfAssignPrimaryKey = true
  static table = dbRef.workspace.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks =============================

  @beforeCreate()
  static assignUlid(row: Workspace) {
    row.id = ulid()
  }

  // Relations =========================

  @hasMany(() => WorkspaceMember)
  declare members: HasMany<typeof WorkspaceMember>

  @manyToMany(
    () => User,
    dbRef.workspaceMember.table.pivot({
      pivotForeignKey: dbRef.workspaceMember.workspaceId,
      pivotRelatedForeignKey: dbRef.workspaceMember.userId,
    })
  )
  declare users: ManyToMany<typeof User>

  @hasMany(() => Blog)
  declare blogs: HasMany<typeof Blog>

  // Extra =============================

  get transformer() {
    return new WorkspaceTransformer(this)
  }

  static get cacher() {
    return new WorkspaceCacher(Workspace, cache.namespace(this.table))
  }

  async isOwner(params: { user: User }) {
    const members = await Workspace.cacher.members({ workspace: this }).get()

    const member = members.find((m) => m.userId === params.user.id)

    if (!member) return false

    return member.role === workspaceMemberRoleE('owner')
  }

  async isMember(params: { user: User }) {
    const members = await Workspace.cacher.members({ workspace: this }).get()

    return members.find((m) => m.userId === params.user.id)
  }

  get permissions() {
    return flattenPermissions({
      permissions: [
        {
          riPattern: riManager.build().workspace(this.id).toString(),
          actions: permissionSchema.workspace.actions,
        },
        {
          riPattern: riManager.build().workspace(this.id).blog('*').toString(),
          actions: permissionSchema.workspace.child.blog.actions,
        },
      ],
    })
  }
}

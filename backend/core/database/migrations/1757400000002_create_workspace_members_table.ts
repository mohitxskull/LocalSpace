import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.workspaceMember.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.string(dbRef.workspaceMember.userId, ULID_LENGTH)
        .notNullable()
        .references(dbRef.user.table.columns('id'))
        .onDelete('CASCADE')

      t.string(dbRef.workspaceMember.workspaceId, ULID_LENGTH)
        .notNullable()
        .references(dbRef.workspace.table.columns('id'))
        .onDelete('CASCADE')

      t.string(dbRef.workspaceMember.role).notNullable()
      t.timestamp(dbRef.workspaceMember.joinedAt).notNullable()

      t.primary([dbRef.workspaceMember.userId, dbRef.workspaceMember.workspaceId])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

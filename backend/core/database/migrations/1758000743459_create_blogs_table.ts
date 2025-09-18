import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.blog.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.string(dbRef.blog.id, ULID_LENGTH).primary().unique().notNullable()

      t.string(dbRef.blog.workspaceId, ULID_LENGTH)
        .notNullable()
        .references(dbRef.workspace.table.columns('id'))
        .onDelete('CASCADE')

      t.string(dbRef.blog.authorId, ULID_LENGTH)
        .nullable()
        .references(dbRef.workspaceMember.table.columns('id'))
        .onDelete('CASCADE')

      t.string(dbRef.blog.title).notNullable()
      t.text(dbRef.blog.content).notNullable()
      t.string(dbRef.blog.status).notNullable()

      t.timestamp(dbRef.blog.createdAt).notNullable()
      t.timestamp(dbRef.blog.updatedAt).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

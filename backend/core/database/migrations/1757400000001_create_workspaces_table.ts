import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.workspace.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.string(dbRef.workspace.id, ULID_LENGTH).primary().unique().notNullable()

      t.string(dbRef.workspace.name).notNullable()

      t.timestamp(dbRef.workspace.createdAt).notNullable()
      t.timestamp(dbRef.workspace.updatedAt).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

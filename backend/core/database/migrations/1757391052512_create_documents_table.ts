import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.document.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments(dbRef.document.id)

      t.string(dbRef.document.userId, ULID_LENGTH)
        .notNullable()
        .references(dbRef.user.table.columns('id'))
        .onDelete('CASCADE')

      t.string(dbRef.document.title, 255).notNullable()

      t.text(dbRef.document.content).notNullable()

      t.timestamp(dbRef.document.createdAt)
      t.timestamp(dbRef.document.updatedAt).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

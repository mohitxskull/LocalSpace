import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.user.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.string(dbRef.user.id, ULID_LENGTH).primary().unique().notNullable()
      t.string(dbRef.user.name).nullable()
      t.string(dbRef.user.role).notNullable()
      t.string(dbRef.user.email).notNullable().unique()
      t.string(dbRef.user.password).notNullable()

      t.timestamp(dbRef.user.verifiedAt).nullable()

      t.timestamp(dbRef.user.createdAt).notNullable()
      t.timestamp(dbRef.user.updatedAt).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

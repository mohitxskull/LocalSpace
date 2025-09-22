import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.rateLimit.table.name

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string(dbRef.rateLimit.key, 255).notNullable().primary()
      table.integer(dbRef.rateLimit.points, 9).notNullable().defaultTo(0)
      table.bigint(dbRef.rateLimit.expire).unsigned()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

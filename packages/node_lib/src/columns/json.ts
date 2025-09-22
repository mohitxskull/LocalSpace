import { ColumnOptions } from '@adonisjs/lucid/types/model'

/**
 * A factory function that creates a configuration for a Lucid column
 * that should be stored as JSON in the database.
 *
 * It automatically handles the serialization (`JSON.stringify`) and
 * deserialization (`JSON.parse`) of the column value.
 *
 * @param options - Optional configuration for the column.
 * @param options.serializer - A custom serializer/deserializer implementation.
 * @returns A partial `ColumnOptions` object with `prepare` and `consume` hooks.
 *
 * @example
 * ```typescript
 * // In a Lucid model
 * import { JSONColumn } from '@localspace/node-lib/column/json'
 *
 * class User extends BaseModel {
 *   @column(JSONColumn())
 *   declare settings: { theme: string; notifications: boolean }
 * }
 * ```
 */
export const JSONColumn = (
  options?:
    | Partial<
        ColumnOptions & {
          serializer?: {
            serialize(value: any): string
            deserialize(value: string): any
          }
        }
      >
    | undefined
): Partial<ColumnOptions> => {
  const { serializer, ...restOptions } = options || {}

  const serialize = serializer?.serialize || JSON.stringify
  const deserialize = serializer?.deserialize || JSON.parse

  return {
    /**
     * The `prepare` hook is called before writing the value to the database.
     * It serializes the object to a JSON string.
     */
    prepare: (value: any) => {
      if (!value) {
        return null
      }

      return serialize(value)
    },

    /**
     * The `consume` hook is called after reading the value from the database.
     * It parses the JSON string back into an object.
     */
    consume: (value: any) => {
      if (!value) {
        return null
      }

      return deserialize(value)
    },

    ...restOptions,
  }
}

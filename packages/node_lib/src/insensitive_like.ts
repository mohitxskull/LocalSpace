/**
 * Generates a case-insensitive SQL LIKE clause for substring matching.
 * This is particularly useful for building `whereRaw` conditions in a Lucid query.
 *
 * It converts both the column and the search value to lowercase and wraps the
 * search value with wildcards (`%`) for partial matching.
 *
 * @param columnName - The name of the database column to search against.
 * @param value - The value to search for within the column.
 * @returns A tuple containing the SQL fragment and its binding parameter.
 * @example
 * // In a Lucid query
 * import { iLike } from '@localspace/node-lib'
 * import { dbRef } from '#database/reference'
 *
 * const users = await User.query()
 *   .whereRaw(...iLike(dbRef.user.name, 'john'))
 *   .exec()
 *
 * // This would generate SQL similar to:
 * // SELECT * FROM "users" WHERE LOWER("name") LIKE '%john%'
 */
export const iLike = (columnName: string, value: string): [string, [string]] => {
  // Ensure the search value is also lowercased to match the LOWER(columnName)
  return [`LOWER(${columnName}) LIKE ?`, [`%${value.toLowerCase()}%`]]
}

/**
 * Generates a case-insensitive SQL LIKE clause for substring matching.
 * Useful for building 'WHERE' conditions in a query.
 *
 * @param columnName - The name of the database column.
 * @param value - The value to search for within the column.
 * @returns A tuple containing the SQL fragment and its parameter.
 * @example
 * const [sql, params] = containsIgnoreCase('name', 'john');
 * // sql: "LOWER(name) LIKE ?"
 * // params: ["%john%"]
 */
export const iLike = (columnName: string, value: string): [string, [string]] => {
  // Ensure the search value is also lowercased to match the LOWER(columnName)
  return [`LOWER(${columnName}) LIKE ?`, [`%${value.toLowerCase()}%`]]
}

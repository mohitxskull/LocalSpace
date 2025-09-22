/**
 * Creates a validator function that ensures a value is one of the provided constants.
 * Throws a descriptive error if the value is invalid.
 *
 * @param constantList A readonly array of allowed values.
 * @returns A function that validates and returns the value, preserving its narrow type.
 */
export const oneOf = <T>(constantList: readonly T[]) => {
  // Create a Set for fast O(1) lookups. This is done only once.
  const validValues = new Set(constantList)

  return <const U extends T>(value: U) => {
    if (!validValues.has(value)) {
      // Throw a more helpful error message for easier debugging.
      const expected = [...validValues].join(', ')
      throw new Error(`Invalid value: "${String(value)}". Expected one of: ${expected}`)
    }
    return value
  }
}

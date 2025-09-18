/**
 * Creates a new array from a constant array of strings, while safely excluding a specified value.
 * This function is type-safe and preserves the literal union type of the remaining elements.
 *
 * @param constantList A readonly array of string literals (e.g., `['a', 'b', 'c'] as const`).
 * @param valueToExclude The specific value to remove from the array.
 * @returns A new array with the value removed, and its type correctly narrowed.
 */
export const exclude = <T extends string, U extends T>(
  constantList: readonly T[],
  valueToExclude: U
): Exclude<T, U>[] => {
  return constantList.filter((item): item is Exclude<T, U> => item !== valueToExclude)
}

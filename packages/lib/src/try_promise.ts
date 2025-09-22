export const tryPromise = async <T>(promise: Promise<T>): Promise<[T, null] | [null, unknown]> => {
  try {
    const result = await promise
    return [result, null]
  } catch (error) {
    return [null, error]
  }
}

/**
 * Asynchronous sleep function using Promises.
 *
 * @param ms The number of milliseconds to sleep.
 * @returns A Promise that resolves after the specified time.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

import { inspect, type InspectOptions } from 'node:util'

/**
 * Logs a variable to the console with deep inspection for enhanced debugging.
 * It uses `node:util.inspect` to provide detailed, colorized output.
 * Crucially, it returns the original variable, allowing for easy inline chaining
 * without disrupting code flow.
 *
 * @template T - The type of the object being logged.
 * @param object - The variable to inspect and log.
 * @param options - Optional configuration for `node:util.inspect`.
 * @returns The original object that was passed in.
 *
 * @example
 * // Basic usage
 * const data = { user: { id: 1, name: 'Alex' } };
 * logDeep(data);
 *
 * // Inline usage without breaking code flow
 * const user = logDeep(await findUser({ id: 123 }));
 *
 * // With custom options
 * logDeep(someComplexObject, { depth: 5 });
 */
export const logDeep = <T>(object: T, options: InspectOptions = {}): T => {
  // Sensible defaults that can be overridden
  const defaultOptions: InspectOptions = {
    depth: 15,
    colors: true,
    showHidden: false,
  }

  console.log(inspect(object, { ...defaultOptions, ...options }))

  // Return the original object to enable chaining
  return object
}

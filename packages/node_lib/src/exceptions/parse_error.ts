import { errors } from '@vinejs/vine'
import { Exception } from '@adonisjs/core/exceptions'
import { HTTPException } from './http_exception.js'
import { ValidationError } from './types.js'
import { InternalServerErrorException, UnprocessableEntityException } from './list.js'

/**
 * Converts various error types into a standardized `HTTPException` instance.
 *
 * This function provides a centralized way to handle different kinds of errors
 * (e.g., from validation, database, or other services) and transform them into
 * a consistent format for uniform error handling and response generation across
 * the application.
 *
 * @param error - The error to be parsed and converted.
 * @returns An `HTTPException` instance appropriate for the input error type.
 *
 * @example
 * ```typescript
 * // In a global exception handler (app/exceptions/handler.ts)
 * import { parseError } from '@localspace/node-lib/exception'
 *
 * async handle(error: unknown, ctx: HttpContext) {
 *   const httpException = parseError(error)
 *   return super.handle(httpException, ctx)
 * }
 * ```
 *
 * It handles the following error types:
 * - `HTTPException`: Returns the exception as-is.
 * - VineJS `E_VALIDATION_ERROR`: Converts to `UnprocessableEntityException` with validation metadata.
 * - AdonisJS `Exception`: Converts to `HTTPException`, preserving status, code, and help messages.
 * - `SyntaxError`: Converts to `InternalServerErrorException`.
 * - Other/unknown errors: Converts to a generic `InternalServerErrorException`.
 */
export const parseError = (error: unknown) => {
  if (error instanceof HTTPException) {
    return error
  } else if (error instanceof errors.E_VALIDATION_ERROR) {
    const messages: ValidationError[] = error.messages

    return new UnprocessableEntityException({
      metadata: messages,
    })
  } else if (error instanceof Exception) {
    // Don't add stack, adonisjs will automatically print the stack
    // of the error which is causing it
    return new HTTPException(error.message, {
      status: error.status,
      code: error.code,
      help: error.help,
      cause: error,
    })
  } else if (error instanceof SyntaxError) {
    return new InternalServerErrorException(error.message, {
      cause: error,
    })
  } else {
    return new InternalServerErrorException({
      cause: error,
    })
  }
}

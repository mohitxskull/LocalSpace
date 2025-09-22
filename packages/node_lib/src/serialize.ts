import { LucidRow, ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { promiseMap } from '@localspace/lib'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

/**
 * Overload for a non-nullable DateTime object.
 * @param dt - The Luxon DateTime object to serialize.
 * @returns An ISO 8601 string representation of the date.
 * @throws Will throw an error if the DateTime object is invalid.
 */
export function serializeDateTime(dt: DateTime<true>): string

/**
 * Overload for a nullable DateTime object.
 * @param dt - The Luxon DateTime object or null.
 * @returns An ISO 8601 string or null.
 */
export function serializeDateTime(dt: DateTime<true> | null): string | null

/**
 * Implementation of the serializeDateTime function.
 * It checks if the input is a DateTime instance and converts it to an ISO string.
 * @param dt - The value to serialize.
 * @returns The serialized value or null.
 */
export function serializeDateTime(dt: any): any {
  if (dt instanceof DateTime) {
    if (!dt.isValid) {
      throw new Error('Invalid DateTime')
    }

    return dt.toISO()
  } else {
    return null
  }
}

/**
 * Serializes a Lucid paginator result into a standardized format for API responses.
 * It applies a transformation function to each item in the paginated data.
 *
 * @template MODAL - The type of the Lucid model.
 * @template TRANSFER - The type of the transformed data.
 * @param paginated - The paginator instance from a Lucid query (`.paginate()`).
 * @param transferFunc - An async function to transform a single model instance.
 * @returns A promise that resolves to an object with `data` and `meta` properties.
 *
 * @example
 * ```typescript
 * const posts = await Post.query().paginate(1, 10)
 * const serialized = await serializePage(posts, (post) => post.transformer.serialize())
 * // serialized format: { data: [...], meta: { ... } }
 * ```
 */
export const serializePage = async <MODAL extends LucidRow, TRANSFER>(
  paginated: ModelPaginatorContract<MODAL>,
  transferFunc: (model: MODAL) => TRANSFER | Promise<TRANSFER>
) => {
  const serialized = paginated.toJSON()

  return {
    data: await promiseMap(serialized.data, async (model) => await transferFunc(model as MODAL)),
    meta: await vine.validate({
      data: serialized.meta,
      schema: vine.object({
        total: vine.number(),
        perPage: vine.number(),
        currentPage: vine.number(),
        lastPage: vine.number(),
        firstPage: vine.number(),
        firstPageUrl: vine.string(),
        lastPageUrl: vine.string(),
        nextPageUrl: vine.string().optional(),
        previousPageUrl: vine.string().nullable(),
      }),
    }),
  }
}

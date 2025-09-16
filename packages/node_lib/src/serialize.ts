import { LucidRow, ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { promiseMap } from '@localspace/lib'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export function serializeDateTime(dt: DateTime<true>): string
export function serializeDateTime(dt: DateTime<true> | null): string | null
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

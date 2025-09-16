import { dbRef } from '#database/reference'
import Permission from '#models/permission'
import User from '#models/user'
import { QueryClientContract } from '@adonisjs/lucid/types/database'
import { promiseMap } from '@localspace/lib'
import { BaseCacher, ScopedCache } from '@localspace/node-lib'

export class UserCacher extends BaseCacher<typeof User> {
  permissions(params: { user: User }, options?: { client?: QueryClientContract }) {
    return ScopedCache.create(this.space({ id: params.user.id }), {
      key: 'permissions',
      factory: async () => {
        const permissions = await Permission.query({ client: options?.client }).where(
          dbRef.permission.userId,
          params.user.id
        )

        return await promiseMap(permissions, async (p) => await p.transformer.serialize())
      },
    })
  }
}

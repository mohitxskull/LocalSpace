import User from '#models/user'
import { BaseCacher, ScopedCache } from '@localspace/node-lib'

export class UserCacher extends BaseCacher<typeof User, 'role'> {
  roles(params: { user: User }) {
    return ScopedCache.create(this.space('role'), {
      key: params.user.id,
      factory: async () => {
        await params.user.load('roles')

        return params.user.roles.map((role) => role.name)
      },
    })
  }
}

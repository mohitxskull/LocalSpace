import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { blogRoutes } from './blog/routes.js'

export const customerWorkspaceRoutes = () => {
  router
    .group(() => {
      router.post('', [() => import('#controllers/customer/workspace/create_controller')])
      router.get('', [() => import('#controllers/customer/workspace/list_controller')])

      router
        .group(() => {
          router.get('', [() => import('#controllers/customer/workspace/show_controller')])
          router.put('', [() => import('#controllers/customer/workspace/update_controller')])
          router.delete('', [() => import('#controllers/customer/workspace/delete_controller')])

          router.post('transfer', [
            () => import('#controllers/customer/workspace/transfer_controller'),
          ])

          router
            .group(() => {
              router.post('', [
                () => import('#controllers/customer/workspace/member/store_controller'),
              ])
              router.delete(':memberId', [
                () => import('#controllers/customer/workspace/member/destroy_controller'),
              ])
            })
            .prefix('member')

          router
            .group(() => {
              router.get(':memberId', [
                () => import('#controllers/customer/workspace/permission/show_controller'),
              ])
              router.put(':memberId', [
                () => import('#controllers/customer/workspace/permission/update_controller'),
              ])
            })
            .prefix('permission')

          blogRoutes()

          router.get('profile', [
            () => import('#controllers/customer/workspace/profile/show_controller'),
          ])
        })
        .prefix(':workspaceId')
    })
    .prefix('workspace')
    .use(middleware.auth({ roles: ['customer'] }))
}

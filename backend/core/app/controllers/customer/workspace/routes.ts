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
                () => import('#controllers/customer/workspace/member/create_controller'),
              ])
              router.put(':memberId', [
                () => import('#controllers/customer/workspace/member/update_controller'),
              ])
              router.delete(':memberId', [
                () => import('#controllers/customer/workspace/member/delete_controller'),
              ])
            })
            .prefix('member')

          blogRoutes()

          router
            .group(() => {
              router.get('', [
                () => import('#controllers/customer/workspace/profile/show_controller'),
              ])
              router.post('leave', [
                () => import('#controllers/customer/workspace/profile/leave_controller'),
              ])
            })
            .prefix('profile')
        })
        .prefix(':workspaceId')
    })
    .prefix('workspace')
    .use(middleware.auth({ roles: ['customer'] }))
}

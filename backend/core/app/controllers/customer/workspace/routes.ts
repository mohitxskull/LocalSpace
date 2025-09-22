import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { blogRoutes } from './blog/routes.js'

export const customerWorkspaceRoutes = () => {
  router
    .group(async () => {
      router
        .post('', [() => import('#controllers/customer/workspace/create_controller')])
        .as('create')
      router.get('', [() => import('#controllers/customer/workspace/list_controller')]).as('list')

      router
        .group(() => {
          router
            .get('', [() => import('#controllers/customer/workspace/show_controller')])
            .as('show')
          router
            .put('', [() => import('#controllers/customer/workspace/update_controller')])
            .as('update')
          router
            .delete('', [() => import('#controllers/customer/workspace/delete_controller')])
            .as('delete')

          router
            .post('transfer', [() => import('#controllers/customer/workspace/transfer_controller')])
            .as('transfer')

          router
            .group(() => {
              router
                .post('', [
                  () => import('#controllers/customer/workspace/member/create_controller'),
                ])
                .as('create')

              router
                .group(() => {
                  router
                    .put('', [
                      () => import('#controllers/customer/workspace/member/update_controller'),
                    ])
                    .as('update')
                  router
                    .delete('', [
                      () => import('#controllers/customer/workspace/member/delete_controller'),
                    ])
                    .as('delete')
                })
                .prefix(':memberId')
            })
            .prefix('member')
            .as('member')

          router
            .group(() => {
              router
                .get('', [() => import('#controllers/customer/workspace/profile/show_controller')])
                .as('show')
              router
                .post('leave', [
                  () => import('#controllers/customer/workspace/profile/leave_controller'),
                ])
                .as('leave')
            })
            .prefix('profile')
            .as('profile')

          blogRoutes()
        })
        .prefix(':workspaceId')
    })
    .prefix('workspace')
    .as('workspace')
    .use(middleware.auth({ roles: ['customer'] }))
}

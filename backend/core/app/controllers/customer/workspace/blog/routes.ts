import router from '@adonisjs/core/services/router'

export const blogRoutes = () => {
  router
    .group(() => {
      router.post('', [() => import('#controllers/customer/workspace/blog/create_controller')])
      router.get('', [() => import('#controllers/customer/workspace/blog/list_controller')])

      router
        .group(() => {
          router.get('', [() => import('#controllers/customer/workspace/blog/show_controller')])
          router.put('', [() => import('#controllers/customer/workspace/blog/update_controller')])
          router.delete('', [
            () => import('#controllers/customer/workspace/blog/delete_controller'),
          ])

          router.post('publish', [
            () => import('#controllers/customer/workspace/blog/publish_controller'),
          ])
          router.post('unpublish', [
            () => import('#controllers/customer/workspace/blog/unpublish_controller'),
          ])

          router.put('permission/:memberId', [
            () => import('#controllers/customer/workspace/blog/permission/update_controller'),
          ])
        })
        .prefix(':blogId')
    })
    .prefix('blog')
}

import router from '@adonisjs/core/services/router'

export const blogRoutes = () => {
  router
    .group(() => {
      router
        .post('', [() => import('#controllers/customer/workspace/blog/create_controller')])
        .as('create')
      router
        .get('', [() => import('#controllers/customer/workspace/blog/list_controller')])
        .as('list')

      router
        .group(() => {
          router
            .get('', [() => import('#controllers/customer/workspace/blog/show_controller')])
            .as('show')
          router
            .put('', [() => import('#controllers/customer/workspace/blog/update_controller')])
            .as('update')
          router
            .delete('', [() => import('#controllers/customer/workspace/blog/delete_controller')])
            .as('delete')

          router
            .post('publish', [
              () => import('#controllers/customer/workspace/blog/publish_controller'),
            ])
            .as('publish')

          router
            .post('unpublish', [
              () => import('#controllers/customer/workspace/blog/unpublish_controller'),
            ])
            .as('unpublish')

          router
            .post('archive', [
              () => import('#controllers/customer/workspace/blog/archive_controller'),
            ])
            .as('archive')
        })
        .prefix(':blogId')
    })
    .prefix('blog')
    .as('blog')
}

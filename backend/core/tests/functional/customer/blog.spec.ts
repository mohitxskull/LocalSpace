import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import Workspace from '#models/workspace'
import { blogStatusE, workspaceMemberRoleE, WorkspaceMemberRoleT } from '#types/literals'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import WorkspaceMember from '#models/workspace_member'
import app from '@adonisjs/core/services/app'

test.group('Blog', (group) => {
  let owner: User
  let manager: User
  let editor: User
  let viewer: User
  let workspace: Workspace
  let ownerMember: WorkspaceMember

  async function createUserWithRole(role: WorkspaceMemberRoleT) {
    const user = await UserFactory.create()
    await workspace.related('members').create({
      userId: user.id,
      role: role,
      joinedAt: DateTime.now(),
    })
    return user
  }

  const originalSettings = JSON.parse(JSON.stringify(app.config.get('setting')))

  group.each.setup(async () => {
    await testUtils.db().truncate()
    app.config.set('setting', JSON.parse(JSON.stringify(originalSettings)))
    owner = await UserFactory.create()
    workspace = await Workspace.create({ name: 'Blog Test Workspace' })
    ownerMember = await workspace.related('members').create({
      userId: owner.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })
    manager = await createUserWithRole(workspaceMemberRoleE('manager'))
    editor = await createUserWithRole(workspaceMemberRoleE('editor'))
    viewer = await createUserWithRole(workspaceMemberRoleE('viewer'))
  })

  test('Create | owner can create a blog', async ({ client, assert }) => {
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog`)
      .loginAs(owner)
      .json({ title: 'My First Blog', content: 'This is the content.' })

    response.assertStatus(200)
    assert.exists(response.body().blog.id)
    assert.equal(response.body().blog.title, 'My First Blog')
    assert.equal(response.body().blog.status, blogStatusE('draft'))
  })

  test('Create | should not allow creating more blogs than the limit', async ({ client }) => {
    app.config.set('setting.customer.workspace.blog.max', 0)

    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog`)
      .loginAs(owner)
      .json({ title: 'My First Blog', content: 'This is the content.' })

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'You have reached the maximum number of blogs for this workspace.',
    })
  })

  test('Create | manager can create a blog', async ({ client, assert }) => {
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog`)
      .loginAs(manager)
      .json({ title: 'Manager Blog', content: 'This is the content.' })

    response.assertStatus(200)
    assert.exists(response.body().blog.id)
  })

  test('Create | editor can create a blog', async ({ client, assert }) => {
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog`)
      .loginAs(editor)
      .json({ title: 'Editor Blog', content: 'This is the content.' })

    response.assertStatus(200)
    assert.exists(response.body().blog.id)
  })

  test('Create | viewer cannot create a blog', async ({ client }) => {
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog`)
      .loginAs(viewer)
      .json({ title: 'Viewer Blog', content: 'This is the content.' })

    response.assertStatus(403)
  })

  test('Update | owner can update a blog', async ({ client }) => {
    const blog = await workspace.related('blogs').create({
      title: 'Original Title',
      content: 'Original Content',
      authorId: ownerMember.id,
      status: blogStatusE('draft'),
    })
    const response = await client
      .put(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}`)
      .loginAs(owner)
      .json({ title: 'Updated Title', content: 'Updated Content' })

    response.assertStatus(200)
  })

  test('Update | should not update a published blog', async ({ client }) => {
    const blog = await workspace.related('blogs').create({
      title: 'Original Title',
      content: 'Original Content',
      authorId: ownerMember.id,
      status: blogStatusE('published'),
    })
    const response = await client
      .put(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}`)
      .loginAs(owner)
      .json({ title: 'Updated Title', content: 'Updated Content' })

    response.assertStatus(403)
  })

  test('Delete | owner can delete a draft blog', async ({ client }) => {
    const blog = await workspace.related('blogs').create({
      title: 'To Be Deleted',
      content: 'Content',
      authorId: ownerMember.id,
      status: blogStatusE('draft'),
    })
    const response = await client
      .delete(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}`)
      .loginAs(owner)

    response.assertStatus(200)
  })

  test('Delete | should not delete a published blog', async ({ client }) => {
    const blog = await workspace.related('blogs').create({
      title: 'To Be Deleted',
      content: 'Content',
      authorId: ownerMember.id,
      status: blogStatusE('published'),
    })
    const response = await client
      .delete(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}`)
      .loginAs(owner)

    response.assertStatus(403)
  })

  test('Publish | owner can publish a blog', async ({ client }) => {
    const blog = await workspace.related('blogs').create({
      title: 'To Be Published',
      content: 'Content',
      authorId: ownerMember.id,
      status: blogStatusE('draft'),
    })
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}/publish`)
      .loginAs(owner)

    response.assertStatus(200)
  })

  test('Publish | should not publish a blog that is not draft', async ({ client }) => {
    const blog = await workspace.related('blogs').create({
      title: 'To Be Published',
      content: 'Content',
      authorId: ownerMember.id,
      status: blogStatusE('archived'),
    })
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}/publish`)
      .loginAs(owner)

    response.assertStatus(403)
  })

  test('Unpublish | owner can unpublish a blog', async ({ client, assert }) => {
    const blog = await workspace.related('blogs').create({
      title: 'To Be Unpublished',
      content: 'Content',
      authorId: ownerMember.id,
      status: blogStatusE('published'),
    })
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}/unpublish`)
      .loginAs(owner)

    response.assertStatus(200)
    await blog.refresh()
    assert.equal(blog.status, 'draft')
  })

  test('Archive | owner can archive a published blog', async ({ client, assert }) => {
    const blog = await workspace.related('blogs').create({
      title: 'To Be Archived',
      content: 'Content',
      authorId: ownerMember.id,
      status: blogStatusE('published'),
    })
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}/archive`)
      .loginAs(owner)

    response.assertStatus(200)
    await blog.refresh()
    assert.equal(blog.status, 'archived')
  })

  test('List | can list and filter blogs', async ({ client, assert }) => {
    await workspace.related('blogs').createMany([
      {
        title: 'First Blog',
        content: '...',
        authorId: ownerMember.id,
        status: blogStatusE('draft'),
      },
      {
        title: 'Second Blog',
        content: '...',
        authorId: ownerMember.id,
        status: blogStatusE('draft'),
      },
    ])

    const response = await client
      .get(`/api/v1/customer/workspace/${workspace.id}/blog?filter[value]=first`)
      .loginAs(owner)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 1)
    assert.equal(response.body().data[0].title, 'First Blog')
  })

  test('Show | can show a single blog', async ({ client, assert }) => {
    const blog = await workspace.related('blogs').create({
      title: 'My Blog',
      content: '...',
      authorId: ownerMember.id,
      status: blogStatusE('draft'),
    })

    const response = await client
      .get(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}`)
      .loginAs(owner)

    response.assertStatus(200)
    assert.equal(response.body().blog.title, 'My Blog')
  })

  test('Show | should not show a blog from another workspace', async ({ client }) => {
    const otherWorkspace = await Workspace.create({ name: 'Other Workspace' })
    const blog = await otherWorkspace.related('blogs').create({
      title: 'Other Blog',
      content: '...',
      authorId: ownerMember.id, // this is not correct, but for the test it is fine
      status: blogStatusE('draft'),
    })

    const response = await client
      .get(`/api/v1/customer/workspace/${workspace.id}/blog/${blog.id}`)
      .loginAs(owner)

    response.assertStatus(404)
  })
})

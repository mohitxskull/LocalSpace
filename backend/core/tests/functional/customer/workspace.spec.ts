import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import Workspace from '#models/workspace'
import { blogStatusE, workspaceMemberRoleE } from '#types/literals'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'

test.group('Workspace', (group) => {
  let user: User

  const originalSettings = JSON.parse(JSON.stringify(app.config.get('setting')))

  group.each.setup(async () => {
    await testUtils.db().truncate()
    app.config.set('setting', JSON.parse(JSON.stringify(originalSettings)))
    user = await UserFactory.create()
  })

  test('create a new workspace', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/customer/workspace')
      .loginAs(user)
      .json({ name: 'My Test Workspace' })

    response.assertStatus(200)
    assert.exists(response.body().workspace.id)
    assert.equal(response.body().workspace.name, 'My Test Workspace')

    const workspace = await Workspace.find(response.body().workspace.id)
    assert.exists(workspace)

    const member = await workspace!.related('members').query().where('user_id', user.id).first()
    assert.exists(member)
    assert.equal(member!.role, workspaceMemberRoleE('owner'))
  })

  test('should not allow creating more workspaces than the limit', async ({ client }) => {
    app.config.set('setting.customer.workspace.max', 1)

    await client
      .post('/api/v1/customer/workspace')
      .loginAs(user)
      .json({ name: 'My First Workspace' })

    const response = await client
      .post('/api/v1/customer/workspace')
      .loginAs(user)
      .json({ name: 'My Second Workspace' })

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'You have reached the maximum number of workspaces you can own.',
    })
  })

  test('list workspaces for a user', async ({ client, assert }) => {
    const workspace = await Workspace.create({ name: 'Another Workspace' })
    await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('viewer'),
      joinedAt: DateTime.now(),
    })

    const response = await client.get('/api/v1/customer/workspace').loginAs(user)

    response.assertStatus(200)
    assert.isArray(response.body().data)
    assert.lengthOf(response.body().data, 1)
    assert.equal(response.body().data[0].name, 'Another Workspace')
  })

  test('show a workspace a user belongs to', async ({ client, assert }) => {
    const workspace = await Workspace.create({ name: 'Test Show Workspace' })
    await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('viewer'),
      joinedAt: DateTime.now(),
    })

    const response = await client.get(`/api/v1/customer/workspace/${workspace.id}`).loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().workspace.id, workspace.id)
  })

  test('do not show a workspace a user does not belong to', async ({ client }) => {
    const otherUser = await UserFactory.create()
    const workspace = await Workspace.create({ name: 'Other User Workspace' })
    await workspace.related('members').create({
      userId: otherUser.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })

    const response = await client.get(`/api/v1/customer/workspace/${workspace.id}`).loginAs(user)

    response.assertStatus(403)
  })

  test('owner can update workspace name', async ({ client, assert }) => {
    const workspace = await Workspace.create({ name: 'Original Name' })
    await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })

    const response = await client
      .put(`/api/v1/customer/workspace/${workspace.id}`)
      .loginAs(user)
      .json({ name: 'Updated Name' })

    response.assertStatus(200)
    assert.equal(response.body().workspace.name, 'Updated Name')
  })

  test('member cannot update workspace name', async ({ client }) => {
    const memberUser = await UserFactory.create()
    const workspace = await Workspace.create({ name: 'Original Name' })
    await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })
    await workspace.related('members').create({
      userId: memberUser.id,
      role: workspaceMemberRoleE('viewer'),
      joinedAt: DateTime.now(),
    })

    const response = await client
      .put(`/api/v1/customer/workspace/${workspace.id}`)
      .loginAs(memberUser)
      .json({ name: 'Updated Name' })

    response.assertStatus(403)
  })

  test('owner can delete workspace', async ({ client, assert }) => {
    const owner = await UserFactory.create()

    await client
      .post('/api/v1/customer/workspace')
      .loginAs(owner)
      .json({ name: 'My Test Workspace 1' })

    const response2 = await client
      .post('/api/v1/customer/workspace')
      .loginAs(owner)
      .json({ name: 'My Test Workspace 2' })

    const workspaceIdToDelete = response2.body().workspace.id

    const response = await client
      .delete(`/api/v1/customer/workspace/${workspaceIdToDelete}`)
      .loginAs(owner)

    response.assertStatus(200)
    const deletedWorkspace = await Workspace.find(workspaceIdToDelete)
    assert.isNull(deletedWorkspace)
  })

  test('should not allow deleting the last workspace', async ({ client }) => {
    const workspace = await Workspace.create({ name: 'My Only Workspace' })
    await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })

    const response = await client.delete(`/api/v1/customer/workspace/${workspace.id}`).loginAs(user)

    response.assertStatus(403)
  })

  test('should not allow deleting a workspace with published blogs', async ({ client }) => {
    const workspace = await Workspace.create({ name: 'Workspace With Blogs' })
    const member = await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })
    await workspace.related('blogs').create({
      title: 'Published Blog',
      content: '...',
      authorId: member.id,
      status: blogStatusE('published'),
    })

    const response = await client.delete(`/api/v1/customer/workspace/${workspace.id}`).loginAs(user)

    response.assertStatus(403)
  })

  test('member cannot delete workspace', async ({ client, assert }) => {
    const memberUser = await UserFactory.create()
    const workspace = await Workspace.create({ name: 'To Not Be Deleted' })
    await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })
    await workspace.related('members').create({
      userId: memberUser.id,
      role: workspaceMemberRoleE('viewer'),
      joinedAt: DateTime.now(),
    })

    const response = await client
      .delete(`/api/v1/customer/workspace/${workspace.id}`)
      .loginAs(memberUser)

    response.assertStatus(403)
    const workspaceStillExists = await Workspace.find(workspace.id)
    assert.isNotNull(workspaceStillExists)
  })

  test('owner can transfer ownership to another member', async ({ client, assert }) => {
    const newOwner = await UserFactory.create()
    const workspace = await Workspace.create({ name: 'Transfer Test' })
    await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })
    await workspace.related('members').create({
      userId: newOwner.id,
      role: workspaceMemberRoleE('viewer'),
      joinedAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/transfer`)
      .loginAs(user)
      .json({ newOwnerId: newOwner.id })

    response.assertStatus(200)

    const oldOwnerMember = await workspace
      .related('members')
      .query()
      .where('user_id', user.id)
      .first()
    const newOwnerMember = await workspace
      .related('members')
      .query()
      .where('user_id', newOwner.id)
      .first()

    assert.equal(oldOwnerMember!.role, workspaceMemberRoleE('manager'))
    assert.equal(newOwnerMember!.role, workspaceMemberRoleE('owner'))
  })

  test('should not transfer ownership to user at workspace limit', async ({ client }) => {
    const newOwner = await UserFactory.create()
    const workspace = await Workspace.create({ name: 'Transfer Test' })
    await workspace.related('members').create({
      userId: user.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })
    await workspace.related('members').create({
      userId: newOwner.id,
      role: workspaceMemberRoleE('viewer'),
      joinedAt: DateTime.now(),
    })

    app.config.set('setting.customer.workspace.max', 0)

    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/transfer`)
      .loginAs(user)
      .json({ newOwnerId: newOwner.id })

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'The new owner has reached the maximum number of workspaces allowed.',
    })
  })
})

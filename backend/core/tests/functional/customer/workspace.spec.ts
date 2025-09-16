import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import Workspace from '#models/workspace'
import { blogStatusE, workspaceMemberRoleE } from '#types/literals'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Workspace', (group) => {
  let user: User

  group.each.setup(async () => {
    await testUtils.db().truncate()
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

  test('list workspaces for a user', async ({ client, assert }) => {
    const workspace = await Workspace.create({ name: 'Another Workspace' })
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('member') })

    const response = await client.get('/api/v1/customer/workspace').loginAs(user)

    response.assertStatus(200)
    assert.isArray(response.body().workspaces)
    assert.lengthOf(response.body().workspaces, 1)
    assert.equal(response.body().workspaces[0].name, 'Another Workspace')
  })

  test('show a workspace a user belongs to', async ({ client, assert }) => {
    const workspace = await Workspace.create({ name: 'Test Show Workspace' })
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('member') })

    const response = await client.get(`/api/v1/customer/workspace/${workspace.id}`).loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().workspace.id, workspace.id)
  })

  test('do not show a workspace a user does not belong to', async ({ client }) => {
    const otherUser = await UserFactory.create()
    const workspace = await Workspace.create({ name: 'Other User Workspace' })
    await workspace
      .related('members')
      .create({ userId: otherUser.id, role: workspaceMemberRoleE('owner') })

    const response = await client.get(`/api/v1/customer/workspace/${workspace.id}`).loginAs(user)

    response.assertStatus(403)
  })

  test('owner can update workspace name', async ({ client, assert }) => {
    const workspace = await Workspace.create({ name: 'Original Name' })
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('owner') })

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
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('owner') })
    await workspace
      .related('members')
      .create({ userId: memberUser.id, role: workspaceMemberRoleE('member') })

    const response = await client
      .put(`/api/v1/customer/workspace/${workspace.id}`)
      .loginAs(memberUser)
      .json({ name: 'Updated Name' })

    response.assertStatus(403)
  })

  test('owner can delete workspace', async ({ client, assert }) => {
    const workspace = await Workspace.create({ name: 'To Be Deleted' })
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('owner') })

    const response = await client.delete(`/api/v1/customer/workspace/${workspace.id}`).loginAs(user)

    response.assertStatus(200)
    const deletedWorkspace = await Workspace.find(workspace.id)
    assert.isNull(deletedWorkspace)
  })

  test('member cannot delete workspace', async ({ client, assert }) => {
    const memberUser = await UserFactory.create()
    const workspace = await Workspace.create({ name: 'To Not Be Deleted' })
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('owner') })
    await workspace
      .related('members')
      .create({ userId: memberUser.id, role: workspaceMemberRoleE('member') })

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
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('owner') })
    await workspace
      .related('members')
      .create({ userId: newOwner.id, role: workspaceMemberRoleE('member') })

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

    assert.equal(oldOwnerMember!.role, workspaceMemberRoleE('member'))
    assert.equal(newOwnerMember!.role, workspaceMemberRoleE('owner'))
  })

  test('owner can add a new member', async ({ client, assert }) => {
    const newMember = await UserFactory.with('credentials', 1, (cred) =>
      cred.with('verification', 1)
    ).create()
    const workspace = await Workspace.create({ name: 'Add Member Test' })
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('owner') })

    const newMemberCredential = await newMember.related('credentials').query().firstOrFail()

    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/member`)
      .loginAs(user)
      .json({ email: newMemberCredential.identifier })

    response.assertStatus(200)
    const member = await workspace.related('members').query().where('user_id', newMember.id).first()
    assert.exists(member)
  })

  test('owner can remove a member', async ({ client, assert }) => {
    const memberToRemove = await UserFactory.create()
    const workspace = await Workspace.create({ name: 'Remove Member Test' })
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('owner') })
    await workspace
      .related('members')
      .create({ userId: memberToRemove.id, role: workspaceMemberRoleE('member') })

    const response = await client
      .delete(`/api/v1/customer/workspace/${workspace.id}/member/${memberToRemove.id}`)
      .loginAs(user)

    response.assertStatus(200)
    const member = await workspace
      .related('members')
      .query()
      .where('user_id', memberToRemove.id)
      .first()
    assert.isNull(member)
  })
})

test.group('Blog', (group) => {
  let user: User
  let workspace: Workspace

  group.each.setup(async () => {
    await testUtils.db().truncate()
    user = await UserFactory.create()
    workspace = await Workspace.create({ name: 'Blog Test Workspace' })
    await workspace
      .related('members')
      .create({ userId: user.id, role: workspaceMemberRoleE('owner') })
  })

  test('owner can create a blog', async ({ client, assert }) => {
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/blog`)
      .loginAs(user)
      .json({ title: 'My First Blog', content: 'This is the content.' })

    response.assertStatus(200)
    assert.exists(response.body().blog.id)
    assert.equal(response.body().blog.title, 'My First Blog')
    assert.equal(response.body().blog.status, blogStatusE('draft'))
  })
})

import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import Workspace from '#models/workspace'
import { workspaceMemberRoleE } from '#types/literals'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Workspace Membership', (group) => {
  let owner: User
  let workspace: Workspace

  group.each.setup(async () => {
    await testUtils.db().truncate()
    owner = await UserFactory.create()
    workspace = await Workspace.create({ name: 'Membership Test Workspace' })
    await workspace.related('members').create({
      userId: owner.id,
      role: workspaceMemberRoleE('owner'),
      joinedAt: DateTime.now(),
    })
  })

  test('owner can add a new member', async ({ client, assert }) => {
    const newMemberUser = await UserFactory.merge({
      email: 'newmember@gmail.com',
      verifiedAt: DateTime.now(),
    }).create()
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/member`)
      .loginAs(owner)
      .json({ email: newMemberUser.email, role: 'viewer' })

    response.assertStatus(200)
    const member = await workspace
      .related('members')
      .query()
      .where('user_id', newMemberUser.id)
      .first()
    assert.exists(member)
    assert.equal(member!.role, 'viewer')
  })

  test('should not add a non-existent user', async ({ client }) => {
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/member`)
      .loginAs(owner)
      .json({ email: 'nonexistent@gmail.com', role: 'viewer' })

    response.assertStatus(404)
  })

  test('should not add an unverified user', async ({ client }) => {
    const unverifiedUser = await UserFactory.merge({ email: 'unverified-add@gmail.com' }).create()
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/member`)
      .loginAs(owner)
      .json({ email: unverifiedUser.email, role: 'viewer' })

    response.assertStatus(404)
  })

  test('should not add a user who is already a member', async ({ client }) => {
    const existingMemberUser = await UserFactory.merge({
      email: 'existing@gmail.com',
      verifiedAt: DateTime.now(),
    }).create()
    await workspace.related('members').create({
      userId: existingMemberUser.id,
      role: 'viewer',
      joinedAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/member`)
      .loginAs(owner)
      .json({ email: existingMemberUser.email, role: 'viewer' })

    response.assertStatus(400)
    response.assertBodyContains({ message: 'This user is already a member of the workspace.' })
  })

  test('owner can remove a member', async ({ client, assert }) => {
    const memberToRemove = await UserFactory.merge({
      email: 'toremove@gmail.com',
      verifiedAt: DateTime.now(),
    }).create()
    await workspace.related('members').create({
      userId: memberToRemove.id,
      role: 'viewer',
      joinedAt: DateTime.now(),
    })

    const response = await client
      .delete(`/api/v1/customer/workspace/${workspace.id}/member/${memberToRemove.id}`)
      .loginAs(owner)

    response.assertStatus(200)
    const member = await workspace
      .related('members')
      .query()
      .where('user_id', memberToRemove.id)
      .first()
    assert.isNotNull(member!.leftAt)
  })

  test('should not be able to remove self', async ({ client }) => {
    const response = await client
      .delete(`/api/v1/customer/workspace/${workspace.id}/member/${owner.id}`)
      .loginAs(owner)

    response.assertStatus(400)
    response.assertBodyContains({
      message:
        'You cannot remove yourself from a workspace. Please use the "Leave Workspace" option instead.',
    })
  })

  test('owner can update a member role', async ({ client, assert }) => {
    const memberToUpdate = await UserFactory.merge({
      email: 'toupdate@gmail.com',
      verifiedAt: DateTime.now(),
    }).create()
    await workspace.related('members').create({
      userId: memberToUpdate.id,
      role: 'viewer',
      joinedAt: DateTime.now(),
    })

    const response = await client
      .put(`/api/v1/customer/workspace/${workspace.id}/member/${memberToUpdate.id}`)
      .loginAs(owner)
      .json({ role: 'editor' })

    response.assertStatus(200)
    const member = await workspace
      .related('members')
      .query()
      .where('user_id', memberToUpdate.id)
      .first()
    assert.equal(member!.role, 'editor')
  })

  test('should not be able to update own role', async ({ client }) => {
    const response = await client
      .put(`/api/v1/customer/workspace/${workspace.id}/member/${owner.id}`)
      .loginAs(owner)
      .json({ role: 'manager' })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'You cannot change your own role within the workspace.',
    })
  })

  test('member can leave a workspace', async ({ client, assert }) => {
    const memberUser = await UserFactory.merge({
      email: 'leaver@gmail.com',
      verifiedAt: DateTime.now(),
    }).create()
    const member = await workspace.related('members').create({
      userId: memberUser.id,
      role: 'viewer',
      joinedAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/profile/leave`)
      .loginAs(memberUser)

    response.assertStatus(200)
    await member.refresh()
    assert.isNotNull(member.leftAt)
  })

  test('owner cannot leave a workspace', async ({ client }) => {
    const response = await client
      .post(`/api/v1/customer/workspace/${workspace.id}/profile/leave`)
      .loginAs(owner)

    response.assertStatus(400)
    response.assertBodyContains({
      message:
        'As the workspace owner, you cannot leave. Please transfer ownership to another member first.',
    })
  })

  test('can view workspace profile', async ({ client, assert }) => {
    const response = await client
      .get(`/api/v1/customer/workspace/${workspace.id}/profile`)
      .loginAs(owner)

    response.assertStatus(200)
    assert.equal(response.body().member.userId, owner.id)
  })
})

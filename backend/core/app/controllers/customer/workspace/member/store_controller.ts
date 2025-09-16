import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { NotFoundException, BadRequestException } from '@localspace/node-lib/exception'
import { credentialTypeE, workspaceMemberRoleE } from '#types/literals'
import Credential from '#models/credential'
import { dbRef } from '#database/reference'
import { ULIDS } from '#validators/index'

export const validator = vine.compile(
  vine.object({
    email: vine.string().email(),
    params: vine.object({
      workspaceId: ULIDS(),
    }),
  })
)

export default class StoreController {
  async handle({ bouncer, request, i18n }: HttpContext) {
    const payload = await request.validateUsing(validator)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    const credential = await Credential.query()
      .where(dbRef.credential.identifier, payload.email)
      .andWhere(dbRef.credential.type, credentialTypeE('email'))
      .preload('user')
      .first()

    if (!credential || !credential.user) {
      throw new NotFoundException(i18n.t('customer.workspace.member.store.user_not_found'))
    }

    await credential.load('verification')
    if (!credential.verification || !credential.verification.verifiedAt) {
      throw new BadRequestException(
        i18n.t('customer.workspace.member.store.no_verified_credential')
      )
    }

    const userToAdd = credential.user

    const isAlreadyMember = await workspace
      .related('members')
      .query()
      .where('user_id', userToAdd.id)
      .first()

    if (isAlreadyMember) {
      throw new BadRequestException(i18n.t('customer.workspace.member.store.already_member'))
    }

    await workspace.related('members').create({
      userId: userToAdd.id,
      role: workspaceMemberRoleE('member'),
    })

    return { message: i18n.t('customer.workspace.member.store.success') }
  }
}

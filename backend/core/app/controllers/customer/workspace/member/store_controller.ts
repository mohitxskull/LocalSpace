import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { NotFoundException, BadRequestException } from '@localspace/node-lib/exception'
import { credentialTypeE, workspaceMemberRoleE } from '#types/literals'
import Credential from '#models/credential'
import { dbRef } from '#database/reference'

const addMemberInput = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)

export default class StoreController {
  async handle({ bouncer, params, request, i18n }: HttpContext) {
    const workspace = await Workspace.findOrFail(params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    const { email } = await request.validateUsing(addMemberInput)

    const credential = await Credential.query()
      .where(dbRef.credential.identifier, email)
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

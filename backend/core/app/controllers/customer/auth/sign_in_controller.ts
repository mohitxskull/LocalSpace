import { BadRequestException, ForbiddenException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomerEMailS, CustomerPasswordS } from '#validators/customer'
import { setting } from '#config/setting'
import Credential from '#models/credential'
import { CredentialTypeT } from '#validators/index'
import { dbRef } from '#database/reference'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import { serializeAccessToken } from '@localspace/node-lib'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export const input = vine.compile(
  vine.object({
    email: CustomerEMailS(),
    password: CustomerPasswordS(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    if (!setting.customer.signIn.active) {
      throw new ForbiddenException('Customer sign-in is disabled')
    }

    const payload = await ctx.request.validateUsing(input)

    const trx = await db.transaction()

    try {
      const credential = await Credential.findBy(
        {
          [dbRef.credential.identifierC]: payload.email,
          [dbRef.credential.typeC]: 'email' as CredentialTypeT,
        },
        {
          client: trx,
        }
      )

      if (!credential) {
        await hash.make(payload.password)

        throw new BadRequestException('Invalid credentials', {
          source: 'email',
          reason: 'Email not found',
        })
      }

      const credentialPassword = credential.getPasswordOrFail()

      if (!(await hash.verify(credentialPassword, payload.password))) {
        throw new BadRequestException('Invalid credentials', {
          source: 'email',
          reason: 'Password is incorrect',
        })
      }

      credential.usedAt = DateTime.now()

      await Promise.all([credential.save(), credential.load('user')])

      const user = credential.user

      const existingTokens = await User.accessTokens.all(user)

      if (existingTokens.length > 0) {
        for await (const token of existingTokens) {
          await User.accessTokens.delete(user, token.identifier)
        }
      }

      const token = await User.accessTokens.create(user)

      return {
        token: serializeAccessToken(token),
        message: `You have successfully signed in!`,
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

import { BadRequestException, ForbiddenException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomerEMailS, CustomerNameS, CustomerPasswordS } from '#validators/customer'
import { dbRef } from '#database/reference'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'
import tokenService from '#services/token_service'
import { tokenTypeE, roleE, workspaceMemberRoleE } from '#types/literals'
import limiter from '@adonisjs/limiter/services/main'
import Workspace from '#models/workspace'
import WorkspaceMember from '#models/workspace_member'
import { getSetting } from '#util/get_setting'

export const input = vine.compile(
  vine.object({
    name: CustomerNameS(),
    email: CustomerEMailS(),
    password: CustomerPasswordS(),
    confirmPassword: CustomerPasswordS().sameAs('password'),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const setting = getSetting()
    if (!setting.customer.signUp.active) {
      throw new ForbiddenException('signup is currently disabled.')
    }

    const payload = await ctx.request.validateUsing(input)

    const signUpLimiter = limiter.use({
      requests: 5,
      duration: '1 day',
    })

    await signUpLimiter.consume(`customer_sign_up_${ctx.request.ip()}_${payload.email}`)

    const trx = await db.transaction()

    try {
      const userExists = await User.findBy(
        {
          [dbRef.user.email]: payload.email,
        },
        {
          client: trx,
        }
      )

      if (userExists) {
        throw new BadRequestException('An account with this email address already exists.', {
          source: 'email',
          reason: 'Email already exists',
        })
      }

      const user = await User.create(
        {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: roleE('customer'),
        },
        {
          client: trx,
        }
      )

      const workspace = await Workspace.create(
        {
          name: `${user.name}'s Workspace`,
        },
        { client: trx }
      )

      await WorkspaceMember.create(
        {
          userId: user.id,
          workspaceId: workspace.id,
          role: workspaceMemberRoleE('owner'),
        },
        { client: trx }
      )

      const emailVerificationRequired = setting.credential.email.verification.enabled

      if (emailVerificationRequired) {
        const accessTokenHolder = await tokenService.create(
          {
            type: tokenTypeE('email_verification'),
            user,
            expiresIn: setting.credential.email.verification.expiresIn,
          },
          {
            client: trx,
          }
        )

        await mail.sendLater(new VerifyEmailNotification({ user, accessTokenHolder }))
      }

      await trx.commit()

      return {
        user: await user.transformer.serialize(),
        message: emailVerificationRequired
          ? 'Your account has been created. Please check your email to verify your account.'
          : 'Your account has been created successfully.',
        meta: {
          email: {
            verificationRequired: emailVerificationRequired,
          },
        },
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

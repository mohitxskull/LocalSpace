import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { roleE, credentialTypeE } from '#types/literals'
import Credential from '#models/credential'
import CustomerProfile from '#models/customer_profile'
import CredentialVerification from '#models/credential_verification'
import { DateTime } from 'luxon'

export const CredentialVerificationFactory = factory
  .define(CredentialVerification, () => {
    return {
      verifiedAt: DateTime.now(),
    }
  })
  .build()

export const CredentialFactory = factory
  .define(Credential, async ({ faker }) => {
    return {
      identifier: faker.internet.email(),
      password: faker.internet.password(),
      type: credentialTypeE('email'),
    }
  })
  .relation('verification', () => CredentialVerificationFactory)

  .build()

export const CustomerProfileFactory = factory
  .define(CustomerProfile, async ({ faker }) => {
    return {
      email: faker.internet.email(),
    }
  })
  .build()

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      name: faker.person.fullName(),
      role: roleE('customer'),
    }
  })
  .state('admin', (row) => {
    row.role = roleE('admin')
  })
  .relation('credentials', () => CredentialFactory)
  .relation('customerProfile', () => CustomerProfileFactory)
  .build()

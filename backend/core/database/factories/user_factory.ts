import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { roleE } from '#types/literals'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      name: faker.person.fullName(),
      role: roleE('customer'),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
  })
  .state('admin', (row) => {
    row.role = roleE('admin')
  })
  .build()

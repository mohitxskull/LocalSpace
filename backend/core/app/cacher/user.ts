import User from '#models/user'
import { BaseCacher } from '@localspace/node-lib'

export class UserCacher extends BaseCacher<typeof User> {}

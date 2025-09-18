import { oneOf } from '@localspace/lib'

// ===================================

export const directionC = ['asc', 'desc'] as const

export type DirectionT = (typeof directionC)[number]

export const directionE = oneOf(directionC)

// ===================================

export const tokenTypeC = ['access', 'email_verification', 'password_reset'] as const

export type TokenTypeT = (typeof tokenTypeC)[number]

export const tokenTypeE = oneOf(tokenTypeC)

// ===================================

export const credentialTypeC = ['email'] as const

export type CredentialTypeT = (typeof credentialTypeC)[number]

export const credentialTypeE = oneOf(credentialTypeC)

// ===================================

export const credentialStatusC = ['active', 'bounced', 'complained'] as const

export type CredentialStatusT = (typeof credentialStatusC)[number]

export const credentialStatusE = oneOf(credentialStatusC)

// ===================================

export const roleC = ['admin', 'customer'] as const

export type RoleT = (typeof roleC)[number]

export const roleE = oneOf(roleC)

// ===================================

export const workspaceMemberRoleC = ['owner', 'editor', 'manager', 'viewer'] as const

export type WorkspaceMemberRoleT = (typeof workspaceMemberRoleC)[number]

export const workspaceMemberRoleE = oneOf(workspaceMemberRoleC)

// ===================================

export const blogStatusC = ['draft', 'published', 'archived'] as const

export type BlogStatusT = (typeof blogStatusC)[number]

export const blogStatusE = oneOf(blogStatusC)

// ===================================

import { workspaceMemberRoleC } from '#types/literals'
import { exclude } from '@localspace/lib'
import vine from '@vinejs/vine'

export const WorkspaceMemberRoleS = () => vine.enum(workspaceMemberRoleC)

export const WorkspaceMemberUpdatableRoleS = () => vine.enum(exclude(workspaceMemberRoleC, 'owner'))

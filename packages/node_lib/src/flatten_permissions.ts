import { base64 } from '@adonisjs/core/helpers'
import stringHelpers from '@adonisjs/core/helpers/string'
import { hash, typedObjectEntries } from '@localspace/lib'

/** A group of permissions for a specific resource identifier (ri). */
type PermissionGroup = {
  riPattern: string
  actions: Record<string, Record<string, string>> // e.g., { create: { description: '...' } }
}

/** A single, flattened permission action with a unique ID. */
type FlattenedPermission = {
  id: string
  ri: string
  action: string
  // This allows any additional properties from the 'details' object.
  [key: string]: string
}

/**
 * Transforms a nested array of permission groups into a flat list of individual permission actions.
 * Each action is given a unique ID by combining its resource identifier (`ri`) and action name.
 *
 * @param permissions - An array of permission groups to process.
 * @returns A flattened array of individual permission actions.
 */
export const flattenPermissions = (params: {
  permissions: PermissionGroup[]
}): FlattenedPermission[] => {
  return params.permissions.flatMap((permissionGroup) =>
    typedObjectEntries(permissionGroup.actions).map(([action, details]) => ({
      id: base64.urlEncode(`${permissionGroup.riPattern}-${action}`),
      ri: permissionGroup.riPattern,
      action: action,
      ...details,
    }))
  )
}

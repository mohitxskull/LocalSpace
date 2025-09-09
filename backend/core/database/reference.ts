import { DBReference } from '@localspace/node-lib'

const dbStructure = {
  user: {
    name: 'users',
    columns: {
      id: 'id',
      name: 'name',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  role: {
    name: 'roles',
    columns: {
      id: 'id',
      name: 'name',
    },
  },
  membership: {
    name: 'memberships',
    pivot: {
      pivotTable: 'memberships',
    },
    columns: {
      id: 'id',
      userId: 'user_id',
      roleId: 'role_id',
    },
  },
  credential: {
    name: 'credentials',
    columns: {
      id: 'id',
      userId: 'user_id',
      type: 'type',
      identifier: 'identifier',
      password: 'password',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
      usedAt: 'used_at',
      verifiedAt: 'verified_at',
    },
  },
  permission: {
    name: 'permissions',
    columns: {
      id: 'id',
      resourceId: 'resource_id',
      actions: 'actions',
      userId: 'user_id',
    },
  },
  customerProfile: {
    name: 'customer_profiles',
    columns: {
      id: 'id',
      userId: 'user_id',
      email: 'email',
      updatedAt: 'updated_at',
    },
  },
  adminProfile: {
    name: 'admin_profiles',
    columns: {
      id: 'id',
      userId: 'user_id',
      email: 'email',
      updatedAt: 'updated_at',
    },
  },

  document: {
    name: 'documents',
    columns: {
      id: 'id',
      userId: 'user_id',
      title: 'title',
      content: 'content',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
} as const

export const dbRef = DBReference.create(dbStructure)

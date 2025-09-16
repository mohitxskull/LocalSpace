import { ResourceSchema } from '@localspace/node-lib'

export const permissionSchema = {
  workspace: {
    actions: {
      members: {
        name: 'Manage Members',
        description: 'Allows inviting, removing, and changing member permissions.',
      },
      billing: {
        name: 'Manage Billing',
        description:
          "Allows viewing and managing the workspace's subscription and billing information.",
      },
    },
    child: {
      blog: {
        actions: {
          create: {
            name: 'Create Blog',
            description: 'Allows creating new blog posts.',
          },
          read: {
            name: 'Read Blog',
            description: 'Allows viewing blog posts.',
          },
          update: {
            name: 'Update Blog',
            description: 'Allows editing blog posts.',
          },
          delete: {
            name: 'Delete Blog',
            description: 'Allows permanently deleting blog posts.',
          },
          publish: {
            name: 'Publish Blog',
            description: 'Allows making blog posts public.',
          },
        },
      },
    },
  },
} as const satisfies ResourceSchema

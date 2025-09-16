export const setting = {
  customer: {
    signIn: {
      active: true,
    },

    signUp: {
      active: true,
    },

    workspace: {
      max: 5,
    },
  },

  session: {
    max: 2,
    expiresIn: '1w',
  },

  credential: {
    email: {
      verification: {
        enabled: true,
        required: true,
        expiresIn: '15m',
        purpose: 'credential-email-verification',
        path: '/verify/email',
      },
      passwordReset: {
        expiresIn: '15m',
        path: '/reset-password',
      },
    },
  },
} as const

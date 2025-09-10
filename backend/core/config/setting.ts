export const setting = {
  customer: {
    signIn: {
      active: true,
    },

    signUp: {
      active: true,
    },
  },

  credential: {
    email: {
      verification: {
        enabled: true,
        required: true,
        expiresIn: '15m',
        purpose: 'credential-email-verification',
        path: '/app/verify/email',
      },
    },
  },

  document: {
    max: 100,
  },
} as const

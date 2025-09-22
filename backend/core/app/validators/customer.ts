import vine from '@vinejs/vine'

export const CustomerEMailS = () =>
  vine.string().email({
    host_whitelist: ['gmail.com'],
  })

export const CustomerNameS = () => vine.string().minLength(2).maxLength(20)

export const CustomerPasswordS = () => vine.string().minLength(8).maxLength(40)

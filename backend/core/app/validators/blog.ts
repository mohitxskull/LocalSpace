import vine from '@vinejs/vine'

export const BlogTitleS = () => vine.string().minLength(5).maxLength(100)

export const BlogContentS = () => vine.string().minLength(10)

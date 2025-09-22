import vine from '@vinejs/vine'

export const WorkspaceNameS = () => vine.string().minLength(2).maxLength(20)

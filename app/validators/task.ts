import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().maxLength(255),

    description: vine.string().trim(),

    type: vine.enum(['bug', 'suggestion', 'general']),
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().maxLength(255).optional(),

    description: vine.string().trim().optional(),

    type: vine.enum(['bug', 'suggestion', 'general']).optional(),
  })
)

export const updateTaskStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['open', 'in_progress', 'finished']),
  })
)
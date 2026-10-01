import { TaskSchema } from '#database/schema'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Task extends TaskSchema {
  declare type: 'bug' | 'suggestion' | 'general'
  declare status: 'open' | 'in_progress' | 'finished' | 'closed'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

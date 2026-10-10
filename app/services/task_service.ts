import Task from '#models/task'
import type User from '#models/user'
import type { Infer } from '@vinejs/vine/types'
import type {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
} from '#validators/task'

/** Shared task rules for session and token clients. */
export default class TaskService {
  static list() {
    return Task.query().orderBy('created_at', 'desc').orderBy('id', 'desc')
  }

  static find(id: number | string) {
    return Task.findOrFail(id)
  }

  static canManage(task: Task, user: User) {
    return task.userId === user.id
  }

  static findOwned(user: User, id: number | string) {
    return user.related('tasks').query().where('id', id).firstOrFail()
  }

  static create(user: User, payload: Infer<typeof createTaskValidator>) {
    return user.related('tasks').create({ ...payload, status: 'open' })
  }

  static async update(user: User, id: number | string, payload: Infer<typeof updateTaskValidator>) {
    const task = await this.findOwned(user, id)
    return task.merge(payload).save()
  }

  static async updateStatus(
    user: User,
    id: number | string,
    payload: Infer<typeof updateTaskStatusValidator>
  ) {
    const task = await this.findOwned(user, id)
    return task.merge(payload).save()
  }

  static async destroy(user: User, id: number | string) {
    const task = await this.findOwned(user, id)
    await task.delete()
  }
}

import {
  createTaskValidator,
  updateTaskStatusValidator,
  updateTaskValidator,
} from '#validators/task'
import { HttpContext } from '@adonisjs/core/http'

export default class TasksController {
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return user.related('tasks').query()
  }

  async show({ params, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return user.related('tasks').query().where('id', params.id).firstOrFail()
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(createTaskValidator)

    const task = await user.related('tasks').create(payload)

    return response.created(task)
  }

  async updateStatus({ params, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(updateTaskStatusValidator)

    const task = await user.related('tasks').query().where('id', params.id).firstOrFail()

    task.status = payload.status

    await task.save()

    return task
  }

  async update({ params, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateTaskValidator)

    const task = await user.related('tasks').query().where('id', params.id).firstOrFail()

    task.merge(payload)

    await task.save()

    return task
  }
}

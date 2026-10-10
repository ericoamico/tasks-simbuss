import {
  createTaskValidator,
  updateTaskStatusValidator,
  updateTaskValidator,
} from '#validators/task'
import { type HttpContext } from '@adonisjs/core/http'
import TaskService from '#services/task_service'

export default class TasksController {
  async index({ auth }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    const tasks = await TaskService.list()
    return tasks.map((task) => ({
      ...task.serialize(),
      canManage: TaskService.canManage(task, user),
    }))
  }

  async show({ params, auth }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    const task = await TaskService.find(params.id)
    return { ...task.serialize(), canManage: TaskService.canManage(task, user) }
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    const payload = await request.validateUsing(createTaskValidator)
    const task = await TaskService.create(user, payload)
    return response.created(task)
  }

  async updateStatus({ params, request, auth }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    const payload = await request.validateUsing(updateTaskStatusValidator)
    return TaskService.updateStatus(user, params.id, payload)
  }

  async update({ params, request, auth }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    const payload = await request.validateUsing(updateTaskValidator)
    return TaskService.update(user, params.id, payload)
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    await TaskService.destroy(user, params.id)
    return response.noContent()
  }
}

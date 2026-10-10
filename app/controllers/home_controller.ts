import type { HttpContext } from '@adonisjs/core/http'
import TaskService from '#services/task_service'

export default class HomeController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    const tasks = await TaskService.list()

    return inertia.render('home', {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        status: task.status,
        canManage: TaskService.canManage(task, user),
      })),
    })
  }
}

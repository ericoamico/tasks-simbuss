import type { HttpContext } from '@adonisjs/core/http'
import Task from '#models/task'

export default class HomeController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    const tasks = await Task.query().orderBy('created_at', 'desc').orderBy('id', 'desc')

    return inertia.render('home', {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        status: task.status,
        canManage: task.userId === user.id,
      })),
    })
  }
}

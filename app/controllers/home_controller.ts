import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    const tasks = await user
      .related('tasks')
      .query()
      .orderBy('created_at', 'desc')

    return inertia.render('home', {
      tasks,
    })
  }
}
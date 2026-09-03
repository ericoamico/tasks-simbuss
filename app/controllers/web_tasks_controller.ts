import type { HttpContext } from '@adonisjs/core/http'
import { createTaskValidator } from '#validators/task'

export default class WebTasksController {
  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(createTaskValidator)

    await user.related('tasks').create(payload)

    return response.redirect().toRoute('home')
  }
}
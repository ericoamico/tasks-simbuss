import TaskService from '#services/task_service'
import type { HttpContext } from '@adonisjs/core/http'
import {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
} from '#validators/task'

export default class WebTasksController {
  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(createTaskValidator)

    await TaskService.create(user, payload)

    return response.redirect().toRoute('home')
  }
  async update({ params, request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateTaskValidator)
    await TaskService.update(user, params.id, payload)
    session.flash('success', 'Chamado atualizado com sucesso.')
    return response.redirect().toRoute('home')
  }

  async updateStatus({ params, request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateTaskStatusValidator)
    await TaskService.updateStatus(user, params.id, payload)
    session.flash('success', 'Status atualizado com sucesso.')
    return response.redirect().toRoute('home')
  }

  async destroy({ params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    await TaskService.destroy(user, params.id)
    session.flash('success', 'Chamado excluído com sucesso.')
    return response.redirect().toRoute('home')
  }
}

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

    await user.related('tasks').create({ ...payload, status: 'open' })

    return response.redirect().toRoute('home')
  }
  async update({ params, request, auth, response, session }: HttpContext) {
    const task = await auth
      .getUserOrFail()
      .related('tasks')
      .query()
      .where('id', params.id)
      .firstOrFail()
    const payload = await request.validateUsing(updateTaskValidator)
    await task.merge(payload).save()
    session.flash('success', 'Chamado atualizado com sucesso.')
    return response.redirect().toRoute('home')
  }

  async updateStatus({ params, request, auth, response, session }: HttpContext) {
    const task = await auth
      .getUserOrFail()
      .related('tasks')
      .query()
      .where('id', params.id)
      .firstOrFail()
    const payload = await request.validateUsing(updateTaskStatusValidator)
    await task.merge(payload).save()
    session.flash('success', 'Status atualizado com sucesso.')
    return response.redirect().toRoute('home')
  }

  async destroy({ params, auth, response, session }: HttpContext) {
    const task = await auth
      .getUserOrFail()
      .related('tasks')
      .query()
      .where('id', params.id)
      .firstOrFail()
    await task.delete()
    session.flash('success', 'Chamado excluído com sucesso.')
    return response.redirect().toRoute('home')
  }
}

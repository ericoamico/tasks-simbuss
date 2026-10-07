import transmit from '@adonisjs/transmit/services/main'

export function notifyTaskChanged(action: 'created' | 'updated' | 'deleted', taskId: number) {
  transmit.broadcast('tasks', { action, taskId })
}

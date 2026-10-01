import { BaseTransformer } from '@adonisjs/core/transformers'
import type Task from '#models/task'

export default class TaskTransformer extends BaseTransformer<Task> {
  toObject() {
    return this.pick(this.resource, ['id'])
  }
}

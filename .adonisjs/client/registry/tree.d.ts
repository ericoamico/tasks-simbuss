/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  webTasks: {
    store: typeof routes['web_tasks.store']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  apiSessions: {
    store: typeof routes['api_sessions.store']
  }
  tasks: {
    index: typeof routes['tasks.index']
    show: typeof routes['tasks.show']
    store: typeof routes['tasks.store']
    updateStatus: typeof routes['tasks.update_status']
    update: typeof routes['tasks.update']
    destroy: typeof routes['tasks.destroy']
  }
}

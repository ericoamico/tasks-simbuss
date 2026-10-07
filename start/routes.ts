/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'

transmit.authorize('tasks', (ctx) => !!ctx.auth.user)
transmit.registerRoutes((route) => {
  route.use(middleware.auth())
})

router.get('/', [controllers.Home, 'index']).as('home').use(middleware.auth())

router
  .group(() => {
    router.post('/tasks', [controllers.WebTasks, 'store'])
    router.patch('/tasks/:id/status', [controllers.WebTasks, 'updateStatus'])
    router.patch('/tasks/:id', [controllers.WebTasks, 'update'])
    router.delete('/tasks/:id', [controllers.WebTasks, 'destroy'])
  })
  .use(middleware.auth())
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create']).as('new_account.create')
    router.post('signup', [controllers.NewAccount, 'store']).as('new_account.store')

    router.get('login', [controllers.Session, 'create']).as('session.create')
    router.post('login', [controllers.Session, 'store']).as('session.store')
  })
  .use(middleware.guest())

router.post('api/login', [controllers.ApiSessions, 'store'])
router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy']).as('session.destroy')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('tasks', [controllers.Tasks, 'index'])
    router.get('tasks/:id', [controllers.Tasks, 'show'])
    router.post('tasks', [controllers.Tasks, 'store'])
    router.patch('tasks/:id/status', [controllers.Tasks, 'updateStatus'])
    router.patch('tasks/:id', [controllers.Tasks, 'update'])
    router.delete('tasks/:id', [controllers.Tasks, 'destroy'])
  })
  .prefix('/api')
  .use(middleware.auth({ guards: ['api'] }))

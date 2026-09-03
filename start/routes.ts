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

router
  .get('/', [controllers.Home, 'index'])
  .as('home')
  .use(middleware.auth())

  router
  .post('/tasks', [controllers.WebTasks, 'store'])
  .use(middleware.auth())
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

  router.post('api/login', [controllers.ApiSessions, 'store'])
router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
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
  .use(middleware.auth({guards: ['api']}))

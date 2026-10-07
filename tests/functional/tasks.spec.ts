import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import env from '#start/env'

const baseUrl = `http://${env.get('HOST')}:${env.get('PORT')}`
async function request(path: string, method = 'GET', body?: object, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  })
}

async function responseStatus(...args: Parameters<typeof request>) {
  const response = await request(...args)
  return response.status
}

test.group('API and web tasks', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('validates login and rejects unauthenticated access', async ({ assert }) => {
    assert.equal(await responseStatus('/api/login', 'POST', {}), 422)
    assert.equal(await responseStatus('/api/tasks'), 401)
  })
  test('authenticates tokens, manages tasks, and isolates users', async ({ assert }) => {
    const user = await User.create({ email: 'test@example.com', password: 'password123' })
    const other = await User.create({ email: 'other@example.com', password: 'password123' })
    const foreign = await other
      .related('tasks')
      .create({ title: 'Private', description: 'Other user', type: 'bug' })
    const login = await request('/api/login', 'POST', {
      email: user.email,
      password: 'password123',
    })
    assert.equal(login.status, 200)
    const { token } = (await login.json()) as { token: string }
    assert.isString(token)
    const created = await request(
      '/api/tasks',
      'POST',
      { title: 'New task', description: 'Details', type: 'general' },
      token
    )
    assert.equal(created.status, 201)
    const task = (await created.json()) as { id: number; status: string }
    assert.equal(task.status, 'open')
    const list = await request('/api/tasks', 'GET', undefined, token)
    assert.deepEqual(
      ((await list.json()) as { id: number }[]).map((item) => item.id),
      [task.id]
    )
    for (const method of ['GET', 'PATCH', 'DELETE']) {
      assert.equal(
        await responseStatus(
          `/api/tasks/${foreign.id}`,
          method,
          method === 'PATCH' ? { title: 'Changed' } : undefined,
          token
        ),
        404
      )
    }
    assert.equal(
      await responseStatus(`/api/tasks/${task.id}/status`, 'PATCH', { status: 'invalid' }, token),
      422
    )
    const updated = await request(`/api/tasks/${task.id}`, 'PATCH', { title: 'Updated' }, token)
    assert.equal(((await updated.json()) as { title: string }).title, 'Updated')
    const status = await request(
      `/api/tasks/${task.id}/status`,
      'PATCH',
      { status: 'finished' },
      token
    )
    assert.equal(((await status.json()) as { status: string }).status, 'finished')
    assert.equal(await responseStatus(`/api/tasks/${task.id}`, 'DELETE', undefined, token), 204)
  })
  test('serves Inertia pages and protects browser forms with CSRF', async ({ assert }) => {
    for (const path of ['/login', '/signup']) {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { Accept: 'text/html' },
      })
      assert.equal(response.status, 200)
      assert.include(await response.text(), path.slice(1))
    }
    assert.equal(await responseStatus('/tasks', 'POST', {}), 302)
  })
  test('creates an account, creates a web task, logs out and logs back in', async ({ assert }) => {
    const cookies = new Map<string, string>()
    async function web(path: string, body?: object, method = body ? 'POST' : 'GET') {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        redirect: 'manual',
        headers: {
          'Accept': 'text/html',
          'Content-Type': 'application/json',
          'Cookie': [...cookies].map(([key, value]) => `${key}=${value}`).join('; '),
          ...(cookies.has('XSRF-TOKEN')
            ? { 'X-XSRF-TOKEN': decodeURIComponent(cookies.get('XSRF-TOKEN')!) }
            : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(';')[0]
        const separator = pair.indexOf('=')
        cookies.set(pair.slice(0, separator), pair.slice(separator + 1))
      }
      return response
    }
    await web('/signup')
    const signup = await web('/signup', {
      fullName: 'Test User',
      email: 'web@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })
    assert.equal(signup.status, 302)
    assert.equal(signup.headers.get('location'), '/')
    const created = await web('/tasks', {
      title: 'Browser task',
      description: 'Details',
      type: 'bug',
    })
    assert.equal(created.status, 302)
    const user = await User.findByOrFail('email', 'web@example.com')
    const task = await user.related('tasks').query().firstOrFail()
    assert.equal(task.status, 'open')
    const home = await web('/')
    assert.equal(home.status, 200)
    assert.include(await home.text(), 'Browser task')

    const other = await User.create({ email: 'foreign-web@example.com', password: 'password123' })
    const foreign = await other
      .related('tasks')
      .create({ title: 'Private', description: 'Private', type: 'bug', status: 'open' })
    const sharedHome = await web('/')
    assert.equal(sharedHome.status, 200)
    const html = await sharedHome.text()
    const pageMatch = html.match(
      /<script data-page="[^"]+" type="application\/json">([\s\S]*?)<\/script>/
    )
    assert.isNotNull(pageMatch)
    const page = JSON.parse(pageMatch![1]) as {
      props: { tasks: { id: number; canManage: boolean }[] }
    }
    assert.deepEqual(
      page.props.tasks.map((item: { id: number; canManage: boolean }) => ({
        id: item.id,
        canManage: item.canManage,
      })),
      [
        { id: foreign.id, canManage: false },
        { id: task.id, canManage: true },
      ]
    )
    for (const [path, method, body] of [
      [`/tasks/${foreign.id}`, 'PATCH', { title: 'Forbidden' }],
      [`/tasks/${foreign.id}/status`, 'PATCH', { status: 'finished' }],
      [`/tasks/${foreign.id}`, 'DELETE', {}],
    ] as const) {
      const forbidden = await web(path, body, method)
      assert.equal(forbidden.status, 404)
    }
    const updated = await web(
      `/tasks/${task.id}`,
      { title: 'Updated web task', description: 'Edited', type: 'suggestion' },
      'PATCH'
    )
    assert.equal(updated.status, 302)
    await task.refresh()
    assert.equal(task.title, 'Updated web task')
    assert.equal(task.type, 'suggestion')
    const invalidStatus = await web(`/tasks/${task.id}/status`, { status: 'invalid' }, 'PATCH')
    assert.equal(invalidStatus.status, 302)
    await task.refresh()
    assert.equal(task.status, 'open')
    const changedStatus = await web(`/tasks/${task.id}/status`, { status: 'finished' }, 'PATCH')
    assert.equal(changedStatus.status, 302)
    await task.refresh()
    assert.equal(task.status, 'finished')
    const deleted = await web(`/tasks/${task.id}`, {}, 'DELETE')
    assert.equal(deleted.status, 302)
    assert.isNull(await user.related('tasks').query().where('id', task.id).first())
    const logout = await web('/logout', {})
    assert.equal(logout.headers.get('location'), '/login')
    await web('/login')
    const login = await web('/login', { email: user.email, password: 'password123' })
    assert.equal(login.headers.get('location'), '/')
  })
})

/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'tasks.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/tasks',
    tokens: [{"old":"/api/tasks","type":0,"val":"api","end":""},{"old":"/api/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.index']['types'],
  },
  'tasks.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/tasks/:id',
    tokens: [{"old":"/api/tasks/:id","type":0,"val":"api","end":""},{"old":"/api/tasks/:id","type":0,"val":"tasks","end":""},{"old":"/api/tasks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tasks.show']['types'],
  },
  'tasks.store': {
    methods: ["POST"],
    pattern: '/api/tasks',
    tokens: [{"old":"/api/tasks","type":0,"val":"api","end":""},{"old":"/api/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.store']['types'],
  },
  'tasks.update_status': {
    methods: ["PATCH"],
    pattern: '/api/tasks/:id/status',
    tokens: [{"old":"/api/tasks/:id/status","type":0,"val":"api","end":""},{"old":"/api/tasks/:id/status","type":0,"val":"tasks","end":""},{"old":"/api/tasks/:id/status","type":1,"val":"id","end":""},{"old":"/api/tasks/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['tasks.update_status']['types'],
  },
  'tasks.update': {
    methods: ["PATCH"],
    pattern: '/api/tasks/:id',
    tokens: [{"old":"/api/tasks/:id","type":0,"val":"api","end":""},{"old":"/api/tasks/:id","type":0,"val":"tasks","end":""},{"old":"/api/tasks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tasks.update']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}

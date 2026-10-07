<script setup lang="ts">
import { nextTick, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import TaskCard from '~/components/task_card.vue'
import { Transmit } from '@adonisjs/transmit-client'
import { Head, router, useForm } from '@inertiajs/vue3'

type Task = {
  id: number
  title: string
  description: string
  type: 'bug' | 'suggestion' | 'general'
  status: 'open' | 'in_progress' | 'finished' | 'closed'
  canManage: boolean
}

const props = defineProps<{
  tasks: Task[]
}>()

const form = useForm({
  title: '',
  description: '',
  type: 'general' as 'bug' | 'suggestion' | 'general',
})

const listHeading = ref<HTMLHeadingElement>()
const message = ref('')
const realtimeMessage = ref('Conectando às atualizações automáticas...')
const busyTasks = ref(new Set<number>())
let pending = false
let refreshing = false
let disposed = false
let timer: ReturnType<typeof setTimeout> | undefined
let transmit: Transmit | undefined
let cleanup: (() => void) | undefined

function setBusy(id: number, busy: boolean) {
  const next = new Set(busyTasks.value)
  if (busy) next.add(id)
  else next.delete(id)
  busyTasks.value = next
}

function scheduleRefresh() {
  pending = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(refreshTasks, 250)
}

function refreshTasks() {
  if (disposed || !pending || refreshing) return
  if (form.processing || busyTasks.value.size) {
    realtimeMessage.value =
      'Há atualizações pendentes. A lista será atualizada após concluir ou cancelar as alterações.'
    return
  }
  pending = false
  refreshing = true
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  router.reload({
    only: ['tasks'],
    onSuccess: async () => {
      busyTasks.value = new Set(
        [...busyTasks.value].filter((id) => props.tasks.some((task) => task.id === id))
      )
      await nextTick()
      if (focused && !focused.isConnected && document.activeElement === document.body) {
        listHeading.value?.focus()
        realtimeMessage.value = 'Lista atualizada. O chamado selecionado foi removido.'
      } else {
        realtimeMessage.value = 'Lista de chamados atualizada.'
      }
    },
    onError: () => {
      realtimeMessage.value =
        'Não foi possível atualizar a lista. Use Atualizar chamados para tentar novamente.'
    },
    onFinish: () => {
      refreshing = false
      if (pending && !disposed) scheduleRefresh()
    },
  })
}
watch(
  () => form.processing || busyTasks.value.size > 0,
  (busy) => {
    if (!busy && pending) scheduleRefresh()
  }
)

onMounted(() => {
  function csrf(request: Request) {
    const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='))
    if (cookie)
      request.headers.set('X-XSRF-TOKEN', decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)))
    request.headers.set('Accept', 'application/json')
  }
  transmit = new Transmit({
    baseUrl: window.location.origin,
    beforeSubscribe: csrf,
    beforeUnsubscribe: csrf,
    onSubscription: () => {
      if (disposed) return
      realtimeMessage.value = 'Atualizações automáticas conectadas.'
      scheduleRefresh()
    },
    onSubscribeFailed: () => {
      realtimeMessage.value = 'Atualizações automáticas indisponíveis. Use Atualizar chamados.'
    },
    onReconnectFailed: () => {
      realtimeMessage.value =
        'Conexão interrompida. Reabra a página para reconectar ou use Atualizar chamados.'
    },
  })
  transmit.on('reconnecting', () => {
    realtimeMessage.value = 'Conexão interrompida. Tentando reconectar...'
  })
  const subscription = transmit.subscription('tasks')
  const stop = subscription.onMessage(() => scheduleRefresh())
  transmit.on('connected', () => {
    if (!disposed && !subscription.isCreated) void subscription.create()
  })
  cleanup = () => {
    stop()
    void subscription.delete().catch(() => {})
    transmit?.close()
  }
})
onBeforeUnmount(() => {
  disposed = true
  if (timer) clearTimeout(timer)
  cleanup?.()
})
async function afterDelete() {
  message.value = 'Chamado excluído com sucesso.'
  await nextTick()
  listHeading.value?.focus()
}

function createTask() {
  form.post('/tasks', {
    onSuccess: () => {
      form.reset()
      message.value = 'Chamado criado com sucesso.'
    },
  })
}
</script>

<template>
  <Head title="Chamados" />

  <div class="tasks-page">
    <p role="status" aria-live="polite">{{ message }}</p>
    <header>
      <h1>Chamados Simbuss</h1>

      <p>Organize bugs, sugestões e tarefas gerais do projeto.</p>
    </header>

    <section aria-labelledby="new-task-title">
      <h2 id="new-task-title">Nova tarefa</h2>

      <form @submit.prevent="createTask">
        <div>
          <label for="task-title">Título</label>

          <input
            id="task-title"
            v-model="form.title"
            :aria-invalid="form.errors.title ? 'true' : undefined"
            :aria-describedby="form.errors.title ? 'task-title-error' : undefined"
            type="text"
            required
          />

          <p v-if="form.errors.title" id="task-title-error" role="alert">
            {{ form.errors.title }}
          </p>
        </div>

        <div>
          <label for="task-description">Descrição</label>

          <textarea
            id="task-description"
            v-model="form.description"
            :aria-invalid="form.errors.description ? 'true' : undefined"
            :aria-describedby="form.errors.description ? 'task-description-error' : undefined"
            required
          ></textarea>

          <p v-if="form.errors.description" id="task-description-error" role="alert">
            {{ form.errors.description }}
          </p>
        </div>

        <div>
          <label for="task-type">Tipo</label>

          <select
            id="task-type"
            v-model="form.type"
            :aria-invalid="form.errors.type ? 'true' : undefined"
            :aria-describedby="form.errors.type ? 'task-type-error' : undefined"
          >
            <option value="general">Geral</option>
            <option value="bug">Bug</option>
            <option value="suggestion">Sugestão</option>
          </select>

          <p v-if="form.errors.type" id="task-type-error" role="alert">
            {{ form.errors.type }}
          </p>
        </div>

        <button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Criando...' : 'Criar tarefa' }}
        </button>
      </form>
    </section>

    <section aria-labelledby="tasks-title">
      <h2 id="tasks-title" ref="listHeading" tabindex="-1">Todos os chamados</h2>
      <p>Você pode consultar todos os chamados e gerenciar apenas os seus.</p>
      <p role="status" aria-live="polite" aria-atomic="true">{{ realtimeMessage }}</p>
      <button type="button" @click="scheduleRefresh">Atualizar chamados</button>

      <p v-if="tasks.length === 0">Nenhuma tarefa cadastrada.</p>

      <ul v-else>
        <li v-for="task in tasks" :key="task.id">
          <TaskCard :task="task" @deleted="afterDelete" @busy="setBusy(task.id, $event)" />
        </li>
      </ul>
    </section>
  </div>
</template>

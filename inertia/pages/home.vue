<script setup lang="ts">
import { nextTick, ref } from 'vue'
import TaskCard from '~/components/task_card.vue'
import { Head, useForm } from '@inertiajs/vue3'

type Task = {
  id: number
  title: string
  description: string
  type: 'bug' | 'suggestion' | 'general'
  status: 'open' | 'in_progress' | 'finished' | 'closed'
  canManage: boolean
}

defineProps<{
  tasks: Task[]
}>()

const form = useForm({
  title: '',
  description: '',
  type: 'general' as 'bug' | 'suggestion' | 'general',
})

const listHeading = ref<HTMLHeadingElement>()
const message = ref('')
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

      <p v-if="tasks.length === 0">Nenhuma tarefa cadastrada.</p>

      <ul v-else>
        <li v-for="task in tasks" :key="task.id">
          <TaskCard :task="task" @deleted="afterDelete" />
        </li>
      </ul>
    </section>
  </div>
</template>

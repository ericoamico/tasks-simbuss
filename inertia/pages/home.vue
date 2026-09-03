<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'

type Task = {
  id: number
  title: string
  description: string
  type: 'bug' | 'suggestion' | 'general'
  status: 'open' | 'in_progress' | 'finished'
}

defineProps<{
  tasks: Task[]
}>()

const form = useForm({
  title: '',
  description: '',
  type: 'general' as 'bug' | 'suggestion' | 'general',
})

function createTask() {
  form.post('/tasks', {
    onSuccess: () => {
      form.reset()
    },
  })
}
</script>

<template>
  <Head title="Tarefas" />

  <main>
    <header>
      <h1>Tarefas</h1>

      <p>
        Organize bugs, sugestões e tarefas gerais do projeto.
      </p>
    </header>

    <section aria-labelledby="new-task-title">
      <h2 id="new-task-title">Nova tarefa</h2>

      <form @submit.prevent="createTask">
        <div>
          <label for="task-title">Título</label>

          <input
            id="task-title"
            v-model="form.title"
            type="text"
            required
          />

          <p v-if="form.errors.title">
            {{ form.errors.title }}
          </p>
        </div>

        <div>
          <label for="task-description">Descrição</label>

          <textarea
            id="task-description"
            v-model="form.description"
            required
          ></textarea>

          <p v-if="form.errors.description">
            {{ form.errors.description }}
          </p>
        </div>

        <div>
          <label for="task-type">Tipo</label>

          <select
            id="task-type"
            v-model="form.type"
          >
            <option value="general">Geral</option>
            <option value="bug">Bug</option>
            <option value="suggestion">Sugestão</option>
          </select>

          <p v-if="form.errors.type">
            {{ form.errors.type }}
          </p>
        </div>

        <button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Criando...' : 'Criar tarefa' }}
        </button>
      </form>
    </section>

    <section aria-labelledby="tasks-title">
      <h2 id="tasks-title">Minhas tarefas</h2>

      <p v-if="tasks.length === 0">
        Nenhuma tarefa cadastrada.
      </p>

      <ul v-else>
        <li
          v-for="task in tasks"
          :key="task.id"
        >
          <article>
            <h3>{{ task.title }}</h3>

            <p>{{ task.description }}</p>

            <dl>
              <div>
                <dt>Tipo</dt>
                <dd>{{ task.type }}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{{ task.status }}</dd>
              </div>
            </dl>
          </article>
        </li>
      </ul>
    </section>
  </main>
</template>
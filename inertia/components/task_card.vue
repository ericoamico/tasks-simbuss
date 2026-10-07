<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useForm } from '@inertiajs/vue3'

type Task = {
  id: number
  title: string
  description: string
  type: 'bug' | 'suggestion' | 'general'
  status: 'open' | 'in_progress' | 'finished' | 'closed'
  canManage: boolean
}
const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ deleted: [] }>()
const types = { bug: 'Erro', suggestion: 'Sugestão', general: 'Geral' }
const statuses = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  finished: 'Concluído',
  closed: 'Fechado',
}
const editing = ref(false)
const confirmingDelete = ref(false)
const titleInput = ref<HTMLInputElement>()
const editButton = ref<HTMLButtonElement>()
const deleteButton = ref<HTMLButtonElement>()
const cancelDeleteButton = ref<HTMLButtonElement>()
const message = ref('')
const edit = useForm({
  title: props.task.title,
  description: props.task.description,
  type: props.task.type,
})
const status = useForm({ status: props.task.status })
const deletion = useForm({})
watch(
  () => props.task.status,
  (value) => {
    status.status = value
  }
)
async function startEdit() {
  edit.title = props.task.title
  edit.description = props.task.description
  edit.type = props.task.type
  edit.clearErrors()
  editing.value = true
  await nextTick()
  titleInput.value?.focus()
}
async function closeEdit() {
  editing.value = false
  await nextTick()
  editButton.value?.focus()
}
function save() {
  edit.patch(`/tasks/${props.task.id}`, {
    preserveScroll: true,
    onSuccess: () => {
      message.value = 'Chamado atualizado com sucesso.'
      void closeEdit()
    },
    onError: () => {
      message.value = 'Não foi possível salvar. Confira os campos.'
      void nextTick(() => titleInput.value?.focus())
    },
  })
}
function saveStatus() {
  status.patch(`/tasks/${props.task.id}/status`, {
    preserveScroll: true,
    onSuccess: () => {
      message.value = 'Status atualizado com sucesso.'
    },
    onError: () => {
      message.value = 'Não foi possível atualizar o status.'
    },
  })
}
async function confirmDelete() {
  confirmingDelete.value = true
  await nextTick()
  cancelDeleteButton.value?.focus()
}
async function cancelDelete() {
  confirmingDelete.value = false
  await nextTick()
  deleteButton.value?.focus()
}
function destroy() {
  deletion.delete(`/tasks/${props.task.id}`, {
    preserveScroll: true,
    onSuccess: () => emit('deleted'),
    onError: () => {
      message.value = 'Não foi possível excluir o chamado. Tente novamente.'
    },
  })
}
</script>

<template>
  <article class="task-card" :aria-labelledby="`heading-${task.id}`">
    <h3 :id="`heading-${task.id}`">{{ task.title }}</h3>
    <p class="task-description">{{ task.description }}</p>
    <dl>
      <div>
        <dt>Tipo</dt>
        <dd>{{ types[task.type] }}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{{ statuses[task.status] }}</dd>
      </div>
    </dl>
    <p role="status" aria-live="polite">{{ message }}</p>

    <p v-if="!task.canManage">Chamado de outro usuário. Disponível apenas para consulta.</p>
    <form
      v-if="task.canManage && editing"
      :aria-label="`Editar chamado: ${task.title}`"
      @submit.prevent="save"
    >
      <div>
        <label :for="`edit-title-${task.id}`">Título</label>
        <input
          :id="`edit-title-${task.id}`"
          ref="titleInput"
          v-model="edit.title"
          required
          maxlength="255"
          :aria-invalid="!!edit.errors.title"
          :aria-describedby="edit.errors.title ? `edit-title-error-${task.id}` : undefined"
        />
        <p v-if="edit.errors.title" :id="`edit-title-error-${task.id}`" role="alert">
          {{ edit.errors.title }}
        </p>
      </div>
      <div>
        <label :for="`edit-description-${task.id}`">Descrição</label>
        <textarea
          :id="`edit-description-${task.id}`"
          v-model="edit.description"
          required
          :aria-invalid="!!edit.errors.description"
          :aria-describedby="
            edit.errors.description ? `edit-description-error-${task.id}` : undefined
          "
        />
        <p v-if="edit.errors.description" :id="`edit-description-error-${task.id}`" role="alert">
          {{ edit.errors.description }}
        </p>
      </div>
      <div>
        <label :for="`edit-type-${task.id}`">Tipo</label>
        <select
          :id="`edit-type-${task.id}`"
          v-model="edit.type"
          :aria-invalid="!!edit.errors.type"
          :aria-describedby="edit.errors.type ? `edit-type-error-${task.id}` : undefined"
        >
          <option value="general">Geral</option>
          <option value="bug">Erro</option>
          <option value="suggestion">Sugestão</option>
        </select>
        <p v-if="edit.errors.type" :id="`edit-type-error-${task.id}`" role="alert">
          {{ edit.errors.type }}
        </p>
      </div>
      <div class="task-actions">
        <button type="submit" :disabled="edit.processing">
          {{ edit.processing ? 'Salvando...' : 'Salvar alterações' }}
        </button>
        <button type="button" :disabled="edit.processing" @click="closeEdit">
          Cancelar edição
        </button>
      </div>
    </form>
    <template v-else-if="task.canManage">
      <form :aria-label="`Alterar status: ${task.title}`" @submit.prevent="saveStatus">
        <div>
          <label :for="`status-${task.id}`">Status de {{ task.title }}</label>
          <select
            :id="`status-${task.id}`"
            v-model="status.status"
            :disabled="status.processing || deletion.processing"
            :aria-invalid="!!status.errors.status"
            :aria-describedby="
              status.errors.status
                ? `status-hint-${task.id} status-error-${task.id}`
                : `status-hint-${task.id}`
            "
          >
            <option v-if="task.status === 'closed'" value="closed" disabled>Fechado</option>
            <option value="open">Aberto</option>
            <option value="in_progress">Em andamento</option>
            <option value="finished">Concluído</option>
          </select>
          <p :id="`status-hint-${task.id}`">
            Selecione o status e use Atualizar status para salvar.
          </p>
          <p v-if="status.errors.status" :id="`status-error-${task.id}`" role="alert">
            {{ status.errors.status }}
          </p>
        </div>
        <button
          type="submit"
          :disabled="status.processing || deletion.processing || status.status === task.status"
          :aria-label="`Atualizar status de ${task.title}`"
        >
          {{ status.processing ? 'Atualizando...' : 'Atualizar status' }}
        </button>
      </form>
      <div class="task-actions">
        <button
          ref="editButton"
          type="button"
          :disabled="status.processing || deletion.processing"
          :aria-label="`Editar chamado: ${task.title}`"
          @click="startEdit"
        >
          Editar
        </button>
        <button
          ref="deleteButton"
          type="button"
          :disabled="status.processing || deletion.processing"
          :aria-label="`Excluir chamado: ${task.title}`"
          @click="confirmDelete"
        >
          Excluir
        </button>
      </div>
    </template>
    <section
      v-if="task.canManage && confirmingDelete"
      :aria-labelledby="`delete-heading-${task.id}`"
      @keydown.esc="cancelDelete"
    >
      <h4 :id="`delete-heading-${task.id}`">Excluir {{ task.title }}?</h4>
      <p :id="`delete-hint-${task.id}`">Esta ação exclui o chamado permanentemente.</p>
      <div class="task-actions">
        <button
          ref="cancelDeleteButton"
          type="button"
          :disabled="deletion.processing"
          @click="cancelDelete"
        >
          Cancelar exclusão
        </button>
        <button
          type="button"
          :disabled="deletion.processing"
          :aria-describedby="`delete-hint-${task.id}`"
          @click="destroy"
        >
          {{ deletion.processing ? 'Excluindo...' : 'Confirmar exclusão' }}
        </button>
      </div>
    </section>
  </article>
</template>

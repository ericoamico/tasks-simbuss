<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'
</script>

<template>
  <div class="form-container">
    <div>
      <h1>Login</h1>
      <p>Enter your details below to login to your account</p>
    </div>

    <div>
      <Form v-slot="{ processing, errors }" route="session.store">
        <div>
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            autocomplete="username"
            :aria-invalid="errors.email ? 'true' : undefined"
            :aria-describedby="errors.email ? 'email-error' : undefined"
            required
          />
          <div v-if="errors.email" id="email-error" role="alert">{{ errors.email }}</div>
        </div>

        <div>
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autocomplete="current-password"
            :aria-invalid="errors.password ? 'true' : undefined"
            :aria-describedby="errors.password ? 'password-error' : undefined"
            required
          />
          <div v-if="errors.password" id="password-error" role="alert">{{ errors.password }}</div>
        </div>

        <div>
          <button type="submit" class="button" :disabled="processing">Login</button>
        </div>
      </Form>
    </div>
  </div>
</template>

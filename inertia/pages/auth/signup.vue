<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'
</script>

<template>
  <div class="form-container">
    <div>
      <h1>Signup</h1>
      <p>Enter your details below to create your account</p>
    </div>

    <div>
      <Form v-slot="{ processing, errors }" route="new_account.store">
        <div>
          <label for="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            :aria-invalid="errors.fullName ? 'true' : undefined"
            :aria-describedby="errors.fullName ? 'fullName-error' : undefined"
            required
          />
          <div v-if="errors.fullName" id="fullName-error" role="alert">{{ errors.fullName }}</div>
        </div>

        <div>
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            autocomplete="email"
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
            autocomplete="new-password"
            :aria-invalid="errors.password ? 'true' : undefined"
            :aria-describedby="errors.password ? 'password-error' : undefined"
            required
          />
          <div v-if="errors.password" id="password-error" role="alert">{{ errors.password }}</div>
        </div>

        <div>
          <label for="passwordConfirmation">Confirm password</label>
          <input
            id="passwordConfirmation"
            type="password"
            name="passwordConfirmation"
            autocomplete="new-password"
            :aria-invalid="errors.passwordConfirmation ? 'true' : undefined"
            :aria-describedby="
              errors.passwordConfirmation ? 'passwordConfirmation-error' : undefined
            "
            required
          />
          <div v-if="errors.passwordConfirmation" id="passwordConfirmation-error" role="alert">
            {{ errors.passwordConfirmation }}
          </div>
        </div>

        <div>
          <button type="submit" class="button" :disabled="processing">Sign up</button>
        </div>
      </Form>
    </div>
  </div>
</template>

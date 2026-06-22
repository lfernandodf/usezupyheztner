<template>
  <q-layout class="vertical-center">
    <q-page-container>
      <q-page class="flex justify-center items-center">
        <q-ajax-bar position="top" color="primary" size="5px" />
        <q-card bordered class="card q-pa-md shadow-10"
          style="border-top:5px solid #3E72AF; background:rgba(255,255,255,0.75); border-radius:20px">
          <q-card-section class="text-primary text-center">
            <q-img src="/izing-logo_5_transparent.png" spinner-color="white"
              style="height:120px; max-width:300px" class="q-mb-lg q-px-md" />
            <q-separator spaced />
          </q-card-section>
          <q-card-section class="text-primary">
            <div class="text-h6">Cadastrar Nova Empresa</div>
            <div class="text-caption text-grey">Crie seu tenant e administrador</div>
          </q-card-section>
          <q-card-section>
            <q-input class="q-mb-md" clearable rounded v-model="form.tenantName"
              placeholder="Nome da empresa" @blur="$v.form.tenantName.$touch"
              :error="$v.form.tenantName.$error" error-message="Informe o nome." outlined>
              <template v-slot:prepend>
                <q-icon name="mdi-domain" color="primary" />
              </template>
            </q-input>
            <q-input class="q-mb-md" clearable rounded v-model="form.name"
              placeholder="Seu nome" @blur="$v.form.name.$touch"
              :error="$v.form.name.$error" error-message="Informe seu nome." outlined>
              <template v-slot:prepend>
                <q-icon name="mdi-account-outline" color="primary" />
              </template>
            </q-input>
            <q-input class="q-mb-md" clearable rounded v-model="form.email"
              placeholder="meu@email.com" @blur="$v.form.email.$touch"
              :error="$v.form.email.$error" error-message="E-mail inválido." outlined>
              <template v-slot:prepend>
                <q-icon name="mdi-email-outline" color="primary" />
              </template>
            </q-input>
            <q-input outlined rounded v-model="form.password"
              :type="isPwd ? 'password' : 'text'"
              :error="$v.form.password.$error" error-message="Mínimo 5 caracteres.">
              <template v-slot:prepend>
                <q-icon name="mdi-shield-key-outline" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer" @click="isPwd = !isPwd" />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions>
            <q-space />
            <q-btn class="q-mr-sm q-my-lg" style="width:200px" color="primary"
              rounded :loading="loading" @click="cadastrar">
              <span slot="loading"><q-spinner-puff class="on-left" />Cadastrando...</span>
              Cadastrar
            </q-btn>
          </q-card-actions>
          <q-card-section class="text-center">
            <span class="text-grey">Já possui cadastro? </span>
            <router-link to="/login" class="text-primary">Faça login</router-link>
          </q-card-section>
          <q-inner-loading :showing="loading" />
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { required, email, minLength } from 'vuelidate/lib/validators'
export default {
  name: 'CadastroTenant',
  data() {
    return {
      form: { tenantName: null, name: null, email: null, password: null },
      isPwd: true, loading: false
    }
  },
  validations: {
    form: {
      tenantName: { required }, name: { required },
      email: { required, email }, password: { required, minLength: minLength(5) }
    }
  },
  methods: {
    cadastrar() {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        this.$q.notify('Preencha todos os campos corretamente.')
        return
      }
      this.loading = true
      this.$axios.post('/tenants', this.form)
        .then(() => {
          this.$q.notify({ type: 'positive', message: 'Cadastrado! Faça o login.' })
          this.$router.push({ name: 'login' })
        })
        .catch(err => {
          this.$q.notify({
            type: 'negative',
            message: err.response?.data?.error || 'Erro ao cadastrar.'
          })
        })
        .finally(() => { this.loading = false })
    }
  }
}
</script>

<style scoped>
.card { width: 100%; max-width: 430px; }
.q-img__image { background-repeat: no-repeat; background-size: contain; }
</style>
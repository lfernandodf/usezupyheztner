<template>
  <q-layout class="vertical-center">
    <q-page-container>
      <q-page class="flex justify-center items-center">
        <q-ajax-bar
          position="top"
          color="primary"
          size="5px"
        />
        <q-card
          bordered
          class="card q-pa-md shadow-10"
          style="border-top: 5px solid #3E72AF; background-color: rgba(255,255,255,0.75); border-radius: 20px"
        >
          <q-card-section class="text-primary text-center">
            <q-img
              src="/logousezupy_transparent.png?v=2"
              spinner-color="white"
              style="height: 120px; max-width: 300px"
              class="q-mb-lg q-px-md"
            />
            <q-separator spaced />
          </q-card-section>
          <q-card-section class="text-primary">
            <div class="text-h6">Bem vindo!</div>
            <div class="text-caption text-grey">Faça login...</div>
          </q-card-section>

          <q-card-section>
            <q-input
              class="q-mb-md"
              clearable
              rounded
              v-model="form.email"
              placeholder="meu@email.com"
              @blur="$v.form.email.$touch"
              :error="$v.form.email.$error"
              error-message="Deve ser um e-mail válido."
              outlined
              @keypress.enter="fazerLogin"
            >
              <template v-slot:prepend>
                <q-icon
                  name="mdi-email-outline"
                  class="cursor-pointer"
                  color='primary'
                />
              </template>
            </q-input>

            <q-input
              outlined
              rounded
              v-model="form.password"
              :type="isPwd ? 'password' : 'text'"
              @keypress.enter="fazerLogin"
            >
              <template v-slot:prepend>
                <q-icon
                  name="mdi-shield-key-outline"
                  class="cursor-pointer"
                  color='primary'
                />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions>
            <q-space />
            <q-btn
              class="q-mr-sm q-my-lg"
              style="width: 150px"
              color="primary"
              rounded
              :loading="loading"
              @click="fazerLogin"
            >
              Login
              <span slot="loading">
                <q-spinner-puff class="on-left" />Logando...
              </span>
            </q-btn>
          </q-card-actions>
          <!-- <q-btn
            flat
            color="info"
            no-caps
            dense
            class="q-px-sm"
            label="Esqueci a senha"
            @click="modalEsqueciSenha=true"
          /> -->

          <q-inner-loading :showing="loading" />
        </q-card>
      </q-page>

      <q-dialog v-model="tenantSelectionDialog" persistent>
        <q-card style="min-width: 350px; max-width: 600px">
          <q-card-section class="text-h6">Selecione o tenant</q-card-section>
          <q-card-section>
            <q-select
              v-model="selectedTenantId"
              :options="tenants.map(t => ({ label: t.name, value: String(t.id) }))"
              option-value="value"
              option-label="label"
              label="Tenant"
              outlined
              dense
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="negative" @click="tenantSelectionDialog = false" />
            <q-btn color="primary" label="Confirmar" @click="confirmTenantSelection" />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </q-page-container>
  </q-layout>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
import { ListarTenants } from 'src/service/tenants'

export default {
  name: 'Login',
  data () {
    return {
      modalEsqueciSenha: false,
      emailRedefinicao: null,
      form: {
        email: null,
        password: null
      },
      contasCliente: {},
      isPwd: true,
      loading: false,
      tenantSelectionDialog: false,
      tenants: [],
      selectedTenantId: null
    }
  },
  validations: {
    form: {
      email: { required, email },
      password: { required }
    },
    emailRedefinicao: { required, email }
  },
  methods: {
    async fazerLogin () {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        this.$q.notify('Informe usuário e senha corretamente.')
        return
      }
      this.loading = true
      try {
        const data = await this.$store.dispatch('UserLogin', this.form)
        this.loading = false

        if (data.profile === 'superadmin') {
          const selectedTenantId = localStorage.getItem('selectedTenantId')
          if (!selectedTenantId) {
            await this.loadTenantsForSelection()
            return
          }
        }

        if (data.profile === 'admin' || data.profile === 'superadmin') {
          this.$router.push({ name: 'home-dashboard' })
        } else {
          this.$router.push({ name: 'atendimento' })
        }
      } catch (err) {
        console.error('exStore', err)
        this.loading = false
      }
    },
    async loadTenantsForSelection () {
      try {
        const { data } = await ListarTenants()
        this.tenants = data || []
        if (this.tenants.length === 0) {
          this.$q.notify({ type: 'negative', message: 'Nenhum tenant disponível para superadmin.' })
          return
        }
        if (this.tenants.length === 1) {
          this.selectedTenantId = this.tenants[0].id
          localStorage.setItem('selectedTenantId', String(this.selectedTenantId))
          this.$router.push({ name: 'home-dashboard' })
          return
        }
        this.tenantSelectionDialog = true
      } catch (error) {
        console.error('Erro ao carregar tenants', error)
        this.$q.notify({ type: 'negative', message: 'Erro ao carregar tenants. Tente novamente.' })
      }
    },
    async confirmTenantSelection () {
      if (!this.selectedTenantId) {
        this.$q.notify({ type: 'negative', message: 'Selecione um tenant antes de prosseguir.' })
        return
      }
      localStorage.setItem('selectedTenantId', String(this.selectedTenantId))
      this.tenantSelectionDialog = false
      this.$router.push({ name: 'home-dashboard' })
    },
    clear () {
      this.form.email = ''
      this.form.password = ''
      this.$v.form.$reset()
    }
  },
  mounted () {
  }
}
</script>
<style scoped>
#login-app {
  background: none;
}

.index {
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  text-align: center;
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
}

.index h1 {
  height: 150px;
}

.index h1 img {
  height: 100%;
}

.index h2 {
  color: #666;
  margin-bottom: 200px;
}

.index h2 p {
  margin: 0 0 50px;
}

.index .ivu-row-flex {
  height: 100%;
}

#indexLizi {
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  overflow: hidden;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.card {
  width: 100%;
  max-width: 430px;
}

.q-img__image {
  background-repeat: no-repeat;
  background-size: contain;
}
</style>

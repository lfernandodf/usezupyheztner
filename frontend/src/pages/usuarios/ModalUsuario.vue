<template>
  <q-dialog
    persistent
    :value="modalUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 600px">
      <q-card-section>
        <div class="text-h6">{{ modalTitle }}</div>
        <div v-if="isProfile && passwordOnly" class="text-caption text-grey-7">
          Informe a nova senha para atualizar seu acesso.
        </div>
      </q-card-section>
      <q-card-section class="q-col-gutter-sm">
        <div class="row q-col-gutter-sm" v-if="!passwordOnly">
          <div class="col-12">
            <c-input
              outlined
              v-model.trim="usuario.name"
              :validator="$v.usuario.name"
              @blur="$v.usuario.name.$touch"
              label="Nome"
            />
          </div>
          <div class="col-12">
            <c-input
              outlined
              :validator="$v.usuario.email"
              @blur="$v.usuario.email.$touch"
              v-model.trim="usuario.email"
              label="E-mail"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <c-input
              outlined
              v-model="usuario.password"
              :validator="$v.usuario.password"
              @blur="$v.usuario.password.$touch"
              :type="isPwd ? 'password' : 'text'"
              :label="passwordOnly ? 'Nova senha' : 'Senha'"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </c-input>
          </div>
          <div class="col-12" v-if="passwordOnly">
            <c-input
              outlined
              v-model="confirmPassword"
              :validator="$v.confirmPassword"
              @blur="$v.confirmPassword.$touch"
              :type="isPwdConfirm ? 'password' : 'text'"
              label="Confirmar nova senha"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwdConfirm = !isPwdConfirm"
                />
              </template>
            </c-input>
          </div>
          <div class="col-12" v-if="!passwordOnly">
            <q-select
              :disable="isProfile"
              outlined
              rounded
              dense
              v-model="usuario.profile"
              :options="optionsProfile"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Perfil"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          rounded
          label="Sair"
          class="q-px-md q-mr-sm"
          color="negative"
          v-close-popup
        />
        <q-btn
          rounded
          label="Salvar"
          class="q-px-md"
          color="primary"
          @click="handleUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { required, email, minLength, maxLength, sameAs } from 'vuelidate/lib/validators'
import { CriarUsuario, UpdateUsuarios } from 'src/service/user'
import { Notify } from 'quasar'
export default {
  name: 'ModalUsuario',
  props: {
    modalUsuario: {
      type: Boolean,
      default: false
    },
    isProfile: {
      type: Boolean,
      default: false
    },
    passwordOnly: {
      type: Boolean,
      default: false
    },
    usuarioEdicao: {
      type: Object,
      default: () => { return { id: null } }
    }
  },
  data () {
    return {
      isPwd: false,
      isPwdConfirm: false,
      confirmPassword: '',
      optionsProfile: [
        { value: 'user', label: 'Usuário' },
        { value: 'admin', label: 'Administrador' }
      ],
      usuario: {
        name: '',
        email: '',
        password: '',
        profile: 'user'
      }
    }
  },
  computed: {
    modalTitle () {
      if (this.passwordOnly) return 'Trocar senha'
      if (this.isProfile) return 'Meu perfil'
      return this.usuario.id ? 'Editar Usuário' : 'Cadastrar Usuário'
    }
  },
  validations () {
    if (this.passwordOnly) {
      return {
        usuario: {
          password: { required, minLength: minLength(6), maxLength: maxLength(50) }
        },
        confirmPassword: {
          required,
          sameAsPassword: sameAs(function () {
            return this.usuario.password
          })
        }
      }
    }

    let usuario = {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      email: { required, email },
      profile: { required },
      password: {}
    }
    if (!this.usuario.id) {
      usuario = {
        ...usuario,
        password: { required, minLength: minLength(6), maxLength: maxLength(50) }
      }
    }
    return { usuario }
  },
  methods: {
    abrirModal () {
      if (this.usuarioEdicao.id) {
        this.usuario = { ...this.usuarioEdicao }
      }
      if (this.usuarioEdicao.userId) {
        this.usuario = {
          ...this.usuarioEdicao,
          id: this.usuarioEdicao.userId,
          name: this.usuarioEdicao.username,
          profile: this.usuarioEdicao.profile
        }
      }
    },
    fecharModal () {
      if (!this.isProfile) {
        this.$emit('update:usuarioEdicao', {})
      }
      this.$emit('update:modalUsuario', false)
      this.confirmPassword = ''
      this.usuario = {
        name: '',
        email: '',
        password: '',
        profile: 'user'
      }
      this.isPwd = false
      this.isPwdConfirm = false
      this.$v.usuario.$reset()
      if (this.$v.confirmPassword) {
        this.$v.confirmPassword.$reset()
      }
    },
    async handleUsuario () {
      this.$v.usuario.$touch()
      if (this.$v.confirmPassword) {
        this.$v.confirmPassword.$touch()
      }
      if (this.$v.usuario.$error || (this.$v.confirmPassword && this.$v.confirmPassword.$error)) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: 'Ops! Verifique os erros...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }

      try {
        if (this.passwordOnly && this.usuario.id) {
          const params = {
            id: this.usuario.id,
            email: this.usuario.email,
            name: this.usuario.name,
            tenantId: this.usuario.tenantId,
            password: this.usuario.password
          }

          await UpdateUsuarios(this.usuario.id, params)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Senha atualizada com sucesso!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.fecharModal()
          return
        }

        if (this.usuario.id) {
          const {
            email, id, name, tenantId, password
          } = this.usuario

          const params = { email, id, name, tenantId, password }

          if (this.$store.state.user.isAdmin) {
            params.profile = this.usuario.profile
          }

          const { data } = await UpdateUsuarios(this.usuario.id, params)
          this.$emit('modalUsuario:usuario-editado', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Usuário editado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarUsuario(this.usuario)
          this.$emit('modalUsuario:usuario-criado', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Usuário criado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.fecharModal()
      } catch (error) {
        console.error(error, error.data.error === 'ERR_USER_LIMIT_USER_CREATION')
        if (error.data.error === 'ERR_USER_LIMIT_USER_CREATION') {
          Notify.create({
            type: 'negative',
            message: 'Limite de usuario atingido.',
            caption: 'ERR_USER_LIMIT_USER_CREATION',
            position: 'top',
            progress: true
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

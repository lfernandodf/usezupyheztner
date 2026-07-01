<template>
  <q-layout view="hHh Lpr lFf">

    <q-header
      class="bg-white text-grey-8 q-py-xs "
      height-hint="58"
      bordered
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        >
          <q-tooltip>Menu</q-tooltip>
        </q-btn>

        <q-btn
          flat
          no-caps
          no-wrap
          dense
          class="q-ml-sm"
          v-if="$q.screen.gt.xs"
        >
          <q-img
            src="/logousezupy_mini_transparent.png?v=2"
            spinner-color="primary"
            style="height: 50px; width: 140px"
          />
        </q-btn>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-select
            v-if="userProfile === 'superadmin'"
            outlined
            dense
            hide-dropdown-icon
            options-dense
            :options="tenantOptions"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            v-model="selectedTenantId"
            @input="handleChangeTenant"
            class="q-mr-md"
            style="min-width: 220px"
            label="Tenant selecionado"
          />
          <div v-if="userProfile === 'superadmin'" class="row items-center q-mr-md">
            <q-chip
              text-color="white"
              color="primary"
              outline
              dense
              class="q-ml-sm"
            >
              {{ selectedTenantName || 'Nenhum tenant selecionado' }}
            </q-chip>
          </div>
          <q-btn
            round
            dense
            flat
            color="grey-8"
            icon="notifications"
          >
            <q-badge
              color="red"
              text-color="white"
              floating
              v-if="(parseInt(notifications.count) + parseInt(notifications_p.count)) > 0"
            >
              {{ parseInt(notifications.count) + parseInt(notifications_p.count) }}
            </q-badge>
            <q-menu>
              <q-list style="min-width: 300px">

                <q-item v-if="(parseInt(notifications.count) + parseInt(notifications_p.count)) == 0">
                  <q-item-section style="cursor: pointer;">
                    Nada de novo por aqui!
                  </q-item-section>
                </q-item>
                <q-item v-if="parseInt(notifications_p.count) > 0">
                  <q-item-section
                    avatar
                    @click="() => $router.push({ name: 'atendimento' })"
                    style="cursor: pointer;"
                  >
                    <q-avatar
                      style="width: 60px; height: 60px"
                      color="blue"
                      text-color="white"
                    >
                      {{ notifications_p.count }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section
                    @click="() => $router.push({ name: 'atendimento' })"
                    style="cursor: pointer;"
                  >
                    Clientes pendentes na fila
                  </q-item-section>
                </q-item>
                <q-item
                  v-for="ticket in notifications.tickets"
                  :key="ticket.id"
                  style="border-bottom: 1px solid #ddd; margin: 5px;"
                >
                  <q-item-section
                    avatar
                    @click="abrirAtendimentoExistente(ticket.name, ticket)"
                    style="cursor: pointer;"
                  >
                    <q-avatar style="width: 60px; height: 60px">
                      <img :src="ticket.profilePicUrl">
                    </q-avatar>
                  </q-item-section>
                  <q-item-section
                    @click="abrirAtendimentoExistente(ticket.name, ticket)"
                    style="cursor: pointer;"
                  >
                    <q-list>
                      <q-item style="text-align:center; font-size: 17px; font-weight: bold; min-height: 0">{{ ticket.name
                      }}</q-item>
                      <q-item style="min-height: 0; padding-top: 0"><b>Mensagem: </b> {{ ticket.lastMessage }}</q-item>
                    </q-list>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-tooltip>Notificações</q-tooltip>
          </q-btn>
          <q-chip
            v-if="showSessionCounter"
            dense
            square
            :color="sessionCounterColor"
            :text-color="sessionCounterTextColor"
            :class="['q-ml-xs', { 'session-counter-blink': isSessionCounterCritical }]"
          >
            <q-icon :name="sessionCounterIcon" size="16px" class="q-mr-xs" />
            {{ sessionCountdownText }}
            <q-tooltip>Sessão expira por inatividade em {{ sessionCountdownText }}</q-tooltip>
          </q-chip>
          <q-avatar
            :color="usuario.status === 'offline' ? 'negative' : 'positive'"
            text-color="white"
            size="25px"
            :icon="usuario.status === 'offline' ? 'mdi-account-off' : 'mdi-account-check'"
            rounded
            class="q-ml-lg"
          >
            <q-tooltip>
              {{ usuario.status === 'offline' ? 'Usuário Offiline' : 'Usuário Online' }}
            </q-tooltip>
          </q-avatar>
          <q-btn
            round
            flat
            class="bg-padrao text-bold q-mx-sm q-ml-lg"
          >
            <q-avatar size="26px">
              {{ $iniciaisString(username) }}
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item-label header> Olá! <b> {{ username }} </b> </q-item-label>

                <cStatusUsuario
                  @update:usuario="atualizarUsuario"
                  :usuario="usuario"
                />
                <q-item
                  clickable
                  v-close-popup
                  @click="abrirModalUsuario"
                >
                  <q-item-section>Perfil</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="abrirModalTrocarSenha"
                >
                  <q-item-section>Trocar senha</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="efetuarLogout"
                >
                  <q-item-section>Sair</q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <cSystemVersion />
                  </q-item-section>
                </q-item>

              </q-list>
            </q-menu>

            <q-tooltip>Usuário</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay
      content-class="bg-white text-grey-9"
    >
      <q-scroll-area class="fit">
        <q-list
          padding
          :key="userProfile"
        >
          <EssentialLink
            v-for="item in menuData"
            :key="item.title"
            v-bind="item"
          />
          <div v-if="userProfile === 'admin' || userProfile === 'superadmin'">
            <q-separator spaced />
            <div class="q-mb-lg"></div>
            <template v-for="item in menuDataAdmin">
              <EssentialLink
                v-if="exibirMenuBeta(item) && (!item.onlySuperadmin || userProfile === 'superadmin')"
                :key="item.title"
                v-bind="item"
              />
            </template>
          </div>

        </q-list>
      </q-scroll-area>
      <div
        class="absolute-bottom text-center row justify-start"
        :class="{ 'bg-grey-3': $q.dark.isActive }"
        style="height: 40px"
      >
        <q-toggle
          size="xl"
          keep-color
          dense
          class="text-bold q-ml-xs"
          :icon-color="$q.dark.isActive ? 'black' : 'white'"
          :value="$q.dark.isActive"
          :color="$q.dark.isActive ? 'grey-3' : 'black'"
          checked-icon="mdi-white-balance-sunny"
          unchecked-icon="mdi-weather-sunny"
          @input="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
        >
          <q-tooltip content-class="text-body1 hide-scrollbar">
            {{ $q.dark.isActive ? 'Desativar' : 'Ativar' }} Modo Escuro (Dark Mode)
          </q-tooltip>
        </q-toggle>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-xs">
        <router-view :key="tenantRouteViewKey" />
      </q-page>
    </q-page-container>
    <audio ref="audioNotification">
      <source
        :src="alertSound"
        type="audio/mp3"
      >
    </audio>
    <ModalUsuario
      :isProfile="true"
      :passwordOnly="passwordOnlyModal"
      :modalUsuario.sync="modalUsuario"
      :usuarioEdicao.sync="usuario"
    />
  </q-layout>
</template>

<script>
import cSystemVersion from '../components/cSystemVersion.vue'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import EssentialLink from 'components/EssentialLink.vue'
import socketInitial from './socketInitial'
import alertSound from 'src/assets/sound.mp3'
import { format } from 'date-fns'
const username = localStorage.getItem('username')
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { mapGetters } from 'vuex'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { RealizarLogout } from 'src/service/login'
import cStatusUsuario from '../components/cStatusUsuario.vue'
import { socketIO } from 'src/utils/socket'
import { ConsultarTickets } from 'src/service/tickets'
import { ListarTenants } from 'src/service/tenants'

const socket = socketIO()

const objMenu = [
  {
    title: 'Dashboard',
    caption: '',
    icon: 'mdi-home',
    routeName: 'home-dashboard'
  },

  {
    title: 'Atendimentos',
    caption: 'Lista de atendimentos',
    icon: 'mdi-forum-outline',
    routeName: 'atendimento'
  },
  {
    title: 'Contatos',
    caption: 'Lista de contatos',
    icon: 'mdi-card-account-mail',
    routeName: 'contatos'
  }
]

const objMenuAdmin = [
  {
    title: 'Canais',
    caption: 'Canais de Comunicação',
    icon: 'mdi-cellphone-wireless',
    routeName: 'sessoes'
  },
  {
    title: 'Painel Atendimentos',
    caption: 'Visão geral dos atendimentos',
    icon: 'mdi-view-dashboard-variant',
    routeName: 'painel-atendimentos'
  },
  {
    title: 'Relatórios',
    caption: 'Relatórios gerais',
    icon: 'mdi-file-chart',
    routeName: 'relatorios'
  },
  {
    title: 'Usuarios',
    caption: 'Admin de usuários',
    icon: 'mdi-account-group',
    routeName: 'usuarios'
  },
  {
    title: 'Filas',
    caption: 'Cadastro de Filas',
    icon: 'mdi-arrow-decision-outline',
    routeName: 'filas'
  },
  {
    title: 'Tenants',
    caption: 'Gestão de tenants',
    icon: 'mdi-domain',
    routeName: 'tenants',
    onlySuperadmin: true
  },
  {
    title: 'Mensagens Rápidas',
    caption: 'Mensagens pré-definidas',
    icon: 'mdi-reply-all-outline',
    routeName: 'mensagens-rapidas'
  },
  {
    title: 'Chatbot',
    caption: 'Robô de atendimento',
    icon: 'mdi-robot',
    routeName: 'chat-flow'
  },
  {
    title: 'Etiquetas',
    caption: 'Cadastro de etiquetas',
    icon: 'mdi-tag-text',
    routeName: 'etiquetas'
  },
  {
    title: 'Horário de Atendimento',
    caption: 'Horário de funcionamento',
    icon: 'mdi-calendar-clock',
    routeName: 'horarioAtendimento'
  },
  {
    title: 'Configurações',
    caption: 'Configurações gerais',
    icon: 'mdi-cog',
    routeName: 'configuracoes'
  },
  {
    title: 'Campanha',
    caption: 'Campanhas de envio',
    icon: 'mdi-message-bookmark-outline',
    routeName: 'campanhas'
  },
  {
    title: 'API',
    caption: 'Integração sistemas externos',
    icon: 'mdi-call-split',
    routeName: 'api-service'
  }
]

export default {
  name: 'MainLayout',
  mixins: [socketInitial],
  components: { EssentialLink, ModalUsuario, cStatusUsuario, cSystemVersion },
  data () {
    return {
      username,
      domainExperimentalsMenus: ['@'],
      miniState: true,
      userProfile: 'user',
      modalUsuario: false,
      passwordOnlyModal: false,
      usuario: {},
      alertSound,
      leftDrawerOpen: false,
      menuData: objMenu,
      menuDataAdmin: objMenuAdmin,
      tenants: [],
      selectedTenantId: null,
      tenantViewVersion: 0,
      countTickets: 0,
      ticketsList: [],
      sessionCountdownText: '00:00',
      sessionSecondsLeft: 0,
      sessionCountdownInterval: null
    }
  },
  computed: {
    ...mapGetters(['notifications', 'notifications_p', 'whatsapps']),
    tenantOptions () {
      return this.tenants.map(tenant => ({
        label: tenant.name,
        value: String(tenant.id)
      }))
    },
    selectedTenantName () {
      const tenantId = String(this.selectedTenantId)
      const tenant = this.tenants.find(t => String(t.id) === tenantId)
      return tenant ? tenant.name : null
    },
    tenantRouteViewKey () {
      const localTenant = localStorage.getItem('selectedTenantId')
      const userTenant = this.usuario?.tenantId
      const activeTenant = String(this.selectedTenantId || localTenant || userTenant || '')
      return `${this.tenantViewVersion}::${activeTenant}`
    },
    cProblemaConexao () {
      const idx = this.whatsapps.findIndex(w =>
        ['PAIRING', 'TIMEOUT', 'DISCONNECTED'].includes(w.status)
      )
      return idx !== -1
    },
    cQrCode () {
      const idx = this.whatsapps.findIndex(
        w => w.status === 'qrcode' || w.status === 'DESTROYED'
      )
      return idx !== -1
    },
    cOpening () {
      const idx = this.whatsapps.findIndex(w => w.status === 'OPENING')
      return idx !== -1
    },
    cUsersApp () {
      return this.$store.state.usersApp
    },
    cObjMenu () {
      if (this.cProblemaConexao) {
        return objMenu.map(menu => {
          if (menu.routeName === 'sessoes') {
            menu.color = 'negative'
          }
          return menu
        })
      }
      return objMenu
    },
    showSessionCounter () {
      return !!localStorage.getItem('token') && this.sessionSecondsLeft > 0
    },
    sessionCounterColor () {
      if (this.sessionSecondsLeft <= 30) return 'negative'
      if (this.sessionSecondsLeft <= 120) return 'warning'
      return 'positive'
    },
    sessionCounterTextColor () {
      if (this.sessionSecondsLeft <= 30) return 'white'
      if (this.sessionSecondsLeft <= 120) return 'black'
      return 'white'
    },
    sessionCounterIcon () {
      if (this.sessionSecondsLeft <= 30) return 'priority_high'
      if (this.sessionSecondsLeft <= 120) return 'warning'
      return 'schedule'
    },
    isSessionCounterCritical () {
      return this.sessionSecondsLeft > 0 && this.sessionSecondsLeft <= 30
    }
  },
  methods: {
    formatCountdown (seconds) {
      const safeSeconds = Math.max(0, seconds)
      const minutes = Math.floor(safeSeconds / 60)
      const remainSeconds = safeSeconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`
    },
    updateSessionCountdown () {
      const deadlineRaw = localStorage.getItem('sessionIdleDeadlineAt')
      const deadline = Number(deadlineRaw)
      if (!deadlineRaw || !Number.isFinite(deadline)) {
        this.sessionSecondsLeft = 0
        this.sessionCountdownText = '00:00'
        return
      }

      const secondsLeft = Math.ceil((deadline - Date.now()) / 1000)
      this.sessionSecondsLeft = Math.max(0, secondsLeft)
      this.sessionCountdownText = this.formatCountdown(secondsLeft)
    },
    startSessionCountdown () {
      this.stopSessionCountdown()
      this.updateSessionCountdown()
      this.sessionCountdownInterval = setInterval(() => {
        this.updateSessionCountdown()
      }, 1000)
    },
    stopSessionCountdown () {
      if (this.sessionCountdownInterval) {
        clearInterval(this.sessionCountdownInterval)
        this.sessionCountdownInterval = null
      }
    },
    onSessionIdleUpdated () {
      this.updateSessionCountdown()
    },
    exibirMenuBeta (itemMenu) {
      if (!itemMenu?.isBeta) return true
      for (const domain of this.domainExperimentalsMenus) {
        if (this.usuario.email.indexOf(domain) !== -1) return true
      }
      return false
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    handlerNotifications (data) {
      const { message, contact, ticket } = data

      const options = {
        body: `${message.body} - ${format(new Date(), 'HH:mm')}`,
        icon: contact.profilePicUrl,
        tag: ticket.id,
        renotify: true
      }

      const notification = new Notification(
        `Mensagem de ${contact.name}`,
        options
      )

      notification.onclick = e => {
        e.preventDefault()
        window.focus()
        this.$store.dispatch('AbrirChatMensagens', ticket)
        this.$router.push({ name: 'atendimento' })
      }
      this.$nextTick(() => {
        // utilizar refs do layout
        this.$refs.audioNotification.play()
      })
    },
    async abrirModalUsuario () {
      this.passwordOnlyModal = false
      this.modalUsuario = true
    },
    async abrirModalTrocarSenha () {
      this.passwordOnlyModal = true
      this.modalUsuario = true
    },
    async efetuarLogout () {
      try {
        await RealizarLogout(this.usuario)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('queues')
        localStorage.removeItem('usuario')
        localStorage.removeItem('filtrosAtendimento')
        localStorage.removeItem('selectedTenantId')

        this.$router.replace({ name: 'login' })
      } catch (error) {
        this.$notificarErro('Não foi possível realizar logout', error)
      }
    },
    async atualizarUsuario (usuario = null) {
      const currentUser = usuario || JSON.parse(localStorage.getItem('usuario') || '{}')
      if (!currentUser || Object.keys(currentUser).length === 0) {
        return
      }
      this.usuario = currentUser
      localStorage.setItem('usuario', JSON.stringify(this.usuario))
      this.userProfile = this.usuario.profile || localStorage.getItem('profile') || 'user'
      if (this.userProfile === 'superadmin') {
        await this.loadTenantSelection()
      }
    },
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
    },
    async loadTenantSelection () {
      try {
        const { data } = await ListarTenants()
        this.tenants = data || []
        const storedTenantId = localStorage.getItem('selectedTenantId')
        if (storedTenantId && this.tenants.some(t => String(t.id) === storedTenantId)) {
          this.selectedTenantId = storedTenantId
        } else if (this.tenants.length > 0) {
          this.selectedTenantId = String(this.tenants[0].id)
          localStorage.setItem('selectedTenantId', this.selectedTenantId)
        }
      } catch (error) {
        console.error('Erro ao carregar tenants', error)
      }
    },
    handleChangeTenant (value) {
      const tenantId = String(value)
      const previousTenantId = String(localStorage.getItem('selectedTenantId') || this.usuario?.tenantId || '')
      if (tenantId === previousTenantId) {
        return
      }
      this.selectedTenantId = tenantId
      localStorage.setItem('selectedTenantId', tenantId)
      localStorage.removeItem('filtrosAtendimento')
      this.usuario = {
        ...this.usuario,
        tenantId
      }
      localStorage.setItem('usuario', JSON.stringify(this.usuario))
      this.tenantViewVersion += 1
      this.$root.$emit('tenant:changed', tenantId)
      this.$q.notify({
        type: 'positive',
        message: 'Tenant selecionado: ' + (this.tenants.find(t => String(t.id) === tenantId)?.name || ''),
        position: 'top'
      })
    },
    conectarSocket (usuario) {
      this.usuario = JSON.parse(localStorage.getItem('usuario'))
      if (this.usuario.status === 'offline') {
        socket.emit(`${this.usuario.tenantId}:setUserIdle`)
      }
      if (this.usuario.status === 'online') {
        socket.emit(`${this.usuario.tenantId}:setUserActive`)
      }
    },
    async consultarTickets () {
      const params = {
        searchParam: '',
        pageNumber: 1,
        status: ['open'],
        showAll: false,
        count: null,
        queuesIds: [],
        withUnreadMessages: true,
        isNotAssignedUser: false,
        includeNotQueueDefined: true
      }
      try {
        const { data } = await ConsultarTickets(params)
        this.countTickets = data.count // count total de tickets no status
        this.$store.commit('UPDATE_NOTIFICATIONS', data)
      } catch (err) {
        this.$notificarErro('Algum problema', err)
        console.error(err)
      }
      const params2 = {
        searchParam: '',
        pageNumber: 1,
        status: ['pending'],
        showAll: false,
        count: null,
        queuesIds: [],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true
      }
      try {
        const { data } = await ConsultarTickets(params2)
        this.countTickets = data.count // count total de tickets no status
        this.$store.commit('UPDATE_NOTIFICATIONS_P', data)
      } catch (err) {
        this.$notificarErro('Algum problema', err)
        console.error(err)
      }
    },
    abrirChatContato (ticket) {
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    abrirAtendimentoExistente (contato, ticket) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `${contato} possui um atendimento em curso (Atendimento: ${ticket.id}). Deseja abrir o atendimento?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        try {
          this.abrirChatContato(ticket)
        } catch (error) {
          this.$notificarErro(
            'Não foi possível atualizar o token',
            error
          )
        }
      })
    }
  },
  async mounted () {
    this.atualizarUsuario()
    await this.listarWhatsapps()
    await this.listarConfiguracoes()
    await this.consultarTickets()
    if (!('Notification' in window)) {
    } else {
      Notification.requestPermission()
    }
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    this.userProfile = localStorage.getItem('profile')
    if (this.userProfile === 'superadmin') {
      await this.loadTenantSelection()
    }
    await this.conectarSocket(this.usuario)
    window.addEventListener('session-idle-updated', this.onSessionIdleUpdated)
    this.startSessionCountdown()
  },
  destroyed () {
    window.removeEventListener('session-idle-updated', this.onSessionIdleUpdated)
    this.stopSessionCountdown()
    socket.disconnect()
  }
}
</script>
<style scoped>
.q-img__image {
  background-size: contain;
}

.session-counter-blink {
  animation: sessionBlink 0.9s step-end infinite;
}

@keyframes sessionBlink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0.35;
  }
}
</style>

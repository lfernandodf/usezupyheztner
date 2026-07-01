<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
import { RealizarLogout } from 'src/service/login'

export default {
  name: 'App',
  data () {
    return {
      DEFAULT_IDLE_TIMEOUT_MINUTES: 5,
      idleTimer: null,
      isIdleLoggingOut: false,
      idleEvents: [
        'click',
        'mousemove',
        'mousedown',
        'keydown',
        'scroll',
        'touchstart'
      ]
    }
  },
  methods: {
    getIdleTimeoutMs () {
      const configuracoes = JSON.parse(localStorage.getItem('configuracoes') || '[]')
      const conf = configuracoes.find(c => c.key === 'sessionIdleTimeoutMinutes')
      const minutes = Number(conf?.value || this.DEFAULT_IDLE_TIMEOUT_MINUTES)
      const safeMinutes = Number.isFinite(minutes) && minutes >= 1 ? minutes : this.DEFAULT_IDLE_TIMEOUT_MINUTES
      return safeMinutes * 60 * 1000
    },
    hasActiveSession () {
      const token = localStorage.getItem('token')
      return !!token
    },
    clearSessionStorage () {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('profile')
      localStorage.removeItem('userId')
      localStorage.removeItem('queues')
      localStorage.removeItem('usuario')
      localStorage.removeItem('filtrosAtendimento')
      localStorage.removeItem('selectedTenantId')
      localStorage.removeItem('sessionIdleDeadlineAt')
    },
    clearIdleTimer () {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
        this.idleTimer = null
      }
    },
    bindIdleEvents () {
      this.idleEvents.forEach(eventName => {
        window.addEventListener(eventName, this.resetIdleTimer, { passive: true })
      })
    },
    unbindIdleEvents () {
      this.idleEvents.forEach(eventName => {
        window.removeEventListener(eventName, this.resetIdleTimer)
      })
    },
    resetIdleTimer () {
      this.clearIdleTimer()
      if (!this.hasActiveSession() || this.isIdleLoggingOut) return

      const timeoutMs = this.getIdleTimeoutMs()
      const deadlineAt = Date.now() + timeoutMs
      localStorage.setItem('sessionIdleDeadlineAt', String(deadlineAt))
      window.dispatchEvent(new Event('session-idle-updated'))

      this.idleTimer = setTimeout(() => {
        this.handleIdleLogout()
      }, timeoutMs)
    },
    async handleIdleLogout () {
      if (this.isIdleLoggingOut || !this.hasActiveSession()) return

      this.isIdleLoggingOut = true

      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      const userId = usuario.userId || localStorage.getItem('userId')

      try {
        if (userId) {
          await RealizarLogout({ userId })
        }
      } catch (error) {
        // limpeza local continua mesmo se a API de logout falhar
      } finally {
        this.clearSessionStorage()
        if (this.$route?.name !== 'login') {
          this.$router.replace({ name: 'login', query: { sessionExpired: '1' } })
        }
        this.$q.notify({
          type: 'warning',
          message: 'Sessão encerrada por inatividade.',
          position: 'top'
        })
        this.isIdleLoggingOut = false
      }
    }
  },
  beforeMount () {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (usuario?.configs?.isDark) {
      this.$q.dark.set(usuario?.configs?.isDark)
    }
  },
  mounted () {
    this.bindIdleEvents()
    this.resetIdleTimer()
  },
  beforeDestroy () {
    this.unbindIdleEvents()
    this.clearIdleTimer()
  }

}
</script>

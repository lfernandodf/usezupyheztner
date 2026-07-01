<template>
  <div>
    <q-list class="text-weight-medium">
      <q-item-label
        header
        class="text-bold text-h6 q-mb-lg"
      >Configurações</q-item-label>

      <q-item-label
        caption
        class="q-mt-lg q-pl-sm"
      >Módulo: Atendimento</q-item-label>
      <q-separator spaced />

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Não visualizar Tickets já atribuidos à outros usuários</q-item-label>
          <q-item-label caption>Somente o usuário responsável pelo ticket e/ou os administradores visualizarão a atendimento.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewAssignedTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewAssignedTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('NotViewAssignedTickets')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Não visualizar Tickets no ChatBot</q-item-label>
          <q-item-label caption>Somente administradores poderão visualizar tickets que estivem interagindo com o ChatBot.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewTicketsChatBot"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewTicketsChatBot === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('NotViewTicketsChatBot')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Forçar atendimento via Carteira</q-item-label>
          <q-item-label caption>Caso o contato tenha carteira vínculada, o sistema irá direcionar o atendimento somente para os donos da carteira de clientes.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="DirectTicketsToWallets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="DirectTicketsToWallets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('DirectTicketsToWallets')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Fluxo ativo para o Bot de atendimento</q-item-label>
          <q-item-label caption>Fluxo a ser utilizado pelo Bot para os novos atendimentos</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-select
            style="width: 300px"
            outlined
            dense
            rounded
            v-model="botTicketActive"
            :options="listaChatFlow"
            map-options
            emit-value
            option-value="id"
            option-label="name"
            @input="atualizarConfiguracao('botTicketActive')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Ignorar Mensagens de Grupo</q-item-label>
          <q-item-label caption>Habilitando esta opção o sistema não abrirá ticket para grupos</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="ignoreGroupMsg"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="ignoreGroupMsg === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('ignoreGroupMsg')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Recusar chamadas no Whatsapp</q-item-label>
          <q-item-label caption>Quando ativo, as ligações de aúdio e vídeo serão recusadas, automaticamente.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="rejectCalls"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="rejectCalls === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('rejectCalls')"
          />
        </q-item-section>
      </q-item>

      <div
        class="row q-px-md"
        v-if="rejectCalls === 'enabled'"
      >
        <div class="col-12">
          <q-input
            rounded
            v-model="callRejectMessage"
            type="textarea"
            autogrow
            dense
            outlined
            label="Mensagem ao rejeitar ligação:"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('callRejectMessage')"
          />
        </div>
      </div>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Tempo de sessão por inatividade (minutos)</q-item-label>
          <q-item-label caption>Após esse período sem ação, o sistema realiza logout automático.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-input
            style="width: 180px"
            outlined
            dense
            rounded
            type="number"
            min="1"
            max="240"
            v-model.number="sessionIdleTimeoutMinutes"
            label="Minutos"
            debounce="600"
            @input="atualizarConfiguracao('sessionIdleTimeoutMinutes')"
          />
        </q-item-section>
      </q-item>
    </q-list>

  </div>
</template>

<script>
import { ListarChatFlow } from 'src/service/chatFlow'
import { ListarConfiguracoes, AlterarConfiguracao } from 'src/service/configuracoes'
export default {
  name: 'IndexConfiguracoes',
  data () {
    return {
      configuracoes: [],
      listaChatFlow: [],
      NotViewAssignedTickets: null,
      NotViewTicketsChatBot: null,
      DirectTicketsToWallets: null,
      botTicketActive: null,
      ignoreGroupMsg: null,
      rejectCalls: null,
      callRejectMessage: '',
      sessionIdleTimeoutMinutes: 5
    }
  },
  methods: {
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      this.configuracoes = data
      this.configuracoes.forEach(el => {
        let value = el.value
        if (el.key === 'botTicketActive' && el.value) {
          value = +el.value
        }
        if (el.key === 'sessionIdleTimeoutMinutes' && el.value) {
          value = +el.value
        }
        this.$data[el.key] = value
      })
    },
    async listarChatFlow () {
      const { data } = await ListarChatFlow()
      this.listaChatFlow = data.chatFlow
    },
    async atualizarConfiguracao (key) {
      const currentConfig = this.configuracoes.find(c => c.key === key)
      const previousValue = currentConfig && currentConfig.value !== undefined
        ? currentConfig.value
        : null

      if (key === 'sessionIdleTimeoutMinutes') {
        const n = Number(this.$data[key])
        if (!Number.isFinite(n) || n < 1) this.$data[key] = 1
        if (n > 240) this.$data[key] = 240
      }

      const params = {
        key,
        value: String(this.$data[key])
      }
      try {
        const { data } = await AlterarConfiguracao(params)
        const idx = this.configuracoes.findIndex(c => c.key === key)
        if (idx >= 0) {
          this.configuracoes[idx].value = data.value
        } else {
          this.configuracoes.push(data)
        }
        this.$q.notify({
          type: 'positive',
          message: 'Configuração alterada!',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        if (previousValue !== null) {
          this.$data[key] = key === 'sessionIdleTimeoutMinutes' ? +previousValue : previousValue
        }
        this.$notificarErro('Ocorreu um erro!', error)
      }
    }
  },
  async mounted () {
    await this.listarConfiguracoes()
    await this.listarChatFlow()
  }
}
</script>

<style lang="scss" scoped>
</style>

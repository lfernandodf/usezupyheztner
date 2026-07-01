<template>
  <div>
    <q-table
      class="my-sticky-dynamic q-ma-lg"
      title="Tenants"
      :data="tenants"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-input
          style="width: 300px"
          outlined
          rounded
          dense
          class="col-grow"
          debounce="500"
          v-model="filter"
          clearable
          placeholder="Localize"
          @input="filtrarTenant"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space />
        <q-btn
          rounded
          class="q-ml-md col"
          :class="{
            'q-ml-none q-mt-md q-mr-md': $q.screen.width < 500
          }"
          color="primary"
          label="Adicionar"
          @click="abrirModalTenant()"
        />
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            @click="editarTenant(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarTenant(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ tenants.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>

    <q-dialog
      persistent
      v-model="modalTenant"
    >
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ tenant.id ? 'Editar Tenant' : 'Cadastrar Tenant' }}</div>
        </q-card-section>

        <q-card-section class="q-col-gutter-sm">
          <q-input
            outlined
            dense
            v-model="tenant.name"
            label="Nome"
          />
          <q-select
            outlined
            dense
            v-model="tenant.status"
            label="Status"
            :options="statusOptions"
            option-value="value"
            option-label="label"
          />
          <q-input
            outlined
            dense
            v-model.number="tenant.ownerId"
            label="ID do proprietário"
            type="number"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup @click="fecharModalTenant" />
          <q-btn flat label="Salvar" color="primary" @click="salvarTenant" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ListarTenants, CriarTenant, AtualizarTenant, DeletarTenant } from 'src/service/tenants'
import { Notify } from 'quasar'

export default {
  name: 'IndexTenants',
  data () {
    return {
      tenants: [],
      filter: null,
      modalTenant: false,
      tenant: {
        name: '',
        status: 'active',
        ownerId: null
      },
      loading: false,
      pagination: {
        rowsPerPage: 20,
        rowsNumber: 0,
        lastIndex: 0
      },
      statusOptions: [
        { label: 'Ativo', value: 'active' },
        { label: 'Inativo', value: 'inactive' }
      ],
      columns: [
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        { name: 'status', label: 'Status', field: 'status', align: 'left' },
        { name: 'ownerId', label: 'Proprietário', field: 'ownerId', align: 'left' },
        { name: 'createdAt', label: 'Criado em', field: 'createdAt', align: 'left', format: v => v ? new Date(v).toLocaleString() : '' },
        { name: 'updatedAt', label: 'Atualizado em', field: 'updatedAt', align: 'left', format: v => v ? new Date(v).toLocaleString() : '' },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarTenants () {
      this.loading = true
      const { data } = await ListarTenants()
      this.tenants = data
      this.pagination.rowsNumber = data.length
      this.pagination.lastIndex = data.length - 1
      this.loading = false
    },
    filtrarTenant () {
      if (!this.filter) {
        this.listarTenants()
        return
      }
      const value = this.filter.toLowerCase()
      this.tenants = this.tenants.filter(t =>
        t.name.toLowerCase().includes(value) ||
        t.status.toLowerCase().includes(value) ||
        String(t.ownerId).includes(value)
      )
    },
    abrirModalTenant () {
      this.tenant = {
        name: '',
        status: 'active',
        ownerId: null
      }
      this.modalTenant = true
    },
    fecharModalTenant () {
      this.modalTenant = false
    },
    editarTenant (tenant) {
      this.tenant = { ...tenant }
      this.modalTenant = true
    },
    async salvarTenant () {
      try {
        if (this.tenant.id) {
          const { data } = await AtualizarTenant(this.tenant.id, this.tenant)
          const index = this.tenants.findIndex(t => t.id === data.id)
          if (index !== -1) {
            this.tenants.splice(index, 1, data)
          }
          Notify.create({ type: 'positive', message: 'Tenant atualizado com sucesso!', position: 'top' })
        } else {
          const { data } = await CriarTenant(this.tenant)
          this.tenants.unshift(data)
          Notify.create({ type: 'positive', message: 'Tenant criado com sucesso!', position: 'top' })
        }
        this.fecharModalTenant()
      } catch (error) {
        console.error(error)
        Notify.create({ type: 'negative', message: 'Erro ao salvar tenant', position: 'top' })
      }
    },
    deletarTenant (tenant) {
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente deletar este tenant?',
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
          await DeletarTenant(tenant.id)
          this.tenants = this.tenants.filter(t => t.id !== tenant.id)
          Notify.create({ type: 'positive', message: 'Tenant excluído com sucesso!', position: 'top' })
        } catch (error) {
          console.error(error)
          Notify.create({ type: 'negative', message: 'Erro ao excluir tenant', position: 'top' })
        }
      })
    }
  },
  mounted () {
    this.listarTenants()
  }
}
</script>

<style scoped>
</style>

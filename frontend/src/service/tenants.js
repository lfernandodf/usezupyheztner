import request from 'src/service/request'

export function ListarTenants () {
  return request({
    url: '/admin/tenants',
    method: 'get'
  })
}

export function CriarTenant (data) {
  return request({
    url: '/admin/tenants',
    method: 'post',
    data
  })
}

export function AtualizarTenant (tenantId, data) {
  return request({
    url: `/admin/tenants/${tenantId}`,
    method: 'put',
    data
  })
}

export function DeletarTenant (tenantId) {
  return request({
    url: `/admin/tenants/${tenantId}`,
    method: 'delete'
  })
}

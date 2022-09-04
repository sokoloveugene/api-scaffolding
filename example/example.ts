import { ApiBuilder } from '../src/api.builder'
import { schema } from './api.schema'
import { axios } from './axios'
// Generate interfaces npm run types
import { IRootService } from './output'

const domains = {
  api_v1: 'http://localhost:4200/api',
  api_v2: 'http://localhost:8000',
}

const api = ApiBuilder.setAxios(axios)
  .setDomains(domains)
  .from<IRootService>(schema)

api.heartbeat()

api.client.update<any, { test: boolean }>({
  id: 12,
  isPrimary: true,
  payload: { test: true },
})

// AXIOS get on, http://localhost:4200/api/customer/123 DECORATED TO JSON
api.client.get({
  id: 123,
  config: { headers: { 'X-Requested-With': 'XMLHttpRequest' } },
})

// AXIOS patch on, http://localhost:8000/customer/123?primary=true with {"age":18,"hobby":"Java"}
api.client.update({
  id: 123,
  isPrimary: true,
  payload: { age: 18, hobby: 'Java' },
})

// AXIOS put on, http://localhost:8000/product/primary/pants?subproducts=true with {"size":"S","color":"black"}
api.product.add.primary({
  hasSubproducts: true,
  productType: 'pants',
  payload: { size: 'S', color: 'black' },
  config: { headers: { 'X-Requested-With': 'XMLHttpRequest' } },
})

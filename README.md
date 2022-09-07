#### Instalation

```
npm install api-scaffolding
```

#### Types generation

Run the CLI tool to scan your API-schema for TS interfaces.

```bash
npx api-scaffolding-types -i example.ts -o types.ts --watch
```

Make sure input file has exported schema

```typescript
export const schema = {...}
```

#### Usage

```typescript
/**
 * Example with axios as http client
 * import axios from "axios";
 *
 * Usage of auto-generated types
 * import { IRootService } from ""
 *
 * Fn collection of middlewares
 * Data mappers can be used
 */

const Fn = {
  data: (res: any) => res.data,
  log: (data: unknown) => (console.log(data), data),
}

const schema = {
  heartbeat: GET`{{api_v2}}/heartbeat => ${Fn.data} ${Fn.log}`,
  client: {
    get: GET`{{api_v1}}/customer/{{id:number}} => ${Fn.data} ${Fn.log}`,
    update: PATCH`{{api_v2}}/customer/{{id:number}} => ${Fn.log}`,
  },
  product: {
    delete: DELETE`{{api_v1}}/product/{{id:number}}/{{type:string}}`,
    add: {
      primary: PUT`{{api_v2}}/product/primary/{{type:string}} => ${Fn.log}`,
      default: POST`{{api_v2}}/product/{{type:string}}?subproducts={{hasSubproducts:boolean}}`,
    },
  },
}

const domains = {
  api_v1: 'http://localhost:4200/api',
  api_v2: 'http://localhost:8000',
}

const api = ApiBuilder.setHttpClient(axios)
  .setDomains(domains)
  .from<IRootService>(schema)

const example = async () => {
  await api.heartbeat()

  await api.client.get({
    id: 123,
    config: { headers: { 'X-Requested-With': 'XMLHttpRequest' } },
  })

  type IClient = { name: string; age: 23 }

  await api.client.update<IClient, Partial<IClient>>({
    id: 123,
    payload: { name: 'Josh' },
  })

  await api.product.add.primary<unknown, { name: string }>({
    type: 'server',
    payload: { name: 'Node-server' },
  })
}
```

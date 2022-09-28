#### Install library

```bash
npm install api-scaffolding
```

#### Create api schema

```typescript
// schema.ts
import { GET, DELETE, PATCH, POST, PUT } from 'api-scaffolding'
import { AxiosResponse } from 'axios'

const Fn = {
  data: (res: AxiosResponse) => res.data,
  log: <T = any>(data: T): T => (console.log(data), data),
}

export const schema = {
  post: {
    getById: GET`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.log}`,
    getAll: GET`{{api}}/posts => ${Fn.data} ${Fn.log}`,
    create: POST`{{api}}/posts => ${Fn.data} ${Fn.log}`,
    update: PUT`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.log}`,
    patch: PATCH`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.log}`,
    delete: DELETE`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.log}`,
    filter: GET`{{api}}/posts?userId={{userId:number}} => ${Fn.data} ${Fn.log}`,
  },
  todos: {
    getById: GET`{{api}}/todos/{{todoId:number}} => ${Fn.data} ${Fn.log}`,
  },
}
```

#### Generate types

Make sure schema.ts file has named export of schema

Types can be generated once

```bash
npx api-scaffolding-types -i schema.ts -o types.ts
```

Or generate in watch mode

```bash
npx api-scaffolding-types -i schema.ts -o types.ts --watch
```

#### Check generated types

It will automatically format file if prettier is installed

```bash
npm install prettier -D
```

```typescript
export interface IPostService {
  getById<R>(params: { postId: number; config?: any }): Promise<R>
  getAll<R>(params?: { config?: any }): Promise<R>
  create<R, P = unknown>(params?: { payload?: P; config?: any }): Promise<R>
  update<R, P = unknown>(params: {
    postId: number
    payload?: P
    config?: any
  }): Promise<R>
  patch<R, P = unknown>(params: {
    postId: number
    payload?: P
    config?: any
  }): Promise<R>
  delete<R>(params: { postId: number; config?: any }): Promise<R>
  filter<R>(params: { userId: number; config?: any }): Promise<R>
}

export interface ITodosService {
  getById<R>(params: { todoId: number; config?: any }): Promise<R>
}

export interface IRootService {
  post: IPostService
  todos: ITodosService
}
```

#### Import schema and types to create api instance

```typescript
// index.ts
import axios from 'axios'
import { IRootService } from './types'
import { ApiBuilder } from 'api-scaffolding'
import { schema } from './schema'

const domains = {
  api: 'https://jsonplaceholder.typicode.com',
}

const api = ApiBuilder.setHttpClient(axios)
  .setDomains(domains)
  .from<IRootService>(schema)

interface Post {
  id: number
  title: string
  body: string
  userId: number
}

const example = async () => {
  await api.post.getById({ postId: 1 })

  await api.post.getAll()

  await api.post.create<Post, Omit<Post, 'id'>>({
    payload: {
      title: 'foo',
      body: 'bar',
      userId: 1,
    },
  })

  await api.post.update<Post, Post>({
    postId: 1,
    payload: {
      id: 1,
      title: 'foo',
      body: 'bar',
      userId: 1,
    },
  })

  await api.post.patch<Post, Partial<Post>>({
    postId: 1,
    payload: {
      title: 'foo',
    },
  })

  await api.post.delete({
    postId: 1,
  })

  await api.post.filter({
    userId: 2,
  })

  await api.todos.getById({
    todoId: 1,
  })
}

example()
```

#### Test

```bash
npx ts-node index.ts
```

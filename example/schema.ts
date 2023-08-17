// node src/generate.js --input=example/schema.ts --output=example/types.ts --watch --name=API
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

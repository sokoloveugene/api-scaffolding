import { GET, DELETE, PATCH, POST, PUT } from '../src/index'
import { AxiosResponse } from 'axios'

const Fn = {
  data: (res: AxiosResponse) => res.data,
  log: <T = any>(data: T): T => (console.log(data), data),
}

export const schema = {
  Posts: {
    get: {
      byId: GET`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.log}`,
      all: GET`{{api}}/posts => ${Fn.data} ${Fn.log}`,
    },
    create: POST`{{api}}/posts => ${Fn.data} ${Fn.log}`,
    update: PUT`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.log}`,
    patch: PATCH`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.log}`,
    delete: DELETE`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.log}`,
    filter: GET`{{api}}/posts?userId={{userId:number}} => ${Fn.data} ${Fn.log}`,
  },
  Todos: {
    get: {
      byId: GET`{{api}}/todos/{{todoId:number}} => ${Fn.data} ${Fn.log}`,
    },
  },
  Relationships: {
    get: {
      byId: GET`{{api}}/relationships/{{todoId:number}} => ${Fn.data} ${Fn.log}`,
    },
  },
}

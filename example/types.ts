export interface IGetService1 {
  byId<R>(params: { postId: number; config?: any }): Promise<R>
  all<R>(params?: { config?: any }): Promise<R>
}

export interface IPostsService1 {
  get: IGetService1
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

export interface IGetService2 {
  byId<R>(params: { todoId: number; config?: any }): Promise<R>
}

export interface ITodosService1 {
  get: IGetService2
}

export interface IGetService3 {
  byId<R>(params: { todoId: number; config?: any }): Promise<R>
}

export interface IRelationshipsService1 {
  get: IGetService3
}

export interface IRootService1 {
  Posts: IPostsService1
  Todos: ITodosService1
  Relationships: IRelationshipsService1
}

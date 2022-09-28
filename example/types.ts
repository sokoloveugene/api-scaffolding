export interface IPostService {
  getById<R>(params: { postId: number; config?: any }): Promise<R>;
  getAll<R>(params?: { config?: any }): Promise<R>;
  create<R, P = unknown>(params?: { payload?: P; config?: any }): Promise<R>;
  update<R, P = unknown>(params: {
    postId: number;
    payload?: P;
    config?: any;
  }): Promise<R>;
  patch<R, P = unknown>(params: {
    postId: number;
    payload?: P;
    config?: any;
  }): Promise<R>;
  delete<R>(params: { postId: number; config?: any }): Promise<R>;
  filter<R>(params: { userId: number; config?: any }): Promise<R>;
}

export interface ITodosService {
  getById<R>(params: { todoId: number; config?: any }): Promise<R>;
}

export interface IRootService {
  post: IPostService;
  todos: ITodosService;
}

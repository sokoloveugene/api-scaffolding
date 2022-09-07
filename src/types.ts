export enum EMethod {
  GET = 'get',
  DELETE = 'delete',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
}

export interface IHttpClient<Config = unknown> {
  get<R = any>(url: string, config?: Config): Promise<R>
  delete<R = any>(url: string, config?: Config): Promise<R>
  post<R = any, D = any>(url: string, payload?: D, config?: Config): Promise<R>
  put<R = any, D = any>(url: string, payload?: D, config?: Config): Promise<R>
  patch<R = any, D = any>(url: string, payload?: D, config?: Config): Promise<R>
}

export type TQuery = {
  type: '__query__'
  hasPayload: boolean
  method: EMethod
  url: string
  handlers: Function[]
}

export interface IRecurcive<T> {
  [key: string]: T | Record<string, T> | IRecurcive<T>
}

export type ApiSchema = IRecurcive<TQuery>

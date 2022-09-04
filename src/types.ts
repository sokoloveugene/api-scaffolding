import { TQuery } from './query'

export interface IRecurcive<T> {
  [key: string]: T | Record<string, T> | IRecurcive<T>
}

export type TApiSchema = IRecurcive<TQuery>

export interface IParameters {
  [key: string]: unknown
}

export interface IHttpClient<Config = unknown> {
  get<R = any>(url: string, config?: Config): Promise<R>
  delete<R = any>(url: string, config?: Config): Promise<R>
  post<R = any, D = any>(url: string, payload?: D, config?: Config): Promise<R>
  put<R = any, D = any>(url: string, payload?: D, config?: Config): Promise<R>
  patch<R = any, D = any>(url: string, payload?: D, config?: Config): Promise<R>
}

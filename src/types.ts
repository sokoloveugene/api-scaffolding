import { TQuery } from './query'

export interface IRecurcive<T> {
  [key: string]: T | Record<string, T> | IRecurcive<T>
}

export type TApiSchema = IRecurcive<TQuery>

export interface IParameters {
  [key: string]: unknown
}

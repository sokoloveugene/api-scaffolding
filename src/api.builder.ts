import { isQuery, TQuery } from './query'
import { compose } from './helpers'
import { TApiSchema, IParameters, IRecurcive } from './types'

export class ApiBuilder {
  static domains: Record<string, string> = {}
  static http: any

  api: IRecurcive<Function>

  static setHttpClient(http: any) {
    this.http = http
    return ApiBuilder
  }

  static setDomains(map: Record<string, string>) {
    this.domains = map
    return ApiBuilder
  }

  static from<Generated = any>(schema: TApiSchema): Generated {
    return new ApiBuilder(schema) as unknown as Generated
  }

  constructor(schema: TApiSchema) {
    this.api = {}
    this.buildApi(schema)
    // @ts-ignore
    return this.api
  }

  buildApi(schema: TApiSchema, reference = this.api) {
    for (const [key, value] of Object.entries(schema)) {
      if (isQuery(value)) reference[key] = this.createHandler(value)
      else this.buildApi(value, (reference[key] = {}))
    }
  }

  createHandler(query: TQuery) {
    return async (params = {}) => {
      const { method, url, payload, handler, config } = this.preprocess(
        query,
        params
      )

      return ApiBuilder.http[method]
        .apply(null, query.hasPayload ? [url, payload, config] : [url, config])
        .then(handler)
    }
  }

  preprocess(query: TQuery, parameters: IParameters = {}) {
    return {
      method: query.method,
      url: query.url.replace(/{{(.*?)}}/g, (match, $1) => {
        const [param] = $1.split(':') // param:boolean
        const replacer = parameters[param] ?? ApiBuilder.domains[param]
        return String(replacer)
      }),
      payload: parameters.payload,
      config: parameters.config,
      handler: compose(...query.handlers),
    }
  }
}

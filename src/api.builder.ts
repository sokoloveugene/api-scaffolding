import { isQuery } from './query'
import { compose } from './helpers'
import { ApiSchema, IRecurcive, IHttpClient, TQuery } from './types'

export class ApiBuilder {
  private static domains: Record<string, string> = {}

  private static http: IHttpClient

  static setDomains(map: Record<string, string>) {
    this.domains = map
    return ApiBuilder
  }

  static setHttpClient<Config = unknown>(http: IHttpClient<Config>) {
    ApiBuilder.http = http
    return ApiBuilder
  }

  static from<Generated = any>(schema: ApiSchema): Generated {
    return new ApiBuilder(schema) as unknown as Generated
  }

  private api: IRecurcive<Function>

  private constructor(schema: ApiSchema) {
    this.api = {}
    this.buildApi(schema)
    // @ts-ignore
    return this.api
  }

  private buildApi(schema: ApiSchema, reference = this.api) {
    for (const [key, value] of Object.entries(schema)) {
      if (isQuery(value)) reference[key] = this.createHandler(value)
      else this.buildApi(value, (reference[key] = {}))
    }
  }

  private createHandler(query: TQuery) {
    return async (params = {}) => {
      const { method, url, payload, handler, config } = this.preprocess(
        query,
        params
      )

      return ApiBuilder.http[method]
        .apply(
          null,
          // @ts-ignore
          query.hasPayload ? [url, payload, config] : [url, config]
        )
        .then(handler)
    }
  }

  private preprocess(query: TQuery, parameters: Record<string, unknown> = {}) {
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

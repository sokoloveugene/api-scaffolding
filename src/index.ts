/* eslint-disable @typescript-eslint/ban-types */
import { IsNeverType, Methods, Parameters } from './definition'

export type Handler = (options: {
  url: string
  method: Methods
  payload?: any
  config?: any
}) => Promise<any>

export class Repository {
  domains: Record<string, string> = {}
  handler: Handler = () => {
    throw new Error('Handler is not initialized')
  }

  setHandler(handler: Handler) {
    this.handler = handler
    return this
  }

  setDomains(value: Record<string, string>) {
    this.domains = value
    return this
  }

  use<Response, Payload = never, Config = never>(method: Methods) {
    type Body = IsNeverType<Payload> extends true ? {} : { payload: Payload }
    type Options = IsNeverType<Config> extends true ? {} : { config: Config }

    return <Url extends string>(url: Url) => {
      return async (
        options: Parameters<Url> & Body & Options
      ): Promise<Response> => {
        // @ts-ignore
        const { payload, config, ...parameters } = options
        return await this.handler({
          url: this.interpolateUrl(url, parameters),
          method,
          payload,
          config,
        })
      }
    }
  }

  private interpolateUrl(url: string, parameters: Record<string, any>) {
    const interpolation = /{{(\w+)}}|:(\w+)/g
    return url.replace(interpolation, (match, domain, paramName) => {
      if (domain) return this.domains?.[domain] ?? match
      if (paramName) return parameters?.[paramName] ?? match
      return match
    })
  }
}

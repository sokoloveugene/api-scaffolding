import { isQuery, TQuery } from './query'
import { capitalize } from './helpers'
import { TApiSchema } from './types'

export class ApiInterfaceBuilder {
  generatedInterfaces: Set<string>

  constructor(schema: TApiSchema) {
    this.generatedInterfaces = new Set()
    this.getInterface('RootService', schema)
  }

  getInterface(name: string, schema: TApiSchema) {
    const parts = []

    parts.push(`export interface ${this.getInterfaceName(name)} {`)

    for (const [field, value] of Object.entries(schema)) {
      if (isQuery(value)) {
        const generic = `<R${value.hasPayload ? ', P = unknown' : ''}>`
        parts.push(`${field}${generic}${this.getMethod(value)}`)
      } else {
        parts.push(`${field}: ${this.getInterfaceName(field)},`)
        this.getInterface(field, value)
      }
    }

    parts.push('}')
    this.generatedInterfaces.add(parts.join('\n'))
  }

  getMethod(query: TQuery) {
    const listOfParams = this.getArgumentList(query.url)
    const isParamOptional = !listOfParams.length

    const parts = []
    parts.push(`(params${isParamOptional ? '?' : ''}: {`)

    for (const param of listOfParams) {
      const [name, type = 'unknown'] = param.split(/\??:/)
      parts.push(`${name}: ${type},`)
    }

    if (query.hasPayload) {
      parts.push(`payload?: P,`)
    }

    parts.push(`config?: any,`)

    parts.push(`})`)
    return parts.join('\n').concat(`: ${this.returnType}`)
  }

  getArgumentList(template: string) {
    return [...template.matchAll(/{{(.*?)}}/g)].reduce(
      (acc, match, index) => (index === 0 ? acc : [...acc, match[1]]),
      []
    )
  }

  getInterfaceName(serviceName: string) {
    const base = `I${capitalize(serviceName)}`
    return base.endsWith('Service') ? base : `${base}Service`
  }

  get returnType() {
    return `Promise<R>;` as const
  }

  get serialized() {
    return [...this.generatedInterfaces].join('\n\n')
  }
}

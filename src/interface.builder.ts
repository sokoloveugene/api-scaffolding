import { isQuery } from './query'
import { capitalize } from './helpers'
import { ApiSchema, TQuery } from './types'

export class ApiInterfaceBuilder {
  usedInterfaceNames: string[]
  generatedInterfaces: string[]

  constructor(schema: ApiSchema) {
    this.usedInterfaceNames = []
    this.generatedInterfaces = []
    this.getInterface('RootService', schema)
  }

  getInterface(name: string, schema: ApiSchema, interfaceName?: string) {
    const parts = []

    parts.push(
      `export interface ${interfaceName ?? this.getInterfaceName(name)} {`
    )

    for (const [field, value] of Object.entries(schema)) {
      if (isQuery(value)) {
        const generic = `<R${value.hasPayload ? ', P = unknown' : ''}>`
        parts.push(`${field}${generic}${this.getMethod(value)}`)
      } else {
        const interfaceName = this.getInterfaceName(field)
        parts.push(`${field}: ${interfaceName},`)
        this.getInterface(field, value, interfaceName)
      }
    }

    parts.push('}')
    this.generatedInterfaces.push(parts.join('\n'))
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

    parts.push(`}): Promise<R>`)
    return parts.join('')
  }

  getArgumentList(template: string) {
    return [...template.matchAll(/{{(.*?)}}/g)].reduce(
      (acc, match, index) => (index === 0 ? acc : [...acc, match[1]]),
      []
    )
  }

  normalizeInterfaceName(serviceName: string) {
    const capitalized = capitalize(serviceName)
    const serviceEnded = capitalized.endsWith('Service')
      ? capitalized
      : `${capitalized}Service`
    return `I${serviceEnded}`
  }

  getInterfaceName(serviceName: string) {
    const base = this.normalizeInterfaceName(serviceName)
    let i = 1
    while (this.usedInterfaceNames.includes(base + i.toString())) {
      i++
    }
    const interfaceName = base + i.toString()
    this.usedInterfaceNames.push(interfaceName)
    return interfaceName
  }

  get serialized() {
    return this.generatedInterfaces.join('\n\n')
  }
}

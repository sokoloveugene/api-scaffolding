import { EMethod, TQuery } from './types'
const TYPE = '__query__' as const

const query = (
  method: EMethod,
  [template]: TemplateStringsArray,
  ...handlers: Function[]
): TQuery => {
  const [url] = template.split(/\s+/)

  return {
    type: TYPE,
    hasPayload: [EMethod.POST, EMethod.PUT, EMethod.PATCH].includes(method),
    method,
    url,
    handlers: handlers.filter((f) => typeof f === 'function'),
  }
}

export const GET = query.bind(null, EMethod.GET)
export const POST = query.bind(null, EMethod.POST)
export const PUT = query.bind(null, EMethod.PUT)
export const PATCH = query.bind(null, EMethod.PATCH)
export const DELETE = query.bind(null, EMethod.DELETE)

export const isQuery = (val: unknown): val is TQuery => {
  // @ts-ignore
  return Boolean(val) && typeof val === 'object' && val['type'] === TYPE
}

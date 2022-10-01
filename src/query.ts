import { EMethod, TQuery } from './types'
const TYPE = '__query__' as const

const combine = (templates: TemplateStringsArray, inserts: unknown[]) => {
  return templates.reduce((acc, left, index) => {
    const insert = inserts[index]
    const right = ['undefined', 'function'].includes(typeof insert)
      ? ''
      : insert
    return `${acc}${left}${right}`
  }, '')
}

const query = (
  method: EMethod,
  templates: TemplateStringsArray,
  ...inserts: unknown[]
): TQuery => {
  const [url] = combine(templates, inserts).split(/\s|=>/)

  return {
    type: TYPE,
    hasPayload: [EMethod.POST, EMethod.PUT, EMethod.PATCH].includes(method),
    method,
    url,
    handlers: inserts.filter((f) => typeof f === 'function') as Function[],
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

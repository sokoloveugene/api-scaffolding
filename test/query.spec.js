import { GET, POST, PUT, PATCH, DELETE, isQuery } from '../src/query'

const fn1 = () => null
const fn2 = () => undefined
const ID = '123'

const query = {
  get: GET`{{api}}/${ID}/path => ${fn1} ${fn2}`,
  post: POST`{{api}}/path`,
  put: PUT`{{api}}/path=>${fn1} ${fn2}`,
  patch: PATCH`{{api}}/path/${ID}${fn1} ${fn2}`,
  delete: DELETE`{{api}}/path ${fn1}`,
}

describe('Query', () => {
  test('GET returns correct value', () => {
    const expected = {
      type: '__query__',
      hasPayload: false,
      method: 'get',
      url: '{{api}}/123/path',
      handlers: [fn1, fn2],
    }

    expect(query.get).toEqual(expected)
  })

  test('POST returns correct value', () => {
    const expected = {
      type: '__query__',
      hasPayload: true,
      method: 'post',
      url: '{{api}}/path',
      handlers: [],
    }

    expect(query.post).toEqual(expected)
  })

  test('PUT returns correct value', () => {
    const expected = {
      type: '__query__',
      hasPayload: true,
      method: 'put',
      url: '{{api}}/path',
      handlers: [fn1, fn2],
    }

    expect(query.put).toEqual(expected)
  })

  test('PATCH returns correct value', () => {
    const expected = {
      type: '__query__',
      hasPayload: true,
      method: 'patch',
      url: '{{api}}/path/123',
      handlers: [fn1, fn2],
    }

    expect(query.patch).toEqual(expected)
  })

  test('DELETE returns correct value', () => {
    const expected = {
      type: '__query__',
      hasPayload: false,
      method: 'delete',
      url: '{{api}}/path',
      handlers: [fn1],
    }

    expect(query.delete).toEqual(expected)
  })
})

describe('isQuery returns', () => {
  test.each(Object.entries(query))('true when %s', (type, value) => {
    expect(isQuery(value)).toBe(true)
  })

  test.each([
    ['number', 123],
    ['string', '123'],
    ['null', null],
    ['undefined', undefined],
    ['empty object', {}],
    ['object with queries', query],
  ])('false when %s', (type, value) => {
    expect(isQuery(value)).toBe(false)
  })
})

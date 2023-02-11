import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { GET } from '../src/query'
import { ApiBuilder } from '../src/api.builder'

const Fn = {
  data: (response) => response.data,
  uppercase: (str) => str.toUpperCase(),
}

export const schema = {
  Post: {
    getAll: GET`{{api}}/posts => ${Fn.data}`,
    getById: GET`{{api}}/posts/{{postId:number}} => ${Fn.data} ${Fn.uppercase}`,
  },
  Todo: {
    getById: GET`{{api}}/todos/{{todoId:number}} => ${Fn.data}`,
  },
}

describe('Generated api', () => {
  let mock
  let api

  beforeAll(() => {
    const domains = {
      api: 'http://api.com',
    }
    api = ApiBuilder.setHttpClient(axios).setDomains(domains).from(schema)
  })

  beforeEach(() => {
    mock = new MockAdapter(axios)
  })

  it('returns data on GET reqest', async () => {
    const URL = 'http://api.com/posts'
    const data = ['post1', 'post2']
    mock.onGet(URL).reply(200, data)

    const response = await api.Post.getAll()

    expect(mock.history.get[0].url).toBe(URL)
    expect(response).toEqual(data)
  })

  it('returns data on GET request with parameter for URL', async () => {
    const URL = 'http://api.com/posts/1'
    const data = 'post1'
    mock.onGet(URL).reply(200, data)

    const response = await api.Post.getById({ postId: 1 })

    expect(mock.history.get[0].url).toBe(URL)
    expect(response).toEqual(data.toUpperCase())
  })
})

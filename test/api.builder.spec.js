import { Repository } from '../src/index'

const repo = new Repository()
  /* Define implementation for making request */
  .setHandler((options) => {
    if (options.url === 'https://test.com/posts' && options.method === 'GET') {
      return Promise.resolve(['post1', 'post2'])
    }

    if (options.url === 'https://test.com/posts/1') {
      return Promise.resolve('post1')
    }

    return Promise.resolve(options)
  })
  /* Define shortcuts. Example of usage "{{api}}/todos/:todoId" */
  .setDomains({
    api: 'https://test.com',
  })

const api = {
  postModel: {
    findOne: repo.use('GET')('{{api}}/posts/:postId'),
    findAll: repo.use('GET')('{{api}}/posts'),
    create: repo.use('POST')('{{api}}/posts'),
    update: repo.use('PUT')('{{api}}/posts/:postId'),
    patch: repo.use('PATCH')('{{api}}/posts/:postId'),
    delete: repo.use('DELETE')('{{api}}/posts/:postId'),
    filter: repo.use('GET')('{{api}}/posts?userId=:userId'),
  },

  todoModel: {
    findOne: repo.use('GET')('{{api}}/todos/:todoId'),
  },

  use: (...args) => {
    return repo.use(...args)
  },
}

describe('Generated api', () => {
  it('returns data on GET request', async () => {
    const response = await api.postModel.findAll({})
    expect(response).toEqual(['post1', 'post2'])
  })

  it('returns data on GET request with parameter for URL', async () => {
    const response = await api.postModel.findOne({ postId: '1' })
    expect(response).toEqual('post1')
  })

  it('returns data on GET request with parameter for URL', async () => {
    const response = await api.postModel.findOne({ postId: '2' })
    expect(response).toEqual({
      config: undefined,
      method: 'GET',
      payload: undefined,
      url: 'https://test.com/posts/2',
    })
  })

  it('returns data on GET request with parameter for URL', async () => {
    const response = await api.postModel.create({
      config: {
        token: '#123',
      },
      payload: {
        title: 'foo',
        body: 'bar',
        userId: 1,
      },
    })
    expect(response).toEqual({
      config: {
        token: '#123',
      },
      method: 'POST',
      payload: {
        title: 'foo',
        body: 'bar',
        userId: 1,
      },
      url: 'https://test.com/posts',
    })
  })
})

import { Repository } from '../src/index';

const repo = new Repository()
  /* Define implementation for making request */
  .setHandler((options) => {
    return fetch(options.url).then((response) => response.json());
  })
  /* Define shortcuts. Example of usage "{{api}}/todos/:todoId" */
  .setDomains({
    api: 'https://jsonplaceholder.typicode.com'
  });

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const api = {
  postModel: {
    findOne: repo.use<Post>('GET')('{{api}}/posts/:postId'),
    findAll: repo.use<Post[]>('GET')('{{api}}/posts'),
    create: repo.use<Post, Omit<Post, 'id'>>('POST')('{{api}}/posts'),
    update: repo.use<Post, Post>('PUT')('{{api}}/posts/:postId'),
    patch: repo.use<Post, Partial<Post>>('PATCH')('{{api}}/posts/:postId'),
    delete: repo.use('DELETE')('{{api}}/posts/:postId'),
    filter: repo.use<Post[]>('GET')('{{api}}/posts?userId=:userId')
  },

  todoModel: {
    findOne: repo.use<Todo>('GET')('{{api}}/todos/:todoId')
  },

  use: <Response, Payload = never, Config = never>(
    ...args: Parameters<typeof repo.use>
  ) => repo.use<Response, Payload, Config>(...args)
};

/* Example of usage */
;(async () => {  
  /* const post: Post */
  const post = await api.postModel.findOne({ postId: "1" })

  /* const posts: Post[] */
  const posts = await api.postModel.findAll({});

  await api.postModel.create({
    payload: {
      title: 'foo',
      body: 'bar',
      userId: 1,
    },
  });

  await api.postModel.update({
    postId: "1",
    payload: {
      id: 1,
      title: 'foo',
      body: 'bar',
      userId: 1,
    },
  });

  await api.postModel.patch({
    postId: "1",
    payload: {
      title: 'foo',
    },
  });

  await api.postModel.delete({
    postId: "1",
  });

  await api.postModel.filter({
    userId: "2",
  });

  await api.todoModel.findOne({
    todoId: "4",
  });

  await api.use("DELETE")("{{api}}/todos/:todoId")({todoId: "1"});
})()

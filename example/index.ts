import axios from "axios";
import { IRootService } from "./types";
import { ApiBuilder } from "api-scaffolding";
import { schema } from "./schema";

const domains = {
  api: "https://jsonplaceholder.typicode.com",
};

const api = ApiBuilder.setHttpClient(axios)
  .setDomains(domains)
  .from<IRootService>(schema);

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

(async () => {
  await api.post.getById({ postId: 1 });

  await api.post.getAll();

  await api.post.create<Post, Omit<Post, "id">>({
    payload: {
      title: "foo",
      body: "bar",
      userId: 1,
    },
  });

  await api.post.update<Post, Post>({
    postId: 1,
    payload: {
      id: 1,
      title: "foo",
      body: "bar",
      userId: 1,
    },
  });

  await api.post.patch<Post, Partial<Post>>({
    postId: 1,
    payload: {
      title: "foo",
    },
  });

  await api.post.delete({
    postId: 1,
  });

  await api.post.filter({
    userId: 2,
  });

  await api.todos.getById({
    todoId: 1,
  });
})();

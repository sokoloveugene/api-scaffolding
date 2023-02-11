import axios from "axios";
import { IRootService } from "./types";
import { ApiBuilder } from "../src/index";
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
  await api.Post.getById({ postId: 1 });

  await api.Post.getAll();

  await api.Post.create<Post, Omit<Post, "id">>({
    payload: {
      title: "foo",
      body: "bar",
      userId: 1,
    },
  });

  await api.Post.update<Post, Post>({
    postId: 1,
    payload: {
      id: 1,
      title: "foo",
      body: "bar",
      userId: 1,
    },
  });

  await api.Post.patch<Post, Partial<Post>>({
    postId: 1,
    payload: {
      title: "foo",
    },
  });

  await api.Post.delete({
    postId: 1,
  });

  await api.Post.filter({
    userId: 2,
  });

  await api.Todo.getById({
    todoId: 1,
  });
})();

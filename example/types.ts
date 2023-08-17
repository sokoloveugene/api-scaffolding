export interface API_post {
    getById: <R>(params: {
        postId: number;
        config?: any;
    }) => Promise<R>;
    getAll: <R>(params?: {
        config?: any;
    }) => Promise<R>;
    create: <R, P = unknown>(params?: {
        config?: any;
        payload: P;
    }) => Promise<R>;
    update: <R, P = unknown>(params: {
        postId: number;
        config?: any;
        payload: P;
    }) => Promise<R>;
    patch: <R, P = unknown>(params: {
        postId: number;
        config?: any;
        payload: P;
    }) => Promise<R>;
    delete: <R>(params: {
        postId: number;
        config?: any;
    }) => Promise<R>;
    filter: <R>(params: {
        userId: number;
        config?: any;
    }) => Promise<R>;
}

export interface API_todos {
    getById: <R>(params: {
        todoId: number;
        config?: any;
    }) => Promise<R>;
}

export interface API {
    post: API_post;
    todos: API_todos;
}
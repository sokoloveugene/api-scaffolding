type Split<
  T,
  S extends string,
  R extends string[] = []
> = T extends `${infer Left}${S}${infer Right}`
  ? Split<Right, S, [...R, Left]>
  : [...R, T];

type Merge<T extends object, O extends object> = {
  [Key in keyof T | keyof O]: Key extends keyof T
    ? T[Key]
    : Key extends keyof O
    ? O[Key]
    : never;
};

type Path<T> = Split<T, '?'>[0];

type PathChunks<Url extends string> = Split<Path<Url>, '/'>[number];

type PathParams<Url extends string> = {
  [Key in PathChunks<Url> as Key extends `:${infer Prop}` ? Prop : never]: string;
};

type Search<T> = Split<T, '?'>[1];

type SearchChunks<Url extends string> = Split<Search<Url>, '&'>[number];

type SearchParams<Url extends string> = {
  [Key in SearchChunks<Url> as Key extends `${string}:${infer Prop}`
    ? Prop
    : never]: string;
};

export type Parameters<Url extends string> = Merge<PathParams<Url>, SearchParams<Url>>;

type HTTPMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type WS = 'WS';

export type Methods = HTTPMethods | WS | Omit<string, HTTPMethods>;

export type IsNeverType<T> = [T] extends [never] ? true : false;

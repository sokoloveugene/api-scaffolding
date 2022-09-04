export const axios = {
  get: (url: string, config: unknown) =>
    Promise.resolve(`GET[${url}] config: ${JSON.stringify(config)}`),
  delete: (url: string, config: unknown) =>
    Promise.resolve(`DELETE[${url}] config: ${JSON.stringify(config)}`),
  post: (url: string, payload: unknown, config: unknown) =>
    Promise.resolve(
      `POST[${url}] payload: ${JSON.stringify(
        payload
      )} config: ${JSON.stringify(config)}`
    ),
  put: (url: string, payload: unknown, config: unknown) =>
    Promise.resolve(
      `PUT[${url}] payload: ${JSON.stringify(
        payload
      )}  config: ${JSON.stringify(config)}`
    ),
  patch: (url: string, payload: unknown, config: unknown) =>
    Promise.resolve(
      `PATCH[${url}] payload: ${JSON.stringify(
        payload
      )} config: ${JSON.stringify(config)}`
    ),
}

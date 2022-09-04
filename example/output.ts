export interface IClientService {
  get<R>(params: { id: number; config?: any }): Promise<R>
  update<R, P = unknown>(params: {
    id: number
    isPrimary: boolean
    payload?: P
    config?: any
  }): Promise<R>
}

export interface IAddService {
  primary<R, P = unknown>(params: {
    productType: string
    hasSubproducts: boolean
    payload?: P
    config?: any
  }): Promise<R>
  default<R, P = unknown>(params: {
    productType: string
    hasSubproducts: boolean
    payload?: P
    config?: any
  }): Promise<R>
}

export interface IProductService {
  delete<R>(params: {
    productId: number
    productType: string
    config?: any
  }): Promise<R>
  add: IAddService
}

export interface IRootService {
  heartbeat<R>(params?: { config?: any }): Promise<R>
  client: IClientService
  product: IProductService
}

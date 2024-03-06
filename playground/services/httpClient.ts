import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export interface FetchContext {
  fetchContext?: {
    name?: string;
    ignoreAuth?: boolean;
  }
}

export class FetchClient {
  private static instance?: FetchClient;
  private client = axios.create();

  constructor() {
    if (FetchClient.instance)
      return FetchClient.instance;

    FetchClient.instance = this;

    this.client.interceptors.response.use((response) => {
      console.log(`[Response] [${response.status}] ${response.config.url}`, response.config.data);
      return response;
    });
  }

  async get<TReturn>(
    url: string,
    options?: AxiosRequestConfig<never>
  ): Promise<TReturn> {
    const { data } = await this.client.get<TReturn>(url, options)
    return data;
  }

  async post<TReturn, TPayload = Record<string, any> & FetchContext>(
    url: string,
    payload: TPayload,
    options?: AxiosRequestConfig<TPayload> | undefined
  ): Promise<TReturn> {
    const { data } = await this.client.post<TReturn>(url, payload, options);
    return data;
  };

  addInterceptor(interceptorFn: (config: InternalAxiosRequestConfig<FetchContext>) => InternalAxiosRequestConfig<any>) {
    this.client.interceptors.request.use(interceptorFn);
  }
}

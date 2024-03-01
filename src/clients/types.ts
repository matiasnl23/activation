export interface ClientSettings {
  name: string;
  baseUrl: string;
  priority: number;
  options?: ClientOptions;
}

export interface ClientOptions {
  loginEndpoint?: string;
  loginIntervalDelay?: number;
  loginMaxTry?: number;
  pingEndpoint?: string;
  pingOfflineMaxDelay?: number;
  pingOnlineDelay?: number;
}

export interface ClientManagerOptions {
  onClientStatus?: (client: string, status: boolean) => void;
  onAuthenticated?: (client: string) => void;
  onUnauthenticated?: (client: string) => void;
}

export interface HttpClient {
  get: <TReturn>(url: string) => Promise<TReturn>;
  post: <TReturn, TPayload = any>(url: string, payload: TPayload) => Promise<TReturn>;
}

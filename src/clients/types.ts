import type { Client } from "./lib/Client";

export interface ClientSettings {
  name: string;
  baseUrl: string;
  priority: number;
  options?: ClientOptions;
}

export interface ClientOptions {
  loginIntervalDelay?: number;
  loginMaxTry?: number;
  pingOfflineMaxDelay?: number;
  pingOnlineDelay?: number;
}

export type ClientPingFn = (client: Client) => Promise<void>;
export type ClientAuthenticationFn = (client: Client) => Promise<string>;

export interface ClientManagerOptions {
  onClientStatus?: (client: string, status: boolean) => void;
  onAuthenticated?: (client: string) => void;
  onUnauthenticated?: (client: string) => void;
  clientPingFn: ClientPingFn;
  clientAuthenticationFn: ClientAuthenticationFn;
}

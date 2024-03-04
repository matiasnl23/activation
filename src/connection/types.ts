import type { Connection } from "./lib/Connection";

export interface ConnectionSettings {
  name: string;
  baseUrl: string;
  priority: number;
  options?: ConnectionOptions;
}

export interface ConnectionOptions {
  loginIntervalDelay?: number;
  loginMaxTry?: number;
  pingOfflineMaxDelay?: number;
  pingOnlineDelay?: number;
}

export type PingFn = (server: Connection) => Promise<void>;
export type AuthenticationFn = (server: Connection) => Promise<string>;

export interface ConnectionManagerOptions {
  onConnectionStatus?: (server: string, status: boolean) => void;
  onAuthenticated?: (server: string) => void;
  onUnauthenticated?: (server: string) => void;
  authenticationFn: AuthenticationFn;
  pingFn: PingFn;
}

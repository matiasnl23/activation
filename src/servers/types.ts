import type { Server } from "./lib/Server";

export interface ServerSettings {
  name: string;
  baseUrl: string;
  priority: number;
  options?: ServerOptions;
}

export interface ServerOptions {
  loginIntervalDelay?: number;
  loginMaxTry?: number;
  pingOfflineMaxDelay?: number;
  pingOnlineDelay?: number;
}

export type ServerPingFn = (server: Server) => Promise<void>;
export type ServerAuthenticationFn = (server: Server) => Promise<string>;

export interface ServerManagerOptions {
  onServerStatus?: (server: string, status: boolean) => void;
  onAuthenticated?: (server: string) => void;
  onUnauthenticated?: (server: string) => void;
  serverPingFn: ServerPingFn;
  serverAuthenticationFn: ServerAuthenticationFn;
}

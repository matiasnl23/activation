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
export type PingFn = (client: Connection) => Promise<void>;
export type AuthenticationFn = (client: Connection) => Promise<string>;

export interface ConnectionManagerOptions {
  onConnectionStatus?: (client: string, status: boolean) => void;
  onAuthenticated?: (client: string) => void;
  onUnauthenticated?: (client: string) => void;
  onMaxAttemptsReached?: (client: string) => void;

  /**
    * Function used for authenticating, this function must
    * return the token or throw an error if the authentication fails.
    *
    * @example
    * async (client) => {
    *   const result = await fetch(`${client.baseUrl}/auth`)
    *     .then(r => r.json());
    *
    *   if (!result.token) throw new Error("Invalid credentials.");
    *
    *   return result.token;
    * }
    */
  authenticationFn: AuthenticationFn;

  /**
    * Function used to identify if the backend is online
    *
    * @example
    * async (client) => {
    *   const result = await fetch(`${client.baseUrl}/status`)
    *     .then(r => r.json());
    *
    *   if (!result.status) throw new Error("Server is offline.");
    * }
    */
  pingFn: PingFn;
}

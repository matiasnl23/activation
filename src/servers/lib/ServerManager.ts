import { ServerManagerOptions, ServerSettings } from "../types";
import { Server } from "./Server";

export class ServerManager {
  private servers: Server[] = [];

  constructor(private options: ServerManagerOptions) { }

  addServer({ name, baseUrl, priority, options }: ServerSettings): void {
    if (this.servers.some(c => c.name === name))
      throw new Error(`Server with name ${name} already exists.`);

    const server = new Server(name, baseUrl, priority, {
      ...options,
      ...this.options
    })

    this.servers = [
      ...this.servers,
      server
    ].sort((a, b) => a.priority - b.priority)
  }

  removeServer(name: string): void {
    const server = this.servers.find(c => c.name === name);

    if (server) {
      server.destroy();
      this.servers = this.servers.filter((c) => c.name !== name)
    }
  }

  getOnline(): Server {
    const server = this.servers.find(c => c.isOnline());
    if (!server)
      throw new Error("Not server online found.");

    return server;
  }

  getAuthenticated(): Server {
    const server = this.servers.find(c => c.isOnline() && c.isAuthenticated())

    if (!server)
      throw new Error("No authenticated server was found.")

    return server;
  }
};

import { ClientManagerOptions, ClientSettings } from "../types";
import { Client } from "./Client";

export class ClientManager {
  private clients: Client[] = [];

  constructor(private options: ClientManagerOptions) { }

  addClient({ name, baseUrl, priority, options }: ClientSettings): void {
    if (this.clients.some(c => c.name === name))
      throw new Error(`Client with name ${name} already exists.`);

    const client = new Client(name, baseUrl, priority, {
      ...options,
      ...this.options
    })

    this.clients = [
      ...this.clients,
      client
    ].sort((a, b) => a.priority - b.priority)
  }

  removeClient(name: string): void {
    const client = this.clients.find(c => c.name === name);

    if (client) {
      client.destroy();
      this.clients = this.clients.filter((c) => c.name !== name)
    }
  }

  getOnline(): Client {
    const client = this.clients.find(c => c.isOnline());
    if (!client)
      throw new Error("Not client online found.");

    return client;
  }

  getAuthenticated(): Client {
    const client = this.clients.find(c => c.isOnline() && c.isAuthenticated())

    if (!client)
      throw new Error("No authenticated client was found.")

    return client;
  }
};

import { ClientManagerOptions, ClientSettings, HttpClient } from "../types";
import { Client } from "./Client";

export class ClientManager {
  private clients: Client[] = [];

  constructor(private httpClient: HttpClient, private options?: ClientManagerOptions) { }

  addClient({ name, baseUrl, priority, options }: ClientSettings): void {
    if (this.clients.some(c => c.name === name))
      throw new Error(`Client with name ${name} already exists.`);

    this.clients.push(
      new Client(this.httpClient, name, baseUrl, priority, {
        ...options,
        ...this.options
      })
    );
  };

  removeClient(name: string): void {
    const client = this.clients.find(c => c.name === name);

    if (client) {
      client.destroy();
      this.clients = this.clients.filter((c) => c.name !== name)
    }
  }
};

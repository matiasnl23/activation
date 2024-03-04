import { ConnectionManagerOptions, ConnectionSettings } from "../types";
import { Connection } from "./Connection";

export class ConnectionManager {
  private connections: Connection[] = [];

  constructor(private options: ConnectionManagerOptions) { }

  addConnection({ name, baseUrl, priority, options }: ConnectionSettings): void {
    if (this.connections.some(c => c.name === name))
      throw new Error(`Connection with name ${name} already exists.`);

    const connection = new Connection(name, baseUrl, priority, {
      ...options,
      ...this.options
    })

    this.connections = [
      ...this.connections,
      connection
    ].sort((a, b) => a.priority - b.priority)
  }

  removeConnection(name: string): void {
    const connection = this.connections.find(c => c.name === name);

    if (connection) {
      connection.destroy();
      this.connections = this.connections.filter((c) => c.name !== name)
    }
  }

  getOnline(): Connection {
    const connection = this.connections.find(c => c.isOnline());
    if (!connection)
      throw new Error("Not connection online found.");

    return connection;
  }

  getAuthenticated(): Connection {
    const connection = this.connections.find(c => c.isOnline() && c.isAuthenticated())

    if (!connection)
      throw new Error("No authenticated connection was found.")

    return connection;
  }
};

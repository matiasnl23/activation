import { ref } from "vue";
import { ConnectionManager } from "../../src/connection";
import type { Connection } from "../../src/connection/lib/Connection";
import * as connectionService from "../services/connection";

export const useConnectionManager = () => {
  const connections = ref<{
    name: string,
    status: boolean,
    authenticated: boolean
  }[]>([]);

  const connectionManager = new ConnectionManager({
    onConnectionStatus: (name, status) => {
      const connection = getConnection(name);

      if (connection) {
        connection.status = status;
      } else {
        connections.value.push({ name, status, authenticated: false });
      }
    },
    onAuthenticated: (name) => {
      const connection = getConnection(name);

      if (connection)
        connection.authenticated = true;
    },
    onUnauthenticated: (name) => {
      const connection = getConnection(name);

      if (connection)
        connection.authenticated = false;
    },
    authenticationFn: async (connection) => {
      const { guid, secret } = await getActivationData(connection);
      return connectionService.getToken(connection.baseUrl, guid, secret);
    },
    pingFn: async (connection) => {
      connectionService.ping(connection.name, connection.baseUrl);
    }
  });

  const getConnection = (name: string) => {
    return connections.value.find(c => c.name === name);
  }

  const addConnection = (name: string, url: string, priority: number) => {
    if (getConnection(name)) {
      alert(`Connection with name ${name} already exists.`);
      return;
    }

    connections.value.push({ name, status: false, authenticated: false });
    connectionManager.addConnection({ name, priority, baseUrl: url });
  }

  const removeConnection = (name: string) => {
    connectionManager.removeConnection(name);
    connections.value = connections.value.filter(c => c.name !== name);
  }

  const getActivationData = async (connection: Connection): Promise<{ guid: string, secret: string }> => {
    const storedData = localStorage.getItem("activation");

    if (storedData)
      return JSON.parse(storedData) as { guid: string, secret: string };

    const { guid, secret } = await connectionService.getActivationData(connection.baseUrl);
    localStorage.setItem("activation", JSON.stringify({ guid, secret }));
    return { guid, secret };
  }

  return {
    connections,
    addConnection,
    removeConnection
  }
};

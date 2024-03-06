import { computed, ref, watch } from "vue";
import { ConnectionManager } from "../../src/connection";
import type { Connection } from "../../src/connection/lib/Connection";
import * as connectionService from "../services/connection";
import { FetchClient, type FetchContext } from "../services/httpClient";

const ACTIVATION_STORAGE_KEY = "activation";
const URLS_STORAGE_KEY = "connections-urls";

export const useConnectionManager = () => {
  const http = new FetchClient();
  const connections = ref<{
    name: string,
    status: boolean,
    authenticated: boolean
  }[]>([]);
  const initialized = ref(false);

  const connectionManager = new ConnectionManager({
    onConnectionStatus: (name, status) => {
      console.log(`Connection ${name} status changed to ${status}`);
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

      initialized.value = true;
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
      await connectionService.ping(connection.name, connection.baseUrl);
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
    const storedData = localStorage.getItem(ACTIVATION_STORAGE_KEY);

    if (storedData)
      return JSON.parse(storedData) as { guid: string, secret: string };

    const { guid, secret } = await connectionService.getActivationData(connection.baseUrl);
    localStorage.setItem(ACTIVATION_STORAGE_KEY, JSON.stringify({ guid, secret }));
    return { guid, secret };
  }

  http.addInterceptor((config) => {
    const data = config.data as FetchContext;

    if (data.fetchContext?.ignoreAuth) return config;

    const connection = connectionManager.getAuthenticated();

    config.baseURL = connection.baseUrl;
    config.headers.set("Authorization", `Bearer ${connection.getToken()}`);

    return config;
  });

  watch(initialized, value => {
    if (value) {
      // Get URLs info
      console.log("Get urls.");
    }
  });

  return {
    connections,
    addConnection,
    removeConnection
  }
};

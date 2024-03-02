import { ref } from "vue";
import { ServerManager } from "../../src/servers";
import type { Server } from "../../src/servers/lib/Server";
import * as serverService from "../services/server";

export const useServerManager = () => {
  const servers = ref<{
    name: string,
    status: boolean,
    authenticated: boolean
  }[]>([]);

  const serverManager = new ServerManager({
    onServerStatus: (name, status) => {
      const server = getServer(name);

      if (server) {
        servers.value = [
          ...servers.value.filter(c => c.name !== name),
          { ...server, status }
        ]
      } else {
        servers.value.push({ name, status, authenticated: false });
      }
    },
    serverAuthenticationFn: async (server) => {
      const { guid, secret } = await getActivationData(server);
      return serverService.getToken(server.baseUrl, guid, secret);
    },
    serverPingFn: async (server) => {
      serverService.ping(server.name, server.baseUrl);
    }
  });

  const getServer = (name: string) => {
    return servers.value.find(c => c.name === name);
  }

  const addServer = (name: string, url: string, priority: number) => {
    if (getServer(name)) {
      alert(`Server with name ${name} already exists.`);
      return;
    }

    servers.value.push({ name, status: false });
    serverManager.addServer({ name, priority, baseUrl: url });
  }

  const removeServer = (name: string) => {
    serverManager.removeServer(name);
    servers.value = servers.value.filter(c => c.name !== name);
  }

  const getActivationData = async (server: Server): Promise<{ guid: string, secret: string }> => {
    const storedData = localStorage.getItem("activation");

    if (storedData)
      return JSON.parse(storedData) as { guid: string, secret: string };

    const { guid, secret } = await serverService.getActivationData(server.baseUrl);
    localStorage.setItem("activation", JSON.stringify({ guid, secret }));
    return { guid, secret };
  }

  return {
    servers,
    addServer,
    removeServer
  }
};

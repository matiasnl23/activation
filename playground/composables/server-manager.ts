import { ref } from "vue";
import { ServerManager } from "../../src/servers";
import { ServerAuthenticationFn, ServerPingFn } from "../../src/servers/types";
import { Server } from "../../src/servers/lib/Server";
import { GUID_MUTATION, TOKEN_MUTATION } from "../graphql/mutations";
import { PING_QUERY } from "../graphql/queries";

export const useServerManager = () => {
  const servers = ref<{ name: string, status: boolean }[]>([]);

  const onServerStatus = (name: string, status: boolean) => {
    const server = getServer(name);

    if (server) {
      servers.value = [
        ...servers.value.filter(c => c.name !== name),
        { ...server, status }
      ]
    } else {
      servers.value.push({ name, status });
    }
  }

  const serverPingFn: ServerPingFn = async (server) => {
    const result = await fetch(`${server.baseUrl}/graphql`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: PING_QUERY
      })
    });

    const { data } = await result.json();

    if (!data?.serverStatus?.status)
      throw new Error(`Server named ${server.name} is down.`);
  };

  const getActivationData = async (server: Server): Promise<{ guid: string, secret: string }> => {
    const storedData = localStorage.getItem("activation");
    if (storedData) {
      return JSON.parse(storedData) as { guid: string, secret: string };
    } else {
      const response = await fetch(`${server.baseUrl}/graphql`, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: GUID_MUTATION
        })
      });
      const { data } = await response.json();

      if (!data?.activation?.id)
        throw new Error("Cannot get activation data.");

      const { guid, secret } = data.activation.id as { guid: string, secret: string };
      localStorage.setItem("activation", JSON.stringify({ guid, secret }));

      return { guid, secret };
    }
  }

  const serverAuthenticationFn: ServerAuthenticationFn = async (server) => {
    const { guid, secret } = await getActivationData(server);

    const response = await fetch(`${server.baseUrl}/graphql`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: TOKEN_MUTATION,
        variables: {
          guid,
          secret
        }
      })
    });

    const { data } = await response.json();

    if (!data?.activation?.info?.token)
      throw new Error("Cannot get token.");

    return data.activation.info.token as string;
  }

  const serverManager = new ServerManager({
    onServerStatus: onServerStatus,
    serverPingFn: serverPingFn,
    serverAuthenticationFn: serverAuthenticationFn
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

  return {
    servers,
    addServer,
    removeServer
  }
};

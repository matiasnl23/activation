import { ref } from "vue";
import { ClientManager } from "../../src/clients";
import { ClientAuthenticationFn, ClientPingFn } from "../../src/clients/types";

const PING_QUERY = `{
  serverStatus {
    status
  }
}`;

export const useClientManager = () => {
  const clients = ref<{ name: string, status: boolean }[]>([]);

  const onClientStatus = (name: string, status: boolean) => {
    const client = getClient(name);

    if (client) {
      clients.value = [
        ...clients.value.filter(c => c.name !== name),
        { ...client, status }
      ]
    } else {
      clients.value.push({ name, status });
    }
  }

  const clientPingFn: ClientPingFn = async (client) => {
    const result = await fetch(`${client.baseUrl}/graphql`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        operationName: null,
        variables: {},
        query: PING_QUERY
      })
    });

    const { data } = await result.json();

    if (!data?.serverStatus?.status)
      throw new Error(`Server named ${client.name} is down.`);
  };

  const clientAuthenticationFn: ClientAuthenticationFn = async (client) => {
    return `token-for-${client.name}`;
  }

  const clientManager = new ClientManager({ onClientStatus, clientPingFn, clientAuthenticationFn })

  const getClient = (name: string) => {
    return clients.value.find(c => c.name === name);
  }

  const addClient = (name: string, url: string, priority: number) => {
    if (getClient(name)) {
      alert(`Client with name ${name} already exists.`);
      return;
    }

    clients.value.push({ name, status: false });
    clientManager.addClient({ name, priority, baseUrl: url });
  }

  const removeClient = (name: string) => {
    clientManager.removeClient(name);
    clients.value = clients.value.filter(c => c.name !== name);
  }

  return {
    clients,
    addClient,
    removeClient
  }
};

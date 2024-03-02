import { ref } from "vue";
import { ClientManager } from "../../src/clients";
import { ClientAuthenticationFn, ClientPingFn } from "../../src/clients/types";
import { Client } from "../../src/clients/lib/Client";

const PING_QUERY = `{
  serverStatus {
    status
  }
}`;

const GUID_MUTATION = `mutation {
  activation {
    id {
      guid: activationId
      secret: activationToken
    }
  } 
}`;

const TOKEN_MUTATION = `mutation ($guid: String!, $secret: String!) {
  activation {
    info(activationId: $guid, activationToken: $secret) {
      token
    }
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

  const getActivationData = async (client: Client): Promise<{ guid: string, secret: string }> => {
    const storedData = localStorage.getItem("activation");
    if (storedData) {
      return JSON.parse(storedData) as { guid: string, secret: string };
    } else {
      const response = await fetch(`${client.baseUrl}/graphql`, {
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

  const clientAuthenticationFn: ClientAuthenticationFn = async (client) => {
    const { guid, secret } = await getActivationData(client);

    const response = await fetch(`${client.baseUrl}/graphql`, {
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

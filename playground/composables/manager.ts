import { ref } from "vue";
import { ClientManager } from "../../src/clients";
import { FetchClient } from "../services/httpClient";

export const useClientManager = () => {
  const fetchClient = new FetchClient();
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

  const clientManager = new ClientManager(fetchClient, { onClientStatus })

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

import { GUID_MUTATION, TOKEN_MUTATION } from "../graphql/mutations";
import { PING_QUERY } from "../graphql/queries";
import { ActivationDataResponse, ConnectionData, GraphQLResponse, PingResponse, UrlsResponse } from "../types";
import { FetchClient } from "./httpClient"

const ACTIVATION_STORAGE_KEY = "activation";
const URLS_STORAGE_KEY = "connections-urls";

const http = new FetchClient();

export const ping = async (name: string, url: string) => {
  const { data } = await http.post<GraphQLResponse<PingResponse>>(
    `${url}/graphql`,
    {
      query: PING_QUERY,
      fetchContext: {
        ignoreAuth: true
      }
    }
  );

  if (!data?.serverStatus?.status)
    throw new Error(`Server named ${name} is down.`);
}

export const getActivationData = async (url: string) => {
  const { data } = await http.post<GraphQLResponse<ActivationDataResponse>>(
    `${url}/graphql`,
    {
      query: GUID_MUTATION,
      fetchContext: {
        ignoreAuth: true
      }
    }
  );

  if (!data?.activation?.id)
    throw new Error("Cannot get activation data.");

  const { guid, secret } = data.activation.id;
  return { guid, secret };
}

export const getToken = async (
  url: string,
  guid: string,
  secret: string
): Promise<string> => {
  const { data } = await http.post<GraphQLResponse<ActivationDataResponse>>(
    `${url}/graphql`,
    {
      query: TOKEN_MUTATION,
      variables: {
        guid,
        secret
      },
      fetchContext: {
        ignoreAuth: true
      }
    }
  );

  if (!data?.activation?.info?.token)
    throw new Error("Cannot get token.");

  return data.activation.info.token;
}

export const getStoredUrls = (): ConnectionData[] | null => {
  const storedData = localStorage.getItem(URLS_STORAGE_KEY);

  if (!storedData)
    return null;

  return JSON.parse(storedData) as ConnectionData[];
};

export const storeUrls = (urls: ConnectionData[]) => {
  localStorage.setItem(URLS_STORAGE_KEY, JSON.stringify(urls));
};

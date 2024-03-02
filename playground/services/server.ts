import { GUID_MUTATION, TOKEN_MUTATION } from "../graphql/mutations";
import { PING_QUERY } from "../graphql/queries";
import { FetchClient } from "./httpClient"

const http = new FetchClient();

interface GraphQLResponse<T> {
  data?: T
};

interface PingResponse {
  serverStatus?: {
    status: boolean;
  }
}

interface ActivationDataResponse {
  activation?: {
    id?: {
      guid: string;
      secret: string;
    },
    info?: {
      token: string;
    }
  }
}

export const ping = async (name: string, url: string) => {
  const { data } = await http.post<GraphQLResponse<PingResponse>>(
    `${url}/graphql`,
    { query: PING_QUERY },
    { cache: "no-cache" }
  );

  if (!data?.serverStatus?.status)
    throw new Error(`Server named ${name} is down.`);
}

export const getActivationData = async (url: string) => {
  const { data } = await http.post<GraphQLResponse<ActivationDataResponse>>(
    `${url}/graphql`,
    { query: GUID_MUTATION },
    { cache: "no-cache" }
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
      }
    },
    { cache: "no-cache" }
  );

  if (!data?.activation?.info?.token)
    throw new Error("Cannot get token.");

  return data.activation.info.token;
}

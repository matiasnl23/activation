// GraphQL
export interface GraphQLResponse<T> {
  data?: T
};

export interface ActivationDataResponse {
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

export interface UrlsResponse {
  terminalConfiguration?: {
    boxUrl?: {
      http?: string
    }
  }
}

export interface PingResponse {
  serverStatus?: {
    status: boolean;
  }
}

// Other types
export interface ConnectionData {
  name: string;
  priority: number;
  url: string;
}

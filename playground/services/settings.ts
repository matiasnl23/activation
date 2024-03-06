import { TERMINAL_CONTEXT_QUERY } from "../graphql/queries";
import { GraphQLResponse } from "../types";
import { FetchClient } from "./httpClient";

const http = new FetchClient();

export const getTerminalContext = async () => {
  const { data } = await http.post<GraphQLResponse<any>>("/graphql", {
    query: TERMINAL_CONTEXT_QUERY
  });

  console.log(data);
};

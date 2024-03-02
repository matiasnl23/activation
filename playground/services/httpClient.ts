import { HttpClient } from "../../src/clients/types";

export class FetchClient implements HttpClient {
  async get<TReturn>(
    url: string,
    options?: Omit<RequestInit, "method" | "body">
  ): Promise<TReturn> {
    const result = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });
    return result.json() as TReturn;
  }

  async post<TReturn, TPayload = any>(
    url: string,
    payload: TPayload,
    options?: Omit<RequestInit, "method" | "body">
  ): Promise<TReturn> {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      ...options,
      body: JSON.stringify(payload),
    });

    return result.json() as TReturn;
  };
}

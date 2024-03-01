import { HttpClient } from "../../src/clients/types";

export class FetchClient implements HttpClient {
  async get<TReturn>(url: string): Promise<TReturn> {
    const result = await fetch(url, { method: "GET", mode: "no-cors", cache: "no-cache" });
    return result.json() as TReturn;
  }

  async post<TReturn, TPayload = any>(url: string, payload: TPayload): Promise<TReturn> {
    const result = await fetch(url, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
      cache: "no-cache",
    });
    return result.json() as TReturn;
  };
}

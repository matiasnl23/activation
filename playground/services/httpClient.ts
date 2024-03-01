import { HttpClient } from "../../src/clients/types";

export class FetchClient implements HttpClient {
  async get<T>(url: string): Promise<T> {
    const result = await fetch(url, { method: "GET", cache: "no-cache" });
    return result.text() as T;
  }
}

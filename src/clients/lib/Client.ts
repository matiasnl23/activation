import { ClientManagerOptions, ClientOptions, HttpClient } from "../types";

export class Client {
  private online: boolean = false;
  private authenticated: boolean = false;
  private pingTimer: number | null = null;

  constructor(
    private httpClient: HttpClient,
    public name: string,
    public baseUrl: string,
    public priority: number,
    private options: ClientOptions & ClientManagerOptions = {},
  ) {
    this.startPing();

    this.options.onClientStatus && this.options.onClientStatus(this.name, this.online);
  }

  isAuthenticated(): Readonly<boolean> {
    return this.authenticated;
  }

  isOnline(): Readonly<boolean> {
    return this.online;
  }

  startPing(delay = 0): void {
    if (this.pingTimer)
      clearTimeout(this.pingTimer);

    if (this.isOnline()) {
      delay = this.options.pingOnlineDelay ?? 30;
    } else {
      const calculatedDelay = Math.max(delay * 1.5, 1);
      delay = Math.min(
        calculatedDelay,
        this.options.pingOfflineMaxDelay ?? 60
      );
    }

    this.pingTimer = setTimeout(() => {
      this.ping(delay);
    }, delay * 1000);
  }

  async ping(delay: number): Promise<void> {
    const url = `${this.baseUrl}/${this.options.pingEndpoint ?? ''}`;

    try {
      await this.httpClient.get(url);
      if (!this.isOnline()) {
        this.online = true;
        this.options.onClientStatus && this.options.onClientStatus(this.name, this.online);
      }
    } catch (err) {
      if (this.isOnline()) {
        this.online = false;
        this.options.onClientStatus && this.options.onClientStatus(this.name, this.online);
        delay = 0;
      }

      console.error(err);
    } finally {
      this.startPing(delay);
    }
  }

  destroy(): void {
    this.pingTimer && clearTimeout(this.pingTimer);
  }
}
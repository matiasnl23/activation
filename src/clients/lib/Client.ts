import { ClientManagerOptions, ClientOptions } from "../types";

export class Client {
  private online: boolean = false;
  private authenticated: boolean = false;
  private token: string | null = null;

  private pingTimer: number | null = null;
  private authTimer: number | null = null;
  private authCounter: number = 0;

  constructor(
    public name: string,
    public baseUrl: string,
    public priority: number,
    private options: ClientOptions & ClientManagerOptions,
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

  getToken(): string {
    if (!this.token)
      throw new Error("Token is not set.");

    return this.token;
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
    try {
      await this.options.clientPingFn(this);
      if (!this.isOnline()) {
        this.online = true;
        this.options.onClientStatus && this.options.onClientStatus(this.name, this.online);
        this.authenticate();
      }
    } catch (err) {
      if (this.isOnline()) {
        this.online = false;
        this.options.onClientStatus && this.options.onClientStatus(this.name, this.online);
        this.authTimer && clearTimeout(this.authTimer);
        delay = 0;
      }

      console.error(err);
    } finally {
      this.startPing(delay);
    }
  }

  async authenticate(delay = 1000): Promise<void> {
    if (this.authTimer) clearTimeout(this.authTimer);

    delay = Math.min(delay, this.options.loginIntervalDelay ?? 120000);

    try {
      this.token = await this.options.clientAuthenticationFn(this);
      this.authenticated = true;
      this.authCounter = 0;
    } catch {
      this.authCounter++;

      if (this.authCounter > (this.options.loginMaxTry ?? 20))
        throw new Error("Maximum authentication attempts reached.");

      this.authTimer = setTimeout(() => this.authenticate(delay * 1.2), delay);
    }
  }

  destroy(): void {
    this.pingTimer && clearTimeout(this.pingTimer);
    this.authTimer && clearTimeout(this.authTimer);
  }
}

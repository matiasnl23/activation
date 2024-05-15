import { Connection } from "./Connection";

const pingFn = vi.fn();
const authenticationFn = vi.fn();
const onAuthenticated = vi.fn();
const onUnauthenticated = vi.fn();
const onConnectionStatus = vi.fn();
const onMaxAttemptsReached = vi.fn();

describe("Connection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  })

  it("Should initialize the connection with offline and unauthenticated status", () => {
    const client = new Connection(
      "remote",
      "http://localhost:3000",
      100,
      {
        pingFn,
        authenticationFn,
      }
    );

    expect(client.isAuthenticated()).toBeFalsy();
    expect(client.isOnline()).toBeFalsy();
    expect(() => client.getToken()).toThrowError("Token is not set.");

    client.destroy();
  });

  it("Should return true when the client is online", async () => {
    pingFn
      .mockRejectedValueOnce(new Error("Ping failed."))
      .mockResolvedValue("");

    const client = new Connection(
      "remote",
      "http://localhost:3000",
      100,
      {
        pingFn,
        authenticationFn,
        onConnectionStatus
      }
    );

    expect(client.isOnline()).toBeFalsy();

    // First time will fail
    await vi.advanceTimersByTimeAsync(1000);
    expect(pingFn).toHaveBeenCalledOnce();
    expect(pingFn).toHaveBeenLastCalledWith(client);
    expect(client.isOnline()).toBeFalsy();
    expect(onConnectionStatus).toHaveBeenCalledTimes(1);
    expect(onConnectionStatus).toHaveBeenLastCalledWith("remote", false);

    // Second time will connect
    await vi.advanceTimersByTimeAsync(1500);
    expect(pingFn).toHaveBeenCalledTimes(2);
    expect(client.isOnline()).toBeTruthy();
    expect(onConnectionStatus).toHaveBeenCalledTimes(2);
    expect(onConnectionStatus).toHaveBeenLastCalledWith("remote", true);

    // Default ping when connection is online
    await vi.advanceTimersByTimeAsync(29000);
    expect(pingFn).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1000);
    expect(pingFn).toHaveBeenCalledTimes(3);
    expect(client.isOnline()).toBeTruthy();
    expect(onConnectionStatus).toHaveBeenCalledTimes(2);
    expect(onConnectionStatus).toHaveBeenLastCalledWith("remote", true);

    // Will switch to offline when ping fail
    pingFn.mockRejectedValueOnce(new Error("Ping failed."));
    await vi.advanceTimersByTimeAsync(30000);
    expect(client.isOnline()).toBeFalsy();
    expect(onConnectionStatus).toHaveBeenCalledTimes(3);
    expect(onConnectionStatus).toHaveBeenLastCalledWith("remote", false);

    client.destroy();
  });

  it("Should return a token when the client is authenticated", async () => {
    pingFn.mockResolvedValue("");
    authenticationFn
      .mockRejectedValueOnce(new Error("Not authorized."))
      .mockResolvedValue("this-is-a-token");

    const client = new Connection(
      "remote",
      "http://localhost:3000",
      100,
      {
        pingFn,
        authenticationFn,
        onAuthenticated,
      }
    );

    // Will switch to online but won't authenticate
    await vi.advanceTimersToNextTimerAsync();
    expect(client.isOnline()).toBeTruthy();
    expect(authenticationFn).toHaveBeenCalledOnce();
    expect(authenticationFn).toHaveBeenCalledWith(client);
    expect(client.isAuthenticated()).toBeFalsy();

    // Second attempt will switch to authenticated
    await vi.advanceTimersByTimeAsync(1000);
    expect(client.isAuthenticated()).toBeTruthy();

    expect(client.getToken()).toBe("this-is-a-token");
    expect(onAuthenticated).toHaveBeenLastCalledWith("remote");

    client.destroy();
  });

  it("Should stop authenticating when max attempts is reached", async () => {
    pingFn.mockResolvedValue("");
    authenticationFn
      .mockRejectedValue(new Error("Not authorized."));

    const client = new Connection(
      "remote",
      "http://localhost:3000",
      100,
      {
        pingFn,
        authenticationFn,
        onAuthenticated,
        onMaxAttemptsReached
      }
    );

    for(let i = 0; i < 50; i++) {
      await vi.advanceTimersToNextTimerAsync();
    }

    expect(authenticationFn).toHaveBeenCalledTimes(20);
    expect(onMaxAttemptsReached).toHaveBeenCalledTimes(1);
    expect(onMaxAttemptsReached).toHaveBeenLastCalledWith("remote");

    client.destroy();
  });

  it("Should start again authenticating when calling unauthenticate method", async () => {
    pingFn.mockResolvedValue("");
    authenticationFn
      .mockRejectedValue(new Error("Not authorized."));

    const client = new Connection(
      "remote",
      "http://localhost:3000",
      100,
      {
        pingFn,
        authenticationFn,
        onAuthenticated,
        onMaxAttemptsReached
      }
    );

    for(let i = 0; i < 50; i++) {
      await vi.advanceTimersToNextTimerAsync();
    }

    expect(authenticationFn).toHaveBeenCalledTimes(20);
    expect(onMaxAttemptsReached).toHaveBeenCalledTimes(1);
    expect(onMaxAttemptsReached).toHaveBeenLastCalledWith("remote");

    client.unauthenticate();

    for(let i = 0; i < 50; i++) {
      await vi.advanceTimersToNextTimerAsync();
    }

    expect(authenticationFn).toHaveBeenCalledTimes(40);
    expect(onMaxAttemptsReached).toHaveBeenCalledTimes(2);
    expect(onMaxAttemptsReached).toHaveBeenLastCalledWith("remote");

    client.destroy();
  });
});

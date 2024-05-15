import { ConnectionManager } from "..";
import { Connection } from "./Connection";

const authenticationFn = vi.fn()
  .mockResolvedValue("a-valid-token");
const pingFn = vi.fn()
  .mockResolvedValue(undefined);

describe("ConnectionManager", () => {
  vi.useFakeTimers();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAuthenticated client", () => {
    it("Should throw an error when no there are no authenticated clients", async () => {
      authenticationFn.mockRejectedValue(new Error("Error when authenticating."));
      const manager = new ConnectionManager({
        authenticationFn,
        pingFn
      });

      manager.addConnection({
        name: "local",
        baseUrl: "http://local.url/",
        priority: 10
      });

      manager.addConnection({
        name: "remote",
        baseUrl: "http://remote.url/",
        priority: 100
      });

      await vi.advanceTimersByTimeAsync(30000);

      expect(() => manager.getAuthenticated())
        .toThrowError("No authenticated connection was found");
    });

    it("Should return authenticated client by priority (priority client added first)", async () => {
      const manager = new ConnectionManager({
        authenticationFn,
        pingFn
      });

      manager.addConnection({
        name: "local",
        baseUrl: "http://local.url/",
        priority: 10
      });

      manager.addConnection({
        name: "remote",
        baseUrl: "http://remote.url/",
        priority: 100
      });

      // Wait for connection
      await vi.advanceTimersByTimeAsync(10000);

      const client = manager.getAuthenticated();
      expect(client.name).toBe("local");
    });

    it("Should return authenticated client by priority (priority client added in last position)", async () => {
      const manager = new ConnectionManager({
        authenticationFn,
        pingFn
      });

      manager.addConnection({
        name: "remote",
        baseUrl: "http://remote.url/",
        priority: 100
      });

      manager.addConnection({
        name: "local",
        baseUrl: "http://local.url/",
        priority: 10
      });

      // Wait for connection
      await vi.advanceTimersByTimeAsync(10000);

      const client = manager.getAuthenticated();
      expect(client.name).toBe("local");
    });

    it("Should return authenticated client by priority (multiple connections, priority failing)", async () => {
      authenticationFn.mockImplementation((client: Connection) => {
        if (client.name === "local")
          throw new Error("Ignore this connection");

        return "a-valid-token";
      });

      const manager = new ConnectionManager({
        authenticationFn,
        pingFn
      });

      manager.addConnection({
        name: "local",
        baseUrl: "http://local.url/",
        priority: 10
      });

      manager.addConnection({
        name: "remote",
        baseUrl: "http://remote.url/",
        priority: 100
      });

      manager.addConnection({
        name: "local-backup",
        baseUrl: "http://local-02.url/",
        priority: 30
      });

      // Wait for connection
      await vi.advanceTimersByTimeAsync(30000);

      const client = manager.getAuthenticated();
      expect(client.name).toBe("local-backup");
    });

    it("Should return authenticated client by priority (multiple connections, one of them failing)", async () => {
      authenticationFn.mockImplementation((client: Connection) => {
        if (client.name === "local-backup")
          throw new Error("Ignore this connection");

        return "a-valid-token";
      });

      const manager = new ConnectionManager({
        authenticationFn,
        pingFn
      });

      manager.addConnection({
        name: "local",
        baseUrl: "http://local.url/",
        priority: 10
      });

      manager.addConnection({
        name: "remote",
        baseUrl: "http://remote.url/",
        priority: 100
      });

      manager.addConnection({
        name: "local-backup",
        baseUrl: "http://local-02.url/",
        priority: 30
      });

      // Wait for connection
      await vi.advanceTimersByTimeAsync(30000);

      const client = manager.getAuthenticated();
      expect(client.name).toBe("local");
    });
  });

  it("Should switch between connections", async () => {
    const manager = new ConnectionManager({ authenticationFn, pingFn });
    manager.addConnection({ name: "local", baseUrl: "http://local.url/", priority: 10 });
    manager.addConnection({ name: "remote", baseUrl: "http://remote.url/", priority: 100 });

    // Authentication succeed for both clients
    await vi.advanceTimersByTimeAsync(30000);
    let client = manager.getAuthenticated();
    expect(client.name).toBe("local");

    // Unauthenticate local client, remote client will be used
    client.unauthenticate();
    client = manager.getAuthenticated();
    expect(client.name).toBe("remote");

    // Reauthenticate local client, it becomes available again
    await vi.advanceTimersByTimeAsync(30000);
    client = manager.getAuthenticated();
    expect(client.name).toBe("local");
  });
});

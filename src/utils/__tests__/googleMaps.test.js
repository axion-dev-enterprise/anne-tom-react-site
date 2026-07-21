import { getDistanceMatrix } from "../googleMaps";

describe("getDistanceMatrix", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("uses the Axion Matrix route contract after geocoding the destination", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lat: "-23.547", lon: "-46.637" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ distance_km: 5.966, duration_min: 11.16 }),
      });

    await expect(
      getDistanceMatrix({ apiKey: "", destination: "Praca da Se, Sao Paulo" })
    ).resolves.toEqual({ distanceText: "6.0 km", durationText: "11 min" });

    const routeUrl = global.fetch.mock.calls[1][0];
    expect(routeUrl).toContain("/api/matrix-route?");
    expect(routeUrl).toContain("olat=-23.50189");
    expect(routeUrl).toContain("olon=-46.62529");
    expect(routeUrl).toContain("dlat=-23.547");
    expect(routeUrl).toContain("dlon=-46.637");
  });

  it("rejects when Matrix does not return a valid route", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lat: "-23.547", lon: "-46.637" }),
      })
      .mockResolvedValueOnce({ ok: false });

    await expect(
      getDistanceMatrix({ apiKey: "", destination: "Praca da Se, Sao Paulo" })
    ).rejects.toThrow("Matrix route request failed");
  });
});

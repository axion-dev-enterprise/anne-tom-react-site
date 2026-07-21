const geocodeHandler = require("../geocode");

describe("Geocode API Handler", () => {
  const originalFetch = global.fetch;
  let req;
  let res;

  beforeEach(() => {
    req = {
      method: "GET",
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("rejects non-GET methods with 405", async () => {
    req.method = "POST";
    await geocodeHandler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "GET");
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "method_not_allowed" });
  });

  it("rejects invalid inputs with 400", async () => {
    req.query = {};
    await geocodeHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid_address_or_coordinates" });
  });

  it("calls search when address is provided", async () => {
    req.query.address = "Avenida Paulista, 1000";
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ display_name: "Avenida Paulista, 1000", lat: "-23.56", lon: "-46.65" }],
    });

    await geocodeHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("search?format=jsonv2"),
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ lat: "-23.56", lon: "-46.65" })
    );
  });

  it("calls reverse when lat/lng are provided", async () => {
    req.query.lat = "-23.56";
    req.query.lng = "-46.65";
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ display_name: "Avenida Paulista" }),
    });

    await geocodeHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("reverse?format=jsonv2&lat=-23.56&lon=-46.65"),
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ display_name: "Avenida Paulista" })
    );
  });
});

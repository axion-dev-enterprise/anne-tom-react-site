const matrixRouteHandler = require("../matrix-route");

describe("Matrix Route API Handler", () => {
  const originalFetch = global.fetch;
  let req;
  let res;

  beforeEach(() => {
    req = {
      method: "GET",
      query: {
        olat: "-23.501",
        olon: "-46.625",
        dlat: "-23.547",
        dlon: "-46.637",
      },
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
    await matrixRouteHandler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "GET");
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "method_not_allowed" });
  });

  it("rejects missing or invalid coordinates with 400", async () => {
    req.query.olat = "invalid";
    await matrixRouteHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid_parameter:olat" });
  });

  it("proxies route call to Axion Matrix service successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ distance_km: 5.9, duration_min: 11 }),
    });

    await matrixRouteHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://matrix.axionenterprise.cloud/route?olat=-23.501&olon=-46.625&dlat=-23.547&dlon=-46.637")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ distance_km: 5.9, duration_min: 11 });
  });
});

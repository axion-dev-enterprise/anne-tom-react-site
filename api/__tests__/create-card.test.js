const createCardHandler = require("../create-card");

describe("Create Card API Handler", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;
  let req;
  let res;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, MERCADOPAGO_ACCESS_TOKEN: "mock_mp_token" };
    req = {
      method: "POST",
      headers: {
        host: "localhost:3000",
      },
      body: {
        amount: 80.0,
        description: "Test Pizza Card",
        payerEmail: "test@gmail.com",
        payerName: "John Doe",
        externalReference: "orders-124",
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
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("rejects non-POST methods with 405", async () => {
    req.method = "GET";
    await createCardHandler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "POST");
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "method_not_allowed" });
  });

  it("rejects missing token with 500", async () => {
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    await createCardHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "missing_mercadopago_token" });
  });

  it("rejects invalid amount with 400", async () => {
    req.body.amount = 0;
    await createCardHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid_amount" });
  });

  it("creates card payment preference in Mercado Pago successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "pref-123456",
        init_point: "https://www.mercadopago.com/init_pref_123",
        sandbox_init_point: "https://sandbox.mercadopago.com/init_pref_123",
      }),
    });

    await createCardHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.mercadopago.com/checkout/preferences",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer mock_mp_token",
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        checkoutUrl: "https://www.mercadopago.com/init_pref_123",
        transactionId: "pref-123456",
      })
    );
  });
});

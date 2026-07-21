const createPixHandler = require("../create-pix");

describe("Create Pix API Handler", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;
  let req;
  let res;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, MERCADOPAGO_ACCESS_TOKEN: "mock_mp_token" };
    req = {
      method: "POST",
      headers: {},
      body: {
        amount: 50.0,
        description: "Test Pizza",
        payerEmail: "test@gmail.com",
        payerName: "John Doe",
        externalReference: "orders-123",
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
    await createPixHandler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "POST");
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "method_not_allowed" });
  });

  it("rejects missing token with 500", async () => {
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    await createPixHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "missing_mercadopago_token" });
  });

  it("rejects invalid amount with 400", async () => {
    req.body.amount = -5;
    await createPixHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid_amount" });
  });

  it("creates Pix payment in Mercado Pago successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 998877,
        status: "pending",
        status_detail: "pending_waiting_transfer",
        transaction_amount: 50.0,
        point_of_interaction: {
          transaction_data: {
            qr_code: "pix_payload_sample",
            qr_code_base64: "base64_sample",
            ticket_url: "url_sample",
          },
        },
      }),
    });

    await createPixHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.mercadopago.com/v1/payments",
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
        pix_payload: "pix_payload_sample",
        transactionId: 998877,
      })
    );
  });
});

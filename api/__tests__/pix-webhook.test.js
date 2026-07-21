const pixWebhookHandler = require("../pix-webhook");

describe("Pix Webhook API Handler", () => {
  let req;
  let res;
  const originalLog = console.log;

  beforeEach(() => {
    req = {
      method: "POST",
      body: {
        action: "payment.created",
        type: "payment",
        data: {
          id: "12345",
        },
      },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it("rejects non-POST methods with 405", async () => {
    req.method = "GET";
    await pixWebhookHandler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "POST");
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "method_not_allowed" });
  });

  it("handles payment.created webhook and returns 200", async () => {
    await pixWebhookHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("[pix-webhook] Payment 12345 event: payment.created")
    );
  });

  it("handles query params topic/id notifications and returns 200", async () => {
    req.body = null;
    req.query = {
      topic: "payment",
      id: "998877",
    };

    await pixWebhookHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
    expect(console.log).toHaveBeenCalledWith("[pix-webhook] Payment notification for id=998877");
  });
});

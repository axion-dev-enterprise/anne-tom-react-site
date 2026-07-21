import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import OrderConfirmationPage from "../OrderConfirmationPage";
import server from "../../api/server";

jest.mock("../../api/server");
jest.mock("../../hooks/useCheckout", () => ({
  enviarParaDesktop: jest.fn(),
}));

const originalLocation = window.location;

describe("OrderConfirmationPage", () => {
  let locationMock;

  beforeAll(() => {
    delete window.location;
    locationMock = {
      href: "",
      search: "?orderId=orders-12345",
      pathname: "/confirmacao",
      assign: jest.fn(),
    };
    window.location = locationMock;
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    locationMock.href = "";
    locationMock.search = "?orderId=orders-12345";
    localStorage.clear();
    sessionStorage.clear();

    server.fetchStatus.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        order: {
          status: "preparing",
          id: "orders-12345",
          customerSnapshot: {
            address: { neighborhood: "Santana" },
          },
        }
      }),
    });
  });

  it("renders status info from URL trackingId", async () => {
    const summary = {
      items: [{ id: "1", nome: "Musa", quantidade: 1, precoUnitario: 60 }],
      pagamento: "pix",
      totalFinal: 70,
      subtotal: 60,
      taxaEntrega: 10,
      dados: { nome: "Lais Navarro", telefone: "11999998888" },
      pixPayment: { copiaColar: "pixcode123", expiresAt: "2026-07-18T20:00:00Z" }
    };
    localStorage.setItem("lastOrderSummary", JSON.stringify(summary));

    render(
      <HelmetProvider>
        <BrowserRouter>
          <OrderConfirmationPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    // Should display order confirmation success
    expect(screen.getByText("Pedido enviado com sucesso!")).toBeInTheDocument();
    
    // Status label should be displayed
    await waitFor(() => {
      expect(screen.getByText("Em preparação")).toBeInTheDocument();
    });
  });

  it("handles copying the PIX code", async () => {
    const summary = {
      items: [{ id: "1", nome: "Musa", quantidade: 1, precoUnitario: 60 }],
      pagamento: "pix",
      totalFinal: 70,
      dados: { nome: "Lais Navarro", telefone: "11999998888" },
      pixPayment: { copiaColar: "pixcode123", expiresAt: "2026-07-18T20:00:00Z" }
    };
    localStorage.setItem("lastOrderSummary", JSON.stringify(summary));

    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(),
    };
    
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      configurable: true,
      writable: true,
    });

    render(
      <HelmetProvider>
        <BrowserRouter>
          <OrderConfirmationPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    const copyBtn = screen.getByText("Copiar codigo");
    fireEvent.click(copyBtn);

    expect(mockClipboard.writeText).toHaveBeenCalledWith("pixcode123");
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import CardapioPage from "../CardapioPage";
import { useCart } from "../../context/CartContext";
import { useMenuData } from "../../hooks/useMenuData";
import { useAppAccessInfo } from "../../hooks/useAppAccess";
import server from "../../api/server";

jest.mock("../../context/CartContext");
jest.mock("../../hooks/useMenuData");
jest.mock("../../hooks/useAppAccess");
jest.mock("../../api/server");

describe("CardapioPage", () => {
  const mockAddItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();

    useCart.mockReturnValue({
      items: [],
      addItem: mockAddItem,
      total: 0,
    });

    useAppAccessInfo.mockReturnValue({
      isAppWebView: false,
      isMobileBrowser: false,
      hasAppParam: false,
      initialized: true,
    });

    useMenuData.mockReturnValue({
      menuData: {
        extras: [],
      },
      pizzas: [
        {
          id: "pizza-musa",
          nome: "Musa",
          categoria: "tradicionais",
          ingredientes: ["Tomate", "Mucarela", "Manjericao"],
          preco_grande: 60.00,
          preco_broto: 45.00,
          badges: ["best"],
        },
        {
          id: "pizza-calabreza",
          nome: "Calabresa",
          categoria: "tradicionais",
          ingredientes: ["Calabresa", "Cebola"],
          preco_grande: 65.00,
          preco_broto: 48.00,
          badges: [],
        }
      ],
      loadingMenu: false,
      menuError: "",
      isUsingCachedMenu: false,
      retry: jest.fn(),
    });

    server.fetchBusinessHours.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        businessHours: { enabled: false },
        status: { isOpen: true },
      }),
    });
  });

  it("renders standard categories and products list", async () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <CardapioPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    // Wait for store to open
    await screen.findByText("Aberto agora");

    expect(screen.getByText("Musa")).toBeInTheDocument();
    expect(screen.getByText("Calabresa")).toBeInTheDocument();
  });

  it("opens modal and adds item to cart", async () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <CardapioPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    // Wait for store to open
    await screen.findByText("Aberto agora");

    // Open pizza modal using button role
    const musaButton = screen.getByRole("button", { name: /Musa/i });
    fireEvent.click(musaButton);

    // Verify modal elements
    expect(screen.getByText(/Escolha o Tamanho/i)).toBeInTheDocument();
    expect(screen.getByText(/Grande \(8 fatias\)/i)).toBeInTheDocument();

    // Click add to cart
    const addToCartButton = screen.getByText(/Adicionar ao carrinho/i);
    fireEvent.click(addToCartButton);

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        idPizza: "pizza-musa",
        nome: "Musa",
        tamanho: "grande",
        quantidade: 1,
      })
    );
  });
});

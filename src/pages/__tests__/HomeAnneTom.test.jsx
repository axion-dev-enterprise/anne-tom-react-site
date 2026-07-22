import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import HomeAnneTom from "../HomeAnneTom";
import { useMenuData } from "../../hooks/useMenuData";
import { useAppAccessInfo } from "../../hooks/useAppAccess";

jest.mock("../../hooks/useMenuData");
jest.mock("../../hooks/useAppAccess");
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    customer: null,
    isAuthenticated: false,
    loadingAuth: false,
    loginOrRegister: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe("HomeAnneTom Page", () => {
  beforeEach(() => {
    useAppAccessInfo.mockReturnValue({
      isAppWebView: false,
      isMobileBrowser: false,
      hasAppParam: false,
      initialized: true,
    });
    useMenuData.mockReturnValue({
      pizzas: [
        { id: "1", nome: "Musa", categoria: "tradicional", ingredientes: ["Tomate", "Queijo"], badges: ["best"] },
        { id: "2", nome: "Veggiona", categoria: "veggie", ingredientes: ["Espinafre", "Cogumelos"], badges: ["veggie"] }
      ],
      loadingMenu: false,
      menuError: "",
      retry: jest.fn(),
    });
  });

  it("renders correctly with header and hero content", () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <HomeAnneTom />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.getByText(/Pizza artesanal com/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Montar meu pedido/i)[0]).toBeInTheDocument();
  });

  it("displays best seller and veggie sections", () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <HomeAnneTom />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.getByText("Musa")).toBeInTheDocument();
    expect(screen.getByText("Veggiona")).toBeInTheDocument();
  });

  it("shows retry banner when menu fails to load", () => {
    useMenuData.mockReturnValue({
      pizzas: [],
      loadingMenu: false,
      menuError: "Erro ao carregar cardapio.",
      retry: jest.fn(),
    });

    render(
      <HelmetProvider>
        <BrowserRouter>
          <HomeAnneTom />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.getAllByText(/Erro ao carregar cardapio/i).length).toBeGreaterThan(0);
  });
});

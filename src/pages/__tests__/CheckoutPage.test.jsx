import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import CheckoutPage from "../CheckoutPage";
import { useCheckout } from "../../hooks/useCheckout";

jest.mock("../../hooks/useCheckout");
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

describe("CheckoutPage", () => {
  const mockAvancar = jest.fn();
  const mockVoltar = jest.fn();
  const mockSetPagamento = jest.fn();
  const mockEnviarPedido = jest.fn();

  const baseCheckoutState = {
    items: [
      { id: "1", nome: "Musa", tamanho: "grande", quantidade: 2, precoUnitario: 60.0 },
    ],
    totalItens: 2,
    passo: 0,
    etapas: ["Carrinho", "Identificação", "Revisão", "Pagamento"],
    avancar: mockAvancar,
    voltar: mockVoltar,
    dados: {
      nome: "",
      telefone: "",
      email: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
    },
    setDados: jest.fn(),
    tipoCliente: "delivery",
    setTipoCliente: jest.fn(),
    clienteExistente: null,
    checandoCliente: false,
    erroClienteApi: "",
    onBuscarClientePorTelefone: jest.fn(),
    buscarCep: jest.fn(),
    buscandoCep: false,
    erroCep: "",
    cupom: "",
    setCupom: jest.fn(),
    aplicarCupom: jest.fn(),
    pagamento: "pix",
    setPagamento: mockSetPagamento,
    pixPayment: null,
    pixLoading: false,
    pixError: "",
    cardPayment: null,
    cardLoading: false,
    cardError: "",
    createCardPayment: jest.fn(),
    cardCheckoutUrl: "",
    subtotal: 120.0,
    taxaEntrega: 10.0,
    desconto: 0,
    totalFinal: 130.0,
    podeEnviar: true,
    enviando: false,
    deliveryEta: "",
    deliveryEtaLoading: false,
    deliveryEtaError: "",
    distanceFee: 10.0,
    deliveryFeeLabel: "R$ 10,00",
    podeAvancarDados: true,
    updateQuantity: jest.fn(),
    removeItem: jest.fn(),
    addItem: jest.fn(),
    enviarPedido: mockEnviarPedido,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCheckout.mockReturnValue(baseCheckoutState);
  });

  it("renders cart step initially", () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(screen.getAllByText(/Musa/)[0]).toBeInTheDocument();
    expect(screen.getByText("Avançar →")).toBeInTheDocument();
  });

  it("navigates forward when click avancar", () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    const btn = screen.getByText("Avançar →");
    fireEvent.click(btn);
    expect(mockAvancar).toHaveBeenCalled();
  });

  it("renders personal data step when step is 1", () => {
    useCheckout.mockReturnValue({
      ...baseCheckoutState,
      passo: 1,
      dados: {
        ...baseCheckoutState.dados,
        telefone: "11999998888",
      },
      tipoCliente: "novo",
    });

    render(
      <HelmetProvider>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.getByPlaceholderText("Nome completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Telefone / WhatsApp")).toBeInTheDocument();
  });

  it("renders review step when step is 2", () => {
    useCheckout.mockReturnValue({
      ...baseCheckoutState,
      passo: 2,
      dados: {
        nome: "Iago Barreto",
        telefone: "11988887777",
        email: "iago@axion.com",
        cep: "02030400",
        endereco: "Rua Voluntarios da Patria",
        numero: "1000",
        bairro: "Santana",
      }
    });

    render(
      <HelmetProvider>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.getByText("Iago Barreto")).toBeInTheDocument();
    expect(screen.getByText("Rua Voluntarios da Patria, 1000")).toBeInTheDocument();
  });

  it("renders payment step when step is 3", () => {
    useCheckout.mockReturnValue({
      ...baseCheckoutState,
      passo: 3,
    });

    render(
      <HelmetProvider>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.getAllByRole("button", { name: /Pix/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Cartao/i })[0]).toBeInTheDocument();
  });
});

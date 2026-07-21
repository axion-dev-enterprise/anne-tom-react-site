import { getFeeByDistance, getTaxaPorBairro, parseDistanceKm } from "../deliveryFees";

describe("deliveryFees utils", () => {
  it("calcula taxa por faixa de distancia", () => {
    expect(getFeeByDistance(0.7)).toBe(3.5);
    expect(getFeeByDistance(2.0)).toBe(7.5);
    expect(getFeeByDistance(10.2)).toBe(18);
  });

  it("retorna null quando distancia eh invalida", () => {
    expect(getFeeByDistance(null)).toBeNull();
    expect(getFeeByDistance(Number.NaN)).toBeNull();
  });

  it("interpreta distancia em km e metros", () => {
    expect(parseDistanceKm("1.3 km")).toBeCloseTo(1.3);
    expect(parseDistanceKm("900 m")).toBeCloseTo(0.9);
    expect(parseDistanceKm(undefined)).toBeNull();
  });

  it("retorna taxa por bairro com fallback", () => {
    expect(getTaxaPorBairro("Casa Verde")).toBe(8);
    expect(getTaxaPorBairro("Outro")).toBe(10);
  });
});

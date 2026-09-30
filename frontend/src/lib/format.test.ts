import { describe, expect, it } from "vitest";
import { dateTime, fromGen, gen, shortAddress, terminal } from "@/lib/format";

describe("format", () => {
  it("shortens addresses and handles missing values", () => {
    expect(shortAddress("0x1234567890abcdef1234")).toBe("0x1234…1234");
    expect(shortAddress(null)).toBe("-");
    expect(shortAddress(undefined)).toBe("-");
  });

  it("renders wei as GEN with two fraction digits", () => {
    expect(gen(2n * 10n ** 18n)).toBe("2.00 GEN");
    expect(gen("1500000000000000000")).toBe("1.50 GEN");
    expect(gen(0)).toBe("0.00 GEN");
  });

  it("parses decimal GEN input exactly", () => {
    expect(fromGen("2")).toBe(2n * 10n ** 18n);
    expect(fromGen("1.5")).toBe(15n * 10n ** 17n);
    expect(fromGen("")).toBe(0n);
    expect(fromGen("0.000000000000000001")).toBe(1n);
  });

  it("round-trips values used by the create form", () => {
    expect(fromGen(gen(3n * 10n ** 18n).replace(" GEN", "").split(".")[0])).toBe(3n * 10n ** 18n);
  });

  it("classifies terminal states", () => {
    expect(terminal("PAID")).toBe(true);
    expect(terminal("REFUNDED")).toBe(true);
    expect(terminal("EXPIRED")).toBe(true);
    expect(terminal("CANCELLED")).toBe(true);
    expect(terminal("OPEN")).toBe(false);
    expect(terminal("JUDGING")).toBe(false);
  });

  it("renders zero timestamps as a dash", () => {
    expect(dateTime(0)).toBe("-");
    expect(dateTime(1700000000)).not.toBe("-");
  });
});

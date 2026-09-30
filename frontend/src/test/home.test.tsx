import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import Home from "@/Home";
import { configureContracts, installEthereum, renderRoute } from "./harness";

let eth: ReturnType<typeof installEthereum> | null = null;

afterEach(() => {
  eth?.restore();
  eth = null;
  vi.unstubAllEnvs();
});

describe("Home configuration banner", () => {
  it("shows the not-configured banner when deployment addresses are missing", () => {
    vi.stubEnv("VITE_PROOF_REFERRAL_ADDRESS", "");
    vi.stubEnv("VITE_OUTCOME_JUDGE_ADDRESS", "");
    eth = installEthereum();
    renderRoute(<Home />);
    expect(screen.getByText(/deployment not configured/i)).toBeDefined();
    expect(document.querySelector(".config-banner")).toBeTruthy();
  });

  it("hides the banner once both contract addresses are configured", () => {
    configureContracts();
    eth = installEthereum();
    const { container } = renderRoute(<Home />);
    expect(container.querySelector(".config-banner")).toBeNull();
  });

  it("keeps the landing page free of simulated contract results", () => {
    configureContracts();
    eth = installEthereum();
    renderRoute(<Home />);
    expect(document.body.textContent).not.toMatch(/demo opportunity|sample opportunity|mock opportunity/i);
    expect(document.querySelector(".lifecycle")).toBeTruthy();
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import AppHeader from "@/components/AppHeader";
import { EMPLOYER, GEN_LAYER_CHAIN_HEX, installEthereum, renderRoute } from "./harness";

let eth: ReturnType<typeof installEthereum> | null = null;
const bare = { header: false } as const;

afterEach(() => {
  eth?.restore();
  eth = null;
});

describe("AppHeader wallet states", () => {
  it("shows the disconnected state with a connect button", () => {
    eth = installEthereum({ accounts: [] });
    renderRoute(<AppHeader />, "/", bare);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeDefined();
    expect(screen.getByText(/Studio Next · 61997/)).toBeDefined();
    expect(screen.queryByText(/disconnect/i)).toBeNull();
  });

  it("renders a wallet-missing error when connecting without an injected provider", () => {
    renderRoute(<AppHeader />, "/", bare);
    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    expect(screen.getByText("Install a compatible browser wallet first.")).toBeDefined();
  });

  it("connects an authorized wallet and shows the address pill", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: GEN_LAYER_CHAIN_HEX });
    renderRoute(<AppHeader />, "/", bare);
    await waitFor(() => expect(screen.getByText(/0x1111…1111/)).toBeDefined());
    expect(screen.getByRole("button", { name: /disconnect/i })).toBeDefined();
    expect(screen.queryByRole("button", { name: /connect wallet/i })).toBeNull();
  });

  it("prompts a network switch when the wallet is on the wrong chain", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: "0x1" });
    renderRoute(<AppHeader />, "/", bare);
    await waitFor(() => expect(screen.getByText(/Wrong network · 1/)).toBeDefined());
    const switchButton = screen.getByRole("button", { name: /switch to 61997/i });
    fireEvent.click(switchButton);
    await waitFor(() => expect(screen.getByText(/Studio Next · 61997/)).toBeDefined());
    expect(eth.state.chainId).toBe(GEN_LAYER_CHAIN_HEX);
    expect(screen.getByText(/0x1111…1111/)).toBeDefined();
  });

  it("exposes the primary navigation links", () => {
    eth = installEthereum({ accounts: [] });
    renderRoute(<AppHeader />, "/", bare);
    for (const label of ["Opportunities", "Dashboard", "Protocol", "Docs", "Developers", "Create"]) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });
});

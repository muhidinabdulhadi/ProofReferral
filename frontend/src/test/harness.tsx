import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import AppHeader from "@/components/AppHeader";
import { WalletProvider } from "@/lib/genlayer/wallet";

export const EMPLOYER = "0x1111111111111111111111111111111111111111";
export const REFERRER = "0x2222222222222222222222222222222222222222";
export const CANDIDATE = "0x3333333333333333333333333333333333333333";
export const STRANGER = "0x4444444444444444444444444444444444444444";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const GEN_LAYER_CHAIN_HEX = "0xf22d";

export type EthereumMock = {
  request: ReturnType<typeof vi.fn>;
  state: { accounts: string[]; chainId: string };
  restore(): void;
};

export function installEthereum(options: { accounts?: string[]; chainId?: string } = {}): EthereumMock {
  const state = {
    accounts: options.accounts ?? [],
    chainId: options.chainId ?? GEN_LAYER_CHAIN_HEX,
  };
  const request = vi.fn(async ({ method, params }: { method: string; params?: any[] }) => {
    switch (method) {
      case "eth_accounts":
        return state.accounts;
      case "eth_requestAccounts": {
        if (!state.accounts.length) state.accounts = [EMPLOYER];
        return state.accounts;
      }
      case "eth_chainId":
        return state.chainId;
      case "wallet_switchEthereumChain": {
        state.chainId = params?.[0]?.chainId ?? state.chainId;
        return null;
      }
      case "wallet_addEthereumChain":
        return null;
      case "wallet_revokePermissions":
        state.accounts = [];
        return null;
      default:
        return null;
    }
  });
  const injected = { request, on: vi.fn(), removeListener: vi.fn() };
  (window as any).ethereum = injected;
  return {
    request,
    state,
    restore() {
      delete (window as any).ethereum;
    },
  };
}

export function configureContracts() {
  vi.stubEnv("VITE_PROOF_REFERRAL_ADDRESS", "0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8");
  vi.stubEnv("VITE_OUTCOME_JUDGE_ADDRESS", "0x7842393CeEAB5F053B3024673B5986fDdb95A4C9");
}

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchInterval: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderRoute(ui: ReactNode, path = "/", options: { header?: boolean } = {}) {
  const { header = true } = options;
  const client = makeClient();
  const utils = render(
    <QueryClientProvider client={client}>
      <WalletProvider>
        <MemoryRouter initialEntries={[path]}>
          {header && <AppHeader />}
          <Routes>
            <Route path="*" element={ui} />
          </Routes>
        </MemoryRouter>
      </WalletProvider>
    </QueryClientProvider>,
  );
  return { ...utils, client };
}

export function renderAt(ui: ReactNode, routePath: string, url: string, options: { header?: boolean } = {}) {
  const { header = true } = options;
  const client = makeClient();
  const utils = render(
    <QueryClientProvider client={client}>
      <WalletProvider>
        <MemoryRouter initialEntries={[url]}>
          {header && <AppHeader />}
          <Routes>
            <Route path={routePath} element={ui} />
          </Routes>
        </MemoryRouter>
      </WalletProvider>
    </QueryClientProvider>,
  );
  return { ...utils, client };
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VerifiedTransaction from "@/components/VerifiedTransaction";
import { WalletProvider } from "@/lib/genlayer/wallet";
import { EMPLOYER, GEN_LAYER_CHAIN_HEX, installEthereum } from "./harness";

const { panelState, kitState, verifyMock, verifiedMock } = vi.hoisted(() => ({
  panelState: { status: { successful: true, genlayerTxId: "0xabc123" } as any },
  kitState: { kit: {} as any },
  verifyMock: vi.fn(),
  verifiedMock: vi.fn(),
}));

vi.mock("@genlayer/transaction-kit-react", () => ({
  GenLayerTransactionPanel: ({ onDone }: any) => (
    <button data-testid="mock-panel" onClick={() => onDone(panelState.status)}>
      mock submit
    </button>
  ),
}));

vi.mock("@/lib/genlayer/kit", () => ({
  useTransactionKit: () => kitState.kit,
}));

const TX = {
  kind: "write",
  address: "0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8",
  method: "create_opportunity",
  args: [],
} as any;

function renderTx() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <WalletProvider>
        <VerifiedTransaction tx={TX} verify={verifyMock} onVerified={verifiedMock} />
      </WalletProvider>
    </QueryClientProvider>,
  );
}

let eth: ReturnType<typeof installEthereum> | null = null;

beforeEach(() => {
  panelState.status = { successful: true, genlayerTxId: "0xabc123" };
  kitState.kit = {};
  verifyMock.mockReset();
  verifiedMock.mockReset();
});

afterEach(() => {
  eth?.restore();
  eth = null;
  vi.useRealTimers();
});

describe("VerifiedTransaction confirmation gating", () => {
  it("asks for the acting wallet when nobody is connected", async () => {
    eth = installEthereum({ accounts: [] });
    renderTx();
    expect(
      (await screen.findByText("Connect the wallet that must perform this protocol action.")).textContent,
    ).toBeTruthy();
    expect(screen.queryByTestId("mock-panel")).toBeNull();
  });

  it("refuses to sign on the wrong chain", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: "0x1" });
    renderTx();
    await screen.findByText("Switch to Studio Next / Studionet Dev chain 61997 before signing.");
    expect(screen.queryByTestId("mock-panel")).toBeNull();
  });

  it("reports an unavailable transaction kit session", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: GEN_LAYER_CHAIN_HEX });
    kitState.kit = null;
    renderTx();
    await screen.findByText("Transaction Kit is unavailable for this wallet session.");
    expect(screen.queryByTestId("mock-panel")).toBeNull();
  });

  it("renders the full finality proof line before any signature", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: GEN_LAYER_CHAIN_HEX });
    renderTx();
    await screen.findByText("Signature");
    for (const step of ["Submitted", "Consensus", "Finalized", "Readback"]) {
      expect(screen.getByText(step)).toBeDefined();
    }
    expect(
      screen.getByText(/never labels a write successful from wallet submission alone/i),
    ).toBeDefined();
  });

  it("confirms only after finalization and a passing contract readback", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: GEN_LAYER_CHAIN_HEX });
    verifyMock.mockResolvedValue(true);
    renderTx();
    fireEvent.click(await screen.findByTestId("mock-panel"));
    await waitFor(() => expect(screen.getByText("Protocol state confirmed")).toBeDefined());
    expect(verifyMock).toHaveBeenCalled();
    expect(verifiedMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/finalized and confirmed by contract readback/i)).toBeDefined();
  });

  it("marks an unsuccessful finalized execution as failed", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: GEN_LAYER_CHAIN_HEX });
    panelState.status = { successful: false, genlayerTxId: "0xbad" };
    renderTx();
    fireEvent.click(await screen.findByTestId("mock-panel"));
    await waitFor(() => expect(screen.getByText("Not confirmed")).toBeDefined());
    expect(
      screen.getByText("The finalized transaction did not execute successfully."),
    ).toBeDefined();
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("fails readback and blocks blind resubmission when state never matches", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: GEN_LAYER_CHAIN_HEX });
    verifyMock.mockResolvedValue(false);
    renderTx();
    const panel = await screen.findByTestId("mock-panel");
    vi.useFakeTimers();
    fireEvent.click(panel);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });
    expect(screen.getByText("Not confirmed")).toBeDefined();
    expect(
      screen.getByText(/do not resubmit until the transaction is inspected/i),
    ).toBeDefined();
    expect(verifiedMock).not.toHaveBeenCalled();
  });

  it("surfaces the submitted transaction hash with an explorer link", async () => {
    eth = installEthereum({ accounts: [EMPLOYER], chainId: GEN_LAYER_CHAIN_HEX });
    verifyMock.mockResolvedValue(true);
    renderTx();
    fireEvent.click(await screen.findByTestId("mock-panel"));
    await waitFor(() => expect(screen.getByText("Transaction submitted")).toBeDefined());
    const link = screen.getByRole("link", { name: /view on explorer/i });
    expect(link.getAttribute("href")).toContain("/tx/0xabc123");
    await waitFor(() => expect(screen.getByText("Protocol state confirmed")).toBeDefined());
  });
});

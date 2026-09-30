import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import OpportunitiesPage from "@/Opportunities";
import { configureContracts, installEthereum, renderRoute } from "./harness";

const { readFinalMock } = vi.hoisted(() => ({ readFinalMock: vi.fn() }));

vi.mock("@/lib/genlayer/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/genlayer/client")>();
  return { ...actual, readFinal: readFinalMock };
});

const ACCOUNTING = {
  total_funded: "3000000000000000000",
  total_paid: "0",
  total_refunded: "0",
  locked_total: "3000000000000000000",
  conservation_delta: "0",
};

const opportunity = {
  id: 1,
  employer: "0x1111111111111111111111111111111111111111",
  candidate: "0x3333333333333333333333333333333333333333",
  title: "Implement CSV export",
  brief: "brief",
  acceptance_criteria: "criteria",
  repo_owner: "ometere123",
  repo_name: "evifix",
  candidate_payment: "2000000000000000000",
  referral_reward: "1000000000000000000",
  funded_amount: "3000000000000000000",
  created_at: 0,
  referral_deadline: 0,
  completion_deadline: 0,
  state: "OPEN",
  state_code: 0,
  referrer: "0x0000000000000000000000000000000000000000",
  candidate_github: "",
  referred_at: 0,
  accepted_at: 0,
  active_attempt: 0,
  attempt_count: 0,
  active_pr_number: 0,
  evidence_submitted_at: 0,
  judgment_timeout_at: 0,
  retry_deadline: 0,
  last_outcome: "NONE",
  last_outcome_code: 0,
  last_evidence_digest: "",
  last_reason: "",
  last_audit: "",
  closed_at: 0,
  settlement_released: false,
};

function respondWith(rows: unknown[]) {
  readFinalMock.mockImplementation(async (_address: string, fn: string) => {
    if (fn === "list_opportunities") return rows;
    if (fn === "get_accounting") return ACCOUNTING;
    return null;
  });
}

let eth: ReturnType<typeof installEthereum> | null = null;

beforeEach(() => {
  configureContracts();
  eth = installEthereum({ accounts: [] });
});

afterEach(() => {
  eth?.restore();
  eth = null;
  vi.unstubAllEnvs();
});

describe("Opportunities directory", () => {
  it("renders the not-configured empty state without chain reads", async () => {
    vi.stubEnv("VITE_PROOF_REFERRAL_ADDRESS", "");
    vi.stubEnv("VITE_OUTCOME_JUDGE_ADDRESS", "");
    respondWith([]);
    renderRoute(<OpportunitiesPage />, "/opportunities");
    expect(screen.getByText("The live directory is not configured.")).toBeDefined();
    await waitFor(() => expect(readFinalMock).not.toHaveBeenCalled());
  });

  it("shows an empty state instead of mock rows when the contract returns nothing", async () => {
    respondWith([]);
    renderRoute(<OpportunitiesPage />, "/opportunities");
    await waitFor(() => expect(screen.getByText(/no finalized opportunities yet/i)).toBeDefined());
    expect(document.querySelectorAll(".opportunity-row")).toHaveLength(0);
    expect(screen.queryByText(/demo/i)).toBeNull();
  });

  it("surfaces a read failure without falling back to cached or mock data", async () => {
    readFinalMock.mockRejectedValue(new Error("rpc down"));
    renderRoute(<OpportunitiesPage />, "/opportunities");
    await waitFor(() =>
      expect(
        screen.getByText(/finalized contract read failed\. no cached or mock opportunities are shown\./i),
      ).toBeDefined(),
    );
    expect(document.querySelectorAll(".opportunity-row")).toHaveLength(0);
  });

  it("lists finalized opportunities with amounts, referrer state and accounting", async () => {
    respondWith([opportunity]);
    renderRoute(<OpportunitiesPage />, "/opportunities");
    await waitFor(() => expect(screen.getByText("Implement CSV export")).toBeDefined());
    expect(screen.getByText("2.00 GEN")).toBeDefined();
    expect(screen.getByText("1.00 GEN")).toBeDefined();
    expect(screen.getByText("open")).toBeDefined();
    expect(screen.getByText(/accounting delta/i)).toBeDefined();
    expect(screen.getByText(/0 wei/i)).toBeDefined();
  });

  it("shows a locked referrer once attribution exists", async () => {
    respondWith([{ ...opportunity, referrer: "0x2222222222222222222222222222222222222222", state: "REFERRED" }]);
    renderRoute(<OpportunitiesPage />, "/opportunities");
    await waitFor(() => expect(screen.getByText("REFERRED")).toBeDefined());
    expect(screen.getByText("0x2222…2222")).toBeDefined();
    expect(screen.queryByText("open")).toBeNull();
  });
});

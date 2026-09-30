import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/Dashboard";
import { configureContracts, EMPLOYER, installEthereum, renderRoute, STRANGER } from "./harness";

const { readFinalMock } = vi.hoisted(() => ({ readFinalMock: vi.fn() }));

vi.mock("@/lib/genlayer/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/genlayer/client")>();
  return { ...actual, readFinal: readFinalMock };
});

const opportunity = {
  id: 7,
  employer: EMPLOYER,
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

function serve(rows: unknown[]) {
  readFinalMock.mockImplementation(async (_address: string, fn: string) => {
    if (fn === "list_opportunities") return rows;
    return null;
  });
}

let eth: ReturnType<typeof installEthereum> | null = null;

beforeEach(() => {
  configureContracts();
});

afterEach(() => {
  eth?.restore();
  eth = null;
  vi.unstubAllEnvs();
});

describe("Dashboard", () => {
  it("asks a disconnected visitor to connect", async () => {
    serve([]);
    eth = installEthereum({ accounts: [] });
    renderRoute(<DashboardPage />, "/dashboard");
    await waitFor(() => expect(screen.getByText("Connect a wallet")).toBeDefined());
    expect(screen.getByText(/connect on studio next chain 61997/i)).toBeDefined();
  });

  it("shows only opportunities tied to the connected address with its role", async () => {
    serve([opportunity]);
    eth = installEthereum({ accounts: [EMPLOYER] });
    renderRoute(<DashboardPage />, "/dashboard");
    await waitFor(() => expect(screen.getByText("Implement CSV export")).toBeDefined());
    expect(screen.getByText("Employer")).toBeDefined();
    expect(screen.getAllByText("Implement CSV export")).toHaveLength(1);
  });

  it("shows an empty state when the wallet holds no positions", async () => {
    serve([opportunity]);
    eth = installEthereum({ accounts: [STRANGER] });
    renderRoute(<DashboardPage />, "/dashboard");
    await waitFor(() =>
      expect(screen.getByText(/no opportunities are associated with/i)).toBeDefined(),
    );
    expect(screen.queryByText("Implement CSV export")).toBeNull();
  });
});

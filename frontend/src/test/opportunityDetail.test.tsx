import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import OpportunityPage from "@/OpportunityDetail";
import {
  CANDIDATE,
  configureContracts,
  EMPLOYER,
  GEN_LAYER_CHAIN_HEX,
  installEthereum,
  REFERRER,
  renderAt,
  STRANGER,
  ZERO_ADDRESS,
} from "./harness";

const { readFinalMock } = vi.hoisted(() => ({ readFinalMock: vi.fn() }));

vi.mock("@/lib/genlayer/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/genlayer/client")>();
  return { ...actual, readFinal: readFinalMock };
});

vi.mock("@/components/VerifiedTransaction", () => ({
  default: ({ tx }: any) => <div data-testid="verified-tx">{tx.method}</div>,
}));

const now = () => Math.floor(Date.now() / 1000);

function fixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    employer: EMPLOYER,
    candidate: CANDIDATE,
    title: "Implement CSV export",
    brief: "Deliver a CSV export with permission checks.",
    acceptance_criteria: "Export renders for admins and is denied for unauthorized users.",
    repo_owner: "ometere123",
    repo_name: "evifix",
    candidate_payment: "2000000000000000000",
    referral_reward: "1000000000000000000",
    funded_amount: "3000000000000000000",
    created_at: now() - 3600,
    referral_deadline: now() + 86400,
    completion_deadline: now() + 604800,
    state: "OPEN",
    state_code: 0,
    referrer: ZERO_ADDRESS,
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
    ...overrides,
  };
}

function serve(opportunity: Record<string, unknown>, judgment: Record<string, unknown> | null = null) {
  readFinalMock.mockImplementation(async (_address: string, fn: string) => {
    if (fn === "get_opportunity") return opportunity;
    if (fn === "get_judgment") return judgment ?? {};
    return null;
  });
}

function renderDetail() {
  return renderAt(<OpportunityPage />, "/opportunities/:id", "/opportunities/1");
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

describe("OpportunityDetail read states", () => {
  it("shows a finalized-read failure instead of a stale record", async () => {
    readFinalMock.mockRejectedValue(new Error("rpc down"));
    eth = installEthereum({ accounts: [EMPLOYER] });
    renderDetail();
    await waitFor(() =>
      expect(screen.getByText(/could not read this opportunity from finalized contract state/i)).toBeDefined(),
    );
  });

  it("waits for the finalized read before rendering", async () => {
    serve(fixture());
    eth = installEthereum({ accounts: [EMPLOYER] });
    renderDetail();
    await waitFor(() => expect(screen.getByText("Implement CSV export")).toBeDefined());
    expect(screen.getByText("OPEN")).toBeDefined();
    expect(screen.getByText("2.00 GEN")).toBeDefined();
  });
});

describe("OpportunityDetail wallet gating", () => {
  it("asks a disconnected visitor to connect before showing actions", async () => {
    serve(fixture());
    eth = installEthereum({ accounts: [] });
    renderDetail();
    await waitFor(() => expect(screen.getByText(/your available protocol action/i)).toBeDefined());
    expect(
      screen.getByText("Connect a wallet to see the action available to that address."),
    ).toBeDefined();
  });

  it("warns when the wallet is on the wrong chain", async () => {
    serve(fixture());
    eth = installEthereum({ accounts: [EMPLOYER], chainId: "0x1" });
    renderDetail();
    await waitFor(() =>
      expect(
        screen.getByText("Connected wallet is not on Studio Next / Studionet Dev chain 61997."),
      ).toBeDefined(),
    );
  });
});

describe("OpportunityDetail role and state gating", () => {
  it("blocks the employer from self-referring while OPEN", async () => {
    serve(fixture());
    eth = installEthereum({ accounts: [EMPLOYER] });
    renderDetail();
    await waitFor(() => expect(screen.getByText(/waiting for a third-party referrer/i)).toBeDefined());
    expect(screen.queryByRole("button", { name: /refer the nominated candidate/i })).toBeNull();
    expect(screen.getByRole("button", { name: /cancel & refund before referral/i })).toBeDefined();
  });

  it("lets an unrelated wallet lock the referral", async () => {
    serve(fixture());
    eth = installEthereum({ accounts: [STRANGER] });
    renderDetail();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /refer the nominated candidate/i })).toBeDefined(),
    );
    expect(screen.queryByRole("button", { name: /cancel & refund/i })).toBeNull();
  });

  it("prevents the candidate from self-referring", async () => {
    serve(fixture());
    eth = installEthereum({ accounts: [CANDIDATE] });
    renderDetail();
    await waitFor(() =>
      expect(screen.getByText(/a referrer must lock your referral before you can accept it/i)).toBeDefined(),
    );
    expect(screen.queryByRole("button", { name: /refer the nominated candidate/i })).toBeNull();
  });

  it("requires the candidate to type a GitHub login before accepting", async () => {
    serve(fixture({ state: "REFERRED", referrer: REFERRER }));
    eth = installEthereum({ accounts: [CANDIDATE] });
    renderDetail();
    const acceptButton = await screen.findByRole("button", { name: /accept referral/i });
    expect((acceptButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText("Your GitHub username"), {
      target: { value: "octocat" },
    });
    const enabled = screen.getByRole("button", { name: /accept referral/i }) as HTMLButtonElement;
    expect(enabled.disabled).toBe(false);
    fireEvent.click(enabled);
    expect(await screen.findByTestId("verified-tx")).toBeDefined();
    expect(screen.getByTestId("verified-tx").textContent).toBe("accept_referral");
  });

  it("tells a non-candidate that only the nominee can accept", async () => {
    serve(fixture({ state: "REFERRED", referrer: REFERRER }));
    eth = installEthereum({ accounts: [STRANGER] });
    renderDetail();
    await waitFor(() =>
      expect(screen.getByText(/referral locked by 0x2222…2222\. only 0x3333…3333 can accept it\./i)).toBeDefined(),
    );
    expect(screen.queryByPlaceholderText("Your GitHub username")).toBeNull();
  });

  it("offers PR submission only to the accepted candidate", async () => {
    serve(fixture({ state: "ACCEPTED", referrer: REFERRER, candidate_github: "octocat" }));
    eth = installEthereum({ accounts: [CANDIDATE] });
    renderDetail();
    const submit = await screen.findByRole("button", { name: /submit work evidence/i });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText("Merged PR number"), { target: { value: "42" } });
    const enabled = screen.getByRole("button", { name: /submit work evidence/i }) as HTMLButtonElement;
    expect(enabled.disabled).toBe(false);
    fireEvent.click(enabled);
    expect((await screen.findByTestId("verified-tx")).textContent).toBe("submit_work");
  });

  it("tells other wallets that attribution is immutable while awaiting evidence", async () => {
    serve(fixture({ state: "ACCEPTED", referrer: REFERRER, candidate_github: "octocat" }));
    eth = installEthereum({ accounts: [STRANGER] });
    renderDetail();
    await waitFor(() =>
      expect(
        screen.getByText(/attribution is immutable\. waiting for candidate octocat to submit a merged pr\./i),
      ).toBeDefined(),
    );
    expect(screen.queryByPlaceholderText("Merged PR number")).toBeNull();
  });

  it("shows the judging state while the judge record is absent", async () => {
    serve(fixture({ state: "JUDGING", referrer: REFERRER, active_attempt: 1, attempt_count: 1, active_pr_number: 42 }));
    eth = installEthereum({ accounts: [CANDIDATE] });
    renderDetail();
    await waitFor(() =>
      expect(screen.getByText(/genlayer is evaluating the github evidence/i)).toBeDefined(),
    );
  });

  it("offers judgment resolution once the judge record is finalized", async () => {
    serve(
      fixture({ state: "JUDGING", referrer: REFERRER, active_attempt: 1, attempt_count: 1, active_pr_number: 42 }),
      {
        opportunity_id: 1,
        attempt_id: 1,
        outcome: "COMPLETED",
        evidence_digest: "0xdeadbeef",
        reason: "Merged diff satisfies the frozen criteria.",
        audit: "validators refetched PR #42",
        decided_at: now(),
      },
    );
    eth = installEthereum({ accounts: [STRANGER] });
    renderDetail();
    await waitFor(() =>
      expect(screen.getByText(/outcomejudge finalized/i)).toBeDefined(),
    );
    expect(screen.getByText("Merged diff satisfies the frozen criteria.")).toBeDefined();
    expect(screen.getByRole("button", { name: /resolve finalized judgment/i })).toBeDefined();
  });

  it("blocks settlement display until funds are actually released", async () => {
    serve(fixture({ state: "PAID", referrer: REFERRER, closed_at: now(), settlement_released: false }));
    eth = installEthereum({ accounts: [STRANGER] });
    renderDetail();
    await waitFor(() =>
      expect(screen.getByText(/funds have not been released yet/i)).toBeDefined(),
    );
    expect(screen.getByRole("button", { name: /release settlement funds/i })).toBeDefined();
    expect(document.querySelector(".settlement-highlight")).toBeNull();
  });

  it("shows the settled split and blocks re-settlement", async () => {
    serve(fixture({ state: "PAID", referrer: REFERRER, closed_at: now(), settlement_released: true }));
    eth = installEthereum({ accounts: [STRANGER] });
    renderDetail();
    await waitFor(() => expect(document.querySelector(".settlement-highlight")).toBeTruthy());
    expect(screen.getByText("Candidate paid")).toBeDefined();
    expect(screen.getByText("Referrer paid")).toBeDefined();
    expect(screen.getByText(/this opportunity is fully settled/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: /release settlement funds/i })).toBeNull();
  });

  it("offers permissionless expiry after the referral deadline", async () => {
    serve(fixture({ referral_deadline: now() - 60 }));
    eth = installEthereum({ accounts: [STRANGER] });
    renderDetail();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /expire & refund employer/i })).toBeDefined(),
    );
  });

  it("does not offer expiry before the referral deadline", async () => {
    serve(fixture({ referral_deadline: now() + 60 }));
    eth = installEthereum({ accounts: [STRANGER] });
    renderDetail();
    await waitFor(() => expect(screen.getByText(/waiting for a third-party referrer|refer the nominated candidate/i)).toBeDefined());
    expect(screen.queryByRole("button", { name: /expire & refund employer/i })).toBeNull();
  });
});

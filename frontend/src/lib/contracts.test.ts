import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  configured,
  getAccounting,
  getJudgment,
  getOpportunity,
  listOpportunities,
} from "@/lib/contracts/proofReferral";

const { readFinalMock } = vi.hoisted(() => ({ readFinalMock: vi.fn() }));

vi.mock("@/lib/genlayer/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/genlayer/client")>();
  return { ...actual, readFinal: readFinalMock };
});

const rawOpportunity = {
  id: 1,
  employer: "0x1111111111111111111111111111111111111111",
  candidate: "0x3333333333333333333333333333333333333333",
  title: "Implement CSV export",
  brief: "brief",
  acceptance_criteria: "criteria",
  repo_owner: "ometere123",
  repo_name: "evifix",
  candidate_payment: 2000000000000000000n,
  referral_reward: 1000000000000000000n,
  funded_amount: 3000000000000000000n,
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

describe("proofReferral contract client", () => {
  beforeEach(() => {
    readFinalMock.mockReset();
  });

  it("reports unconfigured when deployment addresses are missing", () => {
    vi.stubEnv("VITE_PROOF_REFERRAL_ADDRESS", "");
    vi.stubEnv("VITE_OUTCOME_JUDGE_ADDRESS", "");
    expect(configured()).toBe(false);
  });

  it("reports configured when both addresses are present", () => {
    vi.stubEnv("VITE_PROOF_REFERRAL_ADDRESS", "0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8");
    vi.stubEnv("VITE_OUTCOME_JUDGE_ADDRESS", "0x7842393CeEAB5F053B3024673B5986fDdb95A4C9");
    expect(configured()).toBe(true);
  });

  it("returns an empty directory without touching the chain when unconfigured", async () => {
    vi.stubEnv("VITE_PROOF_REFERRAL_ADDRESS", "");
    vi.stubEnv("VITE_OUTCOME_JUDGE_ADDRESS", "");
    await expect(listOpportunities()).resolves.toEqual([]);
    await expect(getAccounting()).resolves.toBeNull();
    expect(readFinalMock).not.toHaveBeenCalled();
  });

  it("rejects opportunity reads when unconfigured", async () => {
    vi.stubEnv("VITE_PROOF_REFERRAL_ADDRESS", "");
    vi.stubEnv("VITE_OUTCOME_JUDGE_ADDRESS", "");
    await expect(getOpportunity(1)).rejects.toThrow("Settlement contract not configured");
  });

  it("normalises returned opportunities and keeps bigint amounts", async () => {
    vi.stubEnv("VITE_PROOF_REFERRAL_ADDRESS", "0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8");
    readFinalMock.mockResolvedValueOnce([rawOpportunity]);
    const rows = await listOpportunities();
    expect(rows).toHaveLength(1);
    expect(rows[0].state).toBe("OPEN");
    expect(rows[0].candidate_payment).toBe(2000000000000000000n);
    expect(readFinalMock).toHaveBeenCalledWith(
      "0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8",
      "list_opportunities",
      [0, 40],
    );
  });

  it("returns null for an empty judgment record and a typed record otherwise", async () => {
    vi.stubEnv("VITE_OUTCOME_JUDGE_ADDRESS", "0x7842393CeEAB5F053B3024673B5986fDdb95A4C9");
    readFinalMock.mockResolvedValueOnce({});
    await expect(getJudgment(1, 1)).resolves.toBeNull();
    readFinalMock.mockResolvedValueOnce({ opportunity_id: 1, attempt_id: 1, outcome: "COMPLETED" });
    const judgment = await getJudgment(1, 1);
    expect(judgment?.outcome).toBe("COMPLETED");
    expect(await getJudgment(1, 0)).toBeNull();
  });
});

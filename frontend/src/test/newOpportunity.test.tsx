import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import NewOpportunity from "@/NewOpportunity";
import { configureContracts, EMPLOYER, installEthereum, renderRoute } from "./harness";

vi.mock("@/components/VerifiedTransaction", () => ({
  default: ({ tx, userValue }: any) => (
    <div data-testid="verified-tx">
      <span data-testid="tx-method">{tx.method}</span>
      <span data-testid="tx-value">{String(userValue)}</span>
      <span data-testid="tx-args">{tx.args.map((arg: any) => String(arg)).join("|")}</span>
    </div>
  ),
}));

function field(label: string): HTMLInputElement | HTMLTextAreaElement {
  const wrapper = screen.getByText(label).closest(".field");
  if (!wrapper) throw new Error(`field wrapper not found for ${label}`);
  const input = wrapper.querySelector("input, textarea");
  if (!input) throw new Error(`input not found for ${label}`);
  return input as HTMLInputElement;
}

function setField(label: string, value: string) {
  fireEvent.change(field(label), { target: { value } });
}

function loadPositiveDemo() {
  fireEvent.click(screen.getByRole("button", { name: /load positive demo/i }));
}

function review() {
  fireEvent.click(screen.getByRole("button", { name: /review & fund/i }));
}

async function renderConnected() {
  const utils = renderRoute(<NewOpportunity />, "/opportunities/new");
  await waitFor(() => expect(screen.getByRole("button", { name: /disconnect/i })).toBeDefined());
  return utils;
}

let eth: ReturnType<typeof installEthereum> | null = null;

beforeEach(() => {
  configureContracts();
  eth = installEthereum({ accounts: [EMPLOYER] });
});

afterEach(() => {
  eth?.restore();
  eth = null;
  vi.unstubAllEnvs();
});

describe("NewOpportunity form validation", async () => {
  it("requires an employer wallet on the right network", () => {
    eth?.restore();
    eth = installEthereum({ accounts: [] });
    renderRoute(<NewOpportunity />);
    review();
    expect(screen.getByText("Connect an employer wallet on Studio Next chain 61997.")).toBeDefined();
  });

  it("rejects a short brief and criteria set", async () => {
    await renderConnected();
    review();
    expect(
      screen.getByText("Use a clear title and at least 20 characters for both brief and criteria."),
    ).toBeDefined();
  });

  it("fills the positive demo preset and totals the exact commitment", async () => {
    const { container } = await renderConnected();
    loadPositiveDemo();
    expect((field("Job / task title") as HTMLInputElement).value).toContain("ProofReferral demo verification");
    expect((field("Candidate wallet") as HTMLInputElement).value).toBe("0xb29Ead15B1E8A2420faE84de974088f67a15ccC2");
    expect(container.textContent).toContain("Commit now");
    expect(container.textContent).toContain("3 GEN");
    expect(screen.queryByText(/contracts are not configured/i)).toBeNull();
  });

  it("rejects an invalid candidate address", async () => {
    await renderConnected();
    loadPositiveDemo();
    setField("Candidate wallet", "0x123");
    review();
    expect(screen.getByText("Candidate address is invalid.")).toBeDefined();
  });

  it("rejects an employer self-nomination", async () => {
    await renderConnected();
    loadPositiveDemo();
    setField("Candidate wallet", EMPLOYER);
    review();
    expect(screen.getByText("Employer and candidate must be different.")).toBeDefined();
  });

  it("requires positive payment and reward", async () => {
    await renderConnected();
    loadPositiveDemo();
    setField("Referral reward · GEN", "0");
    review();
    expect(screen.getByText("Both candidate payment and referral reward must be positive.")).toBeDefined();
  });

  it("requires the completion window to outlast the referral window", async () => {
    await renderConnected();
    loadPositiveDemo();
    setField("Completion window · hours", "12");
    review();
    expect(screen.getByText("Completion window must be longer than referral window.")).toBeDefined();
  });

  it("rejects a pasted GitHub URL instead of an owner name", async () => {
    await renderConnected();
    loadPositiveDemo();
    setField("GitHub owner / org", "https://github.com/ometere123");
    review();
    expect(
      screen.getByText("Enter only the GitHub owner or organisation name, for example ometere123. Do not paste a GitHub URL."),
    ).toBeDefined();
  });

  it("rejects a pasted GitHub URL instead of a repository name", async () => {
    await renderConnected();
    loadPositiveDemo();
    setField("Repository", "https://github.com/ometere123/evifix");
    review();
    expect(
      screen.getByText("Enter only the GitHub repository name, for example evifix. Do not paste a GitHub URL."),
    ).toBeDefined();
  });

  it("advances to review with the exact payable amount and frozen arguments", async () => {
    await renderConnected();
    loadPositiveDemo();
    review();
    expect(
      screen.getByText(
        /^You are committing 2 GEN to the candidate and 1 GEN to the eventual accepted referrer\./,
      ),
    ).toBeDefined();
    expect(screen.getByTestId("tx-method").textContent).toBe("create_opportunity");
    expect(screen.getByTestId("tx-value").textContent).toBe(String(3n * 10n ** 18n));
    const args = screen.getByTestId("tx-args").textContent!.split("|");
    expect(args).toHaveLength(10);
    expect(args[6]).toBe(String(2n * 10n ** 18n));
    expect(args[7]).toBe(String(1n * 10n ** 18n));
    expect(args[8]).toBe(String(24 * 3600));
    expect(args[9]).toBe(String(168 * 3600));
  });

  it("returns to editing from the signing summary", async () => {
    await renderConnected();
    loadPositiveDemo();
    review();
    fireEvent.click(screen.getByRole("button", { name: /edit opportunity/i }));
    expect(screen.getByRole("button", { name: /review & fund/i })).toBeDefined();
  });
});

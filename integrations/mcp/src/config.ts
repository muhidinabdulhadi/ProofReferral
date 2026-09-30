import { createAccount } from "genlayer-js";
import type { Account } from "viem";
import { ProofReferralClient } from "@proofreferral/sdk";

export function configuredClient(): { client: ProofReferralClient; account?: Account; writeEnabled: boolean } {
  const key = process.env.PROOFREFERRAL_PRIVATE_KEY;
  const writeEnabled = process.env.PROOFREFERRAL_WRITE_ENABLED === "true";
  if (writeEnabled && !key) throw new Error("PROOFREFERRAL_WRITE_ENABLED=true requires PROOFREFERRAL_PRIVATE_KEY.");
  const account = key ? createAccount(key as `0x${string}`) : undefined;
  return { client: new ProofReferralClient(account ? { account } : {}), account, writeEnabled };
}

export function requireWrite(writeEnabled: boolean, account?: Account): void {
  if (!writeEnabled) throw new Error("Writes are disabled. Set PROOFREFERRAL_WRITE_ENABLED=true explicitly.");
  if (!account) throw new Error("No signing account is configured.");
}

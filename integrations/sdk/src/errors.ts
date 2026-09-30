export class ProofReferralError extends Error { constructor(message: string, public readonly code = "PROOFREFERRAL_ERROR", public readonly details?: unknown) { super(message); this.name = "ProofReferralError"; } }
export class ConfigurationError extends ProofReferralError { constructor(message: string, details?: unknown) { super(message, "CONFIGURATION_ERROR", details); } }
export class ValidationError extends ProofReferralError { constructor(message: string, details?: unknown) { super(message, "VALIDATION_ERROR", details); } }
export class TransactionError extends ProofReferralError { constructor(message: string, details?: unknown) { super(message, "TRANSACTION_ERROR", details); } }

export function redactError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  return text.replace(/0x[a-fA-F0-9]{64}/g, "0x<redacted>").replace(/(private|secret|seed|mnemonic|key)[^\s:=]*[\s:=]+[^\s,;]+/gi, "$1=<redacted>");
}

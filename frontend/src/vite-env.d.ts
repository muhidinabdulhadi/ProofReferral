/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GENLAYER_CHAIN_ID?: string;
  readonly VITE_GENLAYER_CHAIN_NAME?: string;
  readonly VITE_GENLAYER_RPC_URL?: string;
  readonly VITE_GENLAYER_EXPLORER_URL?: string;
  readonly VITE_PROOF_REFERRAL_ADDRESS?: string;
  readonly VITE_OUTCOME_JUDGE_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
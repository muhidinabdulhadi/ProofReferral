import { studioDevnet } from "genlayer-js/chains";

export const PROOFREFERRAL_NETWORK = {
  chainId: 61997,
  chainName: "GenLayer Studio Next",
  rpcUrl: "https://studio-dev.genlayer.com/api",
  explorerUrl: "https://explorer-studio-dev.genlayer.com",
  symbol: "GEN",
} as const;

const envChainId = Number(import.meta.env.VITE_GENLAYER_CHAIN_ID || PROOFREFERRAL_NETWORK.chainId);
const configuredRpc = import.meta.env.VITE_GENLAYER_RPC_URL || PROOFREFERRAL_NETWORK.rpcUrl;
const envRpc = configuredRpc === "https://studio-next.genlayer.com/api"
  ? PROOFREFERRAL_NETWORK.rpcUrl
  : configuredRpc;
const envName = import.meta.env.VITE_GENLAYER_CHAIN_NAME || PROOFREFERRAL_NETWORK.chainName;
const envExplorer = import.meta.env.VITE_GENLAYER_EXPLORER_URL || PROOFREFERRAL_NETWORK.explorerUrl;

if (envChainId !== PROOFREFERRAL_NETWORK.chainId) {
  throw new Error(`ProofReferral is locked to chain 61997; configured ${envChainId}`);
}
if (envRpc !== PROOFREFERRAL_NETWORK.rpcUrl) {
  throw new Error(`ProofReferral is locked to ${PROOFREFERRAL_NETWORK.rpcUrl}`);
}

export const GENLAYER_CHAIN = {
  ...studioDevnet,
  id: PROOFREFERRAL_NETWORK.chainId,
  name: envName,
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: { default: { http: [envRpc] } },
} satisfies typeof studioDevnet;

export const WALLET_NETWORK = {
  // EIP-1193 chain IDs are hex quantities; lowercase is the most portable form
  // across MetaMask/Rabby and avoids providers rejecting 0xF22D as unrecognized.
  chainId: `0x${PROOFREFERRAL_NETWORK.chainId.toString(16)}`,
  chainName: envName,
  nativeCurrency: GENLAYER_CHAIN.nativeCurrency,
  rpcUrls: [envRpc],
  blockExplorerUrls: [envExplorer],
};

export const EXPLORER_URL = envExplorer;

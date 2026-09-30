import { ProofReferralClient } from "../src/index.js";

const rail = ProofReferralClient.fromPrivateKey(process.env.PROOFREFERRAL_PRIVATE_KEY as `0x${string}`);
const result = await rail.submitWork(3, 1);
console.log({ txHash: result.txHash, finalized: result.finalized, state: result.stateAfter?.state, settlementReleased: result.settlementReleased });

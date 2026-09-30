import { ProofReferralClient } from "../src/index.js";

const rail = new ProofReferralClient();
console.log(await rail.getProtocolConfig());
console.log(await rail.listOpportunities());

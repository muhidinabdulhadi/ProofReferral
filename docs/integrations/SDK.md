# SDK

`@proofreferral/sdk@0.1.0` is the public npm package for the frozen v1 ProofReferral SDK. It targets the finalized chain 61997 deployment and exposes typed reads, role-aware available actions, safe writes, centralized fee policy, explicit finalization, execution checks, and finalized state readback.

Install it with:

```sh
npm install @proofreferral/sdk
```

Basic read-only usage:

```ts
import { ProofReferralClient } from "@proofreferral/sdk";

const rail = new ProofReferralClient();
const protocol = await rail.getProtocolConfig();
const opportunities = await rail.listOpportunities();
```

Writes require a signer and preserve the SDK's finalization and post-write readback rules. The npm package does not change the deployed contracts or frontend.

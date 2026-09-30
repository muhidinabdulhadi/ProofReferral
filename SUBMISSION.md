# Agent Tank submission draft

## Name

ProofReferral

## Track

Future of Work

## One-line description

ProofReferral locks referral attribution before work begins, then uses GenLayer to verify the completed public work and automatically pay both the candidate and the referrer.

## Short description

Referral rewards usually depend on private employer records and discretionary attribution. ProofReferral turns the referral itself into accepted economic state. An employer fully funds a GitHub-based opportunity and fixes the candidate, work brief, acceptance criteria, candidate payment and referral reward. A third-party referrer locks the introduction, and the candidate must explicitly accept that referral before submitting work.

When the candidate supplies the completed PR, GenLayer verifies the frozen repository, candidate authorship, merge status and deadline, then independently evaluates the actual merged changes against the immutable acceptance criteria. `COMPLETED` automatically pays the candidate and referrer. `NOT_COMPLETED` refunds the employer. Missing or ambiguous evidence becomes `INCONCLUSIVE` with a bounded retry/recovery route.

## Why GenLayer

No single participant should decide the outcome. The employer has an incentive to avoid payment, the candidate has an incentive to claim completion, and the referrer needs attribution protected before the result is known. The substantive question, whether real merged work satisfies natural-language terms, directly controls pre-funded value and requires judgment over current public evidence.

ProofReferral's validator does not rubber-stamp an AI label. Validators independently refetch the GitHub evidence and independently rerun the meaningful completion evaluation. Only a finalized accepted result can reach the settlement contract.

## Differentiation

ProofReferral is not a bounty marketplace or generic work escrow. The protocol's first-class object is the **referral relationship**: a referrer binds an already-selected candidate, the candidate explicitly accepts, attribution becomes immutable, and the referral reward exists only because that accepted referral later produces verified completed work.

## Architecture

Two coherent Intelligent Contracts:

- **ProofReferral**: funding, attribution, acceptance, state machine, settlement and recovery.
- **OutcomeJudge**: source-restricted GitHub verification, substantive consensus judgment and audit record.

No backend or database is required.

## Network

Studio Next / Studionet Dev, chain ID 61997.

## Repository

https://github.com/ometere123/proofreferral

## Live app

The frontend is configured for the deployed 61997 contracts. Hosting/public URL is
not yet recorded in this repository.

## Contracts

- ProofReferral: `0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8`
- OutcomeJudge: `0x7842393CeEAB5F053B3024673B5986fDdb95A4C9`
- Evidence: `deployment/61997.json`

> These are the only deployed addresses, and they are the ones recorded in
> `deployment/61997.json`, `frontend/.env.local` and `integrations/sdk/src/constants.ts`.
> The explorer links are in `deployment/61997.json`.

## Demo video

Mandatory; record using `docs/DEMO_SCRIPT.md` after the live deployment is verified.

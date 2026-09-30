# Agent Tank portal form — exact copy

Ready-to-paste content for **Submit Contribution → Contribution Type: Builder → Projects**.

Character limits were verified: one-liner ≤ 180, description ≤ 1000, expected outcome ≤ 500.

---

## 01 Identity

**Logo**

`frontend/public/favicon.svg` exists but the form only accepts PNG/JPEG/WebP, 128–2048 px, max 2 MB. Convert before uploading, e.g.:

```bash
npx sharp-cli -i frontend/public/favicon.svg -o proofreferral-logo.png resize 1024 1024
```

**Project name**

```
ProofReferral
```

**Primary tag**

Pick the closest available tag to *Future of Work / DeFi / Infrastructure*. Tag 1 and Tag 2 must be
sub-topics of it. Suggested pairing if the list allows it: primary `Infrastructure`, sub-tags
`Escrow & Settlement` + `Oracles & Data Verification`. If the dropdown has no such pairs, use whatever
two sub-tags sit nearest — this field is a discovery label, not scored copy.

---

## 02 Project summary

**One-liner** (160 chars)

```
ProofReferral locks referral attribution before work starts, then GenLayer verifies the finished public work on-chain and auto-pays both candidate and referrer.
```

---

## 03 Project overview

**Description** (994 chars)

```
Referral credit lives in revocable private employer records. ProofReferral makes it enforceable economic state on GenLayer.

An employer funds one opportunity on-chain: a frozen brief and criteria, one public GitHub repo, one nominated candidate, and an exact candidate payment plus referral reward. A third-party referrer locks themselves as attribution; only the candidate can accept, binding their GitHub login. Attribution is then immutable.

The candidate submits only a merged PR number, so the evidence source cannot be swapped. OutcomeJudge fetches only GitHub paths derived from that frozen repo, gates on objective author, merge-state and merge-deadline facts, then asks GenLayer consensus whether the diff meets the criteria. Validators refetch and re-run it independently; missing evidence yields INCONCLUSIVE, never a guessed approval.

COMPLETED pays both parties; NOT_COMPLETED refunds the employer. Payouts can never exceed committed funding. On 61997 one funded case PAID both.
```

---

## 04 Demo video

Optional on the form, but it is the fastest way to pass review. Record `docs/DEMO_SCRIPT.md` (90–120 s)
and paste the direct YouTube watch URL. Do not submit until a real recording exists — the script and
the live case are already reproducible.

---

## 05 How-to

Step 1 · heading `Connect a wallet` · instruction

```
Open the ProofReferral app. Connect a wallet and switch it to GenLayer Studio Next, chain ID 61997 (RPC https://studio-dev.genlayer.com/api). The header must show "GenLayer Studio Next" with no network warning. Three different funded wallets are required, because the protocol enforces three distinct roles: employer, referrer, candidate.
```

Step 2 · heading `Employer funds the opportunity` · instruction

```
As the employer wallet, open Opportunities → Fund opportunity. Set repo owner "ometere123" and repo name "evifix", enter a brief and acceptance criteria, and set candidate wallet to a different funded address than your own. Set candidate payment to 2 GEN and referral reward to 1 GEN. The attached value must be exactly 3 GEN, because funding must equal candidate payment plus referral reward; anything else is rejected. Submit and wait for finalization.
```

Step 3 · heading `Referrer locks attribution` · instruction

```
Switch to a third wallet that is neither the employer nor the candidate, open the new opportunity, and click Create referral for that candidate address. Self-referral is rejected for both employer and candidate, and an existing referral cannot be replaced. The state becomes REFERRED.
```

Step 4 · heading `Candidate accepts and binds identity` · instruction

```
Switch back to the candidate wallet, enter the candidate's GitHub login, and click Accept referral. This is the only point where referral attribution becomes accepted protocol state, and it must happen before any work is submitted. State becomes ACCEPTED with the referrer address and reward now immutable.
```

Step 5 · heading `Candidate submits the merged PR` · instruction

```
Still as the candidate, enter the merged pull request number in the repository that was frozen at funding (ometere123/evifix PR #1) and submit. The repository source cannot be changed, so the only thing a candidate can supply is a PR number. State becomes JUDGING.
```

Step 6 · heading `GenLayer judges, then funds move` · instruction

```
Watch the opportunity move to JUDGING and then PAID. Expand the judgment panel to read the evidence digest, the objective audit flags, and the written reason. The transaction panel must show signature → submitted → consensus → finalized → contract readback; the UI never calls a write successful at submission time. The settlement panel shows the candidate paid 2 GEN, the referrer paid 1 GEN, and the referrer's address.
```

Step 7 · heading `Verify the negative path` · instruction

```
Open any opportunity whose PR author does not match the locked GitHub identity. The same flow ends in NOT_COMPLETED and refunds the employer instead of paying anyone.
```

---

## 06 Review verification

**Expected verification outcome** (462 chars)

```
Reproducible read-only, no wallet needed. On ProofReferral 0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8 call get_opportunity(3) and get_opportunity(2).

Expected: id 3 = PAID, settlement_released true, funded 3e18 split 2e18 candidate / 1e18 referrer, outcome COMPLETED; id 2 = REFUNDED, settlement_released true, outcome NOT_COMPLETED. get_accounting shows zero locked balance left.

To reproduce live, run steps 1-6 with a fresh opportunity and a real merged PR.
```

**Contract link 1 (optional)**

```
https://explorer-studio-dev.genlayer.com/address/0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8
```

**Contract link 2 (optional)**

```
https://explorer-studio-dev.genlayer.com/address/0x7842393CeEAB5F053B3024673B5986fDdb95A4C9
```

**Contract link 3 (optional)** — judge binding tx, proves the two contracts are actually wired

```
https://explorer-studio-dev.genlayer.com/tx/0x7bd091a59ba14af481c4c12e629e466f8e6263eb51504e4d1ba43450c6a6857d
```

---

## 07 Project links

**Website · required**

No hosted URL exists in the repository yet — this is the one hard blocker. The app is a static Vite
build with `frontend/vercel.json` already committed and `frontend/.env.local` already pointed at the
two real 61997 addresses, so deploying is the only missing step:

```bash
npm run build
npx vercel deploy --prod --cwd frontend
```

Use the returned URL. Do not invent one.

**GitHub**

```
https://github.com/muhidinabdulhadi/ProofReferral
```

> `SUBMISSION.md` and `AGENT_HANDOFF.md` still say `https://github.com/ometere123/proofreferral` while
> the actual `origin` remote is `https://github.com/muhidinabdulhadi/ProofReferral`. Pick the URL that
> is genuinely public and update the stale references so they do not contradict the submission.

---

## Evidence & Supporting Information

One **GitHub Repository** is required. Add these three, in this order:

1. `https://github.com/muhidinabdulhadi/ProofReferral` — GitHub Repository
2. `https://explorer-studio-dev.genlayer.com/address/0x935A6fD995b4db5d64E1139D57a37a3f73BE2Ef8` — URL Link
3. `https://explorer-studio-dev.genlayer.com/address/0x7842393CeEAB5F053B3024673B5986fDdb95A4C9` — URL Link

---

## Quality-bar checklist

Map each bar item to where a reviewer will find it, so the answer is already in the repo.

| Bar item | Where it lives |
| --- | --- |
| Solves a real trust problem | `README.md` thesis + `docs/SECURITY_MODEL.md`: revocable referral credit replaced by accepted on-chain attribution |
| Uses live or authoritative data | `OutcomeJudge` fetches live `api.github.com` PR + changed-file patches, source-restricted to the frozen repo |
| Complete source code and accurate docs | `contracts/`, `frontend/`, `integrations/sdk`, `integrations/mcp`, and 11 files in `docs/` |
| Frontend calls the contract, full lifecycle | `frontend/src/lib/contracts/proofReferral.ts` + Transaction Kit; signature → consensus → finalization → readback |
| Meaningfully different from boilerplate | First-class referral relationship, not a generic escrow or bounty board; see the `NOT` list in `README.md` |
| Demo / public posts | Pending — record `docs/DEMO_SCRIPT.md` and post the link |

## Before clicking Submit

- [ ] Frontend deployed, real URL in the Website field
- [ ] Logo converted to PNG 1024×1024
- [ ] GitHub URL confirmed public and stale references in the repo corrected
- [ ] Primary tag + two sub-tags actually chosen from the dropdown
- [ ] Demo video recorded (strongly recommended, not required)
- [ ] `python -m pytest -q` and `npm run build` re-run on the final tree
- [ ] `python scripts/preflight.py --submission` green

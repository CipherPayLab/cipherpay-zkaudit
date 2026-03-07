# cipherpay-zkaudit

CipherPay audit application with two role-based flows:

- **User flow:** select auditable CipherPay transactions and export a signed audit bundle
- **Auditor flow:** upload a bundle and verify proofs, signatures, and on-chain receipt anchoring

## Apps

- `apps/web` — Next.js web app with `/user` and `/auditor` sections

## Packages

- `audit-types`
- `verifier-registry`
- `audit-bundle`
- `audit-export`
- `audit-engine`
- `chain-solana`
- `proof-groth16`

## Run

```bash
pnpm install
pnpm dev
```

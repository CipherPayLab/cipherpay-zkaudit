# CipherPay ZK Audit

Monorepo for user-facing audit export and auditor-facing verification of CipherPay shielded activities.

## Structure

- **apps/web** – Next.js app (user: activities, export; auditor: upload, verify)
- **packages/audit-types** – Bundle, entry, report types
- **packages/verifier-registry** – Verifier key ID → implementation
- **packages/audit-bundle** – Canonicalize, hash, validate, verify signature
- **packages/audit-export** – Build audit bundles from activities
- **packages/audit-engine** – Verify bundles and entries (ZK + chain)
- **packages/chain-solana** – Solana RPC, nullifier record fetch
- **packages/proof-groth16** – Decode public signals, verify Groth16

## Setup

```bash
pnpm install
pnpm build
```

## Dev

```bash
pnpm dev
```

See [docs/architecture.md](docs/architecture.md) for data flow.

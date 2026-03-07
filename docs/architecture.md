# CipherPay ZK Audit – Architecture

## Overview

- **apps/web**: Next.js app for user (activities, export) and auditor (upload, verify).
- **packages/audit-types**: Shared types for bundles, entries, reports.
- **packages/verifier-registry**: Maps `verifier_key_id` to verifier implementations.
- **packages/audit-bundle**: Canonicalize, hash, validate, and verify bundle signature.
- **packages/audit-export**: Build audit bundles from selected activities.
- **packages/audit-engine**: Verify audit bundles and entries (ZK + chain).
- **packages/chain-solana**: Solana RPC and nullifier record fetch.
- **packages/proof-groth16**: Decode public signals and verify Groth16 proofs.

## Data flow

1. User selects activities → audit-export builds bundle → user downloads.
2. Auditor uploads bundle → audit-engine validates schema and signatures → verifies each entry (proof + chain) → report.

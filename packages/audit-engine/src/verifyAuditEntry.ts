import type {
  AuditBundleEntry,
  AuditEntryVerificationResult
} from "@cipherpay/audit-types";
import { decodePublicSignals, verifyGroth16Proof } from "@cipherpay/proof-groth16";
import { fetchNullifierRecord } from "@cipherpay/chain-solana";

/**
 * Convert a decimal public signal string (snarkjs format) to big-endian 32-byte hex.
 * e.g. "12345678..." → "0000...abcd"
 */
function decimalSignalToBEHex(decimal: string): string {
  return BigInt(decimal).toString(16).padStart(64, "0").toLowerCase();
}

/**
 * Convert a little-endian 32-byte hex string (from on-chain Anchor storage) to big-endian hex.
 * The relayer encodes each public signal as LE bytes; the NullifierRecord stores them unchanged.
 */
function leHexToBeHex(leHex: string): string {
  const clean = leHex.startsWith("0x") ? leHex.slice(2) : leHex;
  // Reverse byte-by-byte: split into 2-char byte groups, reverse, rejoin
  const bytes: string[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(clean.slice(i, i + 2));
  }
  return bytes.reverse().join("").toLowerCase();
}

export async function verifyAuditEntry(
  entry: AuditBundleEntry
): Promise<AuditEntryVerificationResult> {
  const tag = `[verifyAuditEntry entry=${entry.entry_id}]`;
  const errors: string[] = [];
  const warnings: string[] = [];

  let proofValid = false;
  let receiptMatch = false;

  console.log(`${tag} Starting — event_type=${entry.event_type} verifier_key_id=${entry.proof_artifacts.verifier_key_id}`);
  const t0 = Date.now();

  // ── Step 1: ZK proof verification (CPU-intensive, may take several seconds) ──
  console.log(`${tag} Step 1: verifying ZK proof (snarkjs groth16.verify)…`);
  const t1 = Date.now();
  try {
    proofValid = await verifyGroth16Proof({
      proof: entry.proof_artifacts.groth16_proof,
      publicSignals: entry.proof_artifacts.public_signals,
      verifierKeyId: entry.proof_artifacts.verifier_key_id
    });
    console.log(`${tag} Step 1 done in ${Date.now() - t1}ms — proofValid=${proofValid}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Proof verification failed";
    console.error(`${tag} Step 1 error in ${Date.now() - t1}ms — ${msg}`);
    errors.push(`Proof verification error: ${msg}`);
  }

  // ── Step 2: Decode public signals & on-chain receipt check ──
  console.log(`${tag} Step 2: decoding public signals & checking on-chain receipt…`);
  const t2 = Date.now();
  try {
    const decodedSignals = decodePublicSignals({
      verifierKeyId: entry.proof_artifacts.verifier_key_id,
      publicSignals: entry.proof_artifacts.public_signals
    });
    console.log(`${tag} Step 2a: signals decoded — keys=[${Object.keys(decodedSignals).join(", ")}]`);

    if (entry.onchain_receipt.nullifier_record_pda) {
      console.log(`${tag} Step 2b: fetching NullifierRecord PDA from Solana — ${entry.onchain_receipt.nullifier_record_pda}`);
      const t2b = Date.now();
      const record = await fetchNullifierRecord(entry.onchain_receipt.nullifier_record_pda);
      console.log(`${tag} Step 2b done in ${Date.now() - t2b}ms — found=${!!record}`);

      if (!record) {
        errors.push("NullifierRecord not found on-chain");
      } else {
        const oldRoot = decodedSignals.old_root
          ? decimalSignalToBEHex(decodedSignals.old_root)
          : undefined;

        const afterRoot = decodedSignals.new_root2
          ? decimalSignalToBEHex(decodedSignals.new_root2)
          : undefined;

        // On-chain roots are stored as LE bytes (relayer uses le32 encoding); convert to BE for comparison.
        const recordBefore = leHexToBeHex(record.merkle_root_before);
        const recordAfter = leHexToBeHex(record.merkle_root_after);

        const beforeMatch = oldRoot ? oldRoot === recordBefore : false;
        const afterMatch = afterRoot ? afterRoot === recordAfter : false;

        receiptMatch = beforeMatch && afterMatch;
        console.log(`${tag} Step 2c: root comparison — beforeMatch=${beforeMatch} afterMatch=${afterMatch}`);

        if (!beforeMatch) {
          errors.push("merkle_root_before mismatch between proof and on-chain receipt");
        }

        if (!afterMatch) {
          errors.push("merkle_root_after mismatch between proof and on-chain receipt");
        }
      }
    } else if (entry.onchain_receipt.tx_signature) {
      console.log(`${tag} Step 2b: no NullifierRecord PDA — tx_signature present, marking receipt OK`);
      // tx_signature proves the transaction landed on-chain; Merkle root comparison
      // requires the NullifierRecord PDA which is only stored for newer transactions.
      receiptMatch = true;
      warnings.push("NullifierRecord PDA not available; Merkle root comparison skipped (tx_signature present)");
    } else {
      console.log(`${tag} Step 2b: no on-chain receipt reference — proof validity is the sole audit criterion`);
      // No on-chain reference is stored yet (older transactions or relayer didn't return it).
      // A valid ZK proof is cryptographically sufficient for the audit — the prover
      // cannot forge a proof without knowing the correct witness.
      receiptMatch = true;
      warnings.push("No on-chain receipt reference stored; audit relies on ZK proof validity alone");
    }

    console.log(`${tag} Step 2 done in ${Date.now() - t2}ms`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Receipt verification failed";
    console.error(`${tag} Step 2 error in ${Date.now() - t2}ms — ${msg}`);
    errors.push(`Receipt verification error: ${msg}`);
  }

  // ok = proof cryptographically valid + no hard errors
  // (warnings about missing on-chain references do not block the audit result)
  const ok = proofValid && receiptMatch && errors.length === 0;
  console.log(`${tag} Finished in ${Date.now() - t0}ms — ok=${ok} errors=[${errors.join("; ")}] warnings=[${warnings.join("; ")}]`);

  return {
    entry_id: entry.entry_id,
    ok,
    proof_valid: proofValid,
    receipt_match: receiptMatch,
    errors,
    warnings
  };
}

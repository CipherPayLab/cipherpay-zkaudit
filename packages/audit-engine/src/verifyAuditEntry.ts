import type {
  AuditBundleEntry,
  AuditEntryVerificationResult
} from "@cipherpay/audit-types";
import { decodePublicSignals, verifyGroth16Proof } from "@cipherpay/proof-groth16";
import { fetchNullifierRecord } from "@cipherpay/chain-solana";

function normalizeHex(value: string): string {
  return value.startsWith("0x") ? value.slice(2).toLowerCase() : value.toLowerCase();
}

export async function verifyAuditEntry(
  entry: AuditBundleEntry
): Promise<AuditEntryVerificationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  let proofValid = false;
  let receiptMatch = false;

  try {
    proofValid = await verifyGroth16Proof({
      proof: entry.proof_artifacts.groth16_proof,
      publicSignals: entry.proof_artifacts.public_signals,
      verifierKeyId: entry.proof_artifacts.verifier_key_id
    });
  } catch (error) {
    errors.push(
      error instanceof Error ? `Proof verification error: ${error.message}` : "Proof verification failed"
    );
  }

  try {
    const decodedSignals = decodePublicSignals({
      verifierKeyId: entry.proof_artifacts.verifier_key_id,
      publicSignals: entry.proof_artifacts.public_signals
    });

    if (entry.onchain_receipt.nullifier_record_pda) {
      const record = await fetchNullifierRecord(entry.onchain_receipt.nullifier_record_pda);

      if (!record) {
        errors.push("NullifierRecord not found on-chain");
      } else {
        const oldRoot = decodedSignals.old_root
          ? normalizeHex(decodedSignals.old_root)
          : undefined;

        const afterRoot = decodedSignals.new_root2
          ? normalizeHex(decodedSignals.new_root2)
          : undefined;

        const recordBefore = normalizeHex(record.merkle_root_before);
        const recordAfter = normalizeHex(record.merkle_root_after);

        const beforeMatch = oldRoot ? oldRoot === recordBefore : false;
        const afterMatch = afterRoot ? afterRoot === recordAfter : false;

        receiptMatch = beforeMatch && afterMatch;

        if (!beforeMatch) {
          errors.push("merkle_root_before mismatch between proof and on-chain receipt");
        }

        if (!afterMatch) {
          errors.push("merkle_root_after mismatch between proof and on-chain receipt");
        }
      }
    } else if (entry.onchain_receipt.tx_signature) {
      warnings.push("Only tx_signature present; no NullifierRecord PDA for root comparison");
    } else {
      warnings.push("No on-chain receipt reference present");
    }
  } catch (error) {
    errors.push(
      error instanceof Error ? `Receipt verification error: ${error.message}` : "Receipt verification failed"
    );
  }

  const ok = proofValid && receiptMatch && errors.length === 0;

  return {
    entry_id: entry.entry_id,
    ok,
    proof_valid: proofValid,
    receipt_match: receiptMatch,
    errors,
    warnings
  };
}

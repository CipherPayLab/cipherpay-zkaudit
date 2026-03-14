import type {
  AuditBundleEntry,
  AuditEventType,
  DisclosureLevel
} from "@cipherpay/audit-types";

export interface ExportableMessage {
  id: string;
  kind: string;
  nullifier_hex?: string | null;
  nullifier_record_pda?: string | null;
  proof_hex?: string | null;
  proof_public_signals?: string | null;
  verifier_key_id?: string | null;
  tx_signature?: string | null;
  amount?: string | null;
}

function normalizeEventType(kind: string): AuditEventType {
  // Accept both DB-prefixed forms ("note-transfer") and bare forms ("transfer").
  const bare = kind.startsWith("note-") ? kind.slice("note-".length) : kind;

  if (bare === "transfer" || bare === "withdraw" || bare === "deposit") {
    return bare;
  }

  throw new Error(`Unsupported audit event type: ${kind}`);
}

function parsePublicSignals(
  raw: string | null | undefined
): string[] | Record<string, string> {
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as unknown;

  if (Array.isArray(parsed)) {
    return parsed.map((value) => String(value));
  }

  if (parsed !== null && typeof parsed === "object") {
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
        key,
        String(value)
      ])
    );
  }

  throw new Error("Invalid proof_public_signals format");
}

export function mapMessageToEntry(
  message: ExportableMessage,
  disclosureLevel: DisclosureLevel = "protocol_only"
): AuditBundleEntry {
  return {
    entry_id: message.id,
    event_type: normalizeEventType(message.kind),
    nullifier: message.nullifier_hex ?? undefined,
    onchain_receipt: {
      nullifier_record_pda: message.nullifier_record_pda ?? undefined,
      tx_signature: message.tx_signature ?? undefined
    },
    proof_artifacts: {
      verifier_key_id: message.verifier_key_id ?? "groth16_bn254_v1",
      groth16_proof: message.proof_hex ?? "",
      public_signals: parsePublicSignals(message.proof_public_signals)
    },
    selective_disclosure: {
      level: disclosureLevel,
      amount:
        disclosureLevel === "amount_only" || disclosureLevel === "full"
          ? message.amount ?? undefined
          : undefined
    },
    entry_integrity: {
      entry_hash_sha256: ""
    }
  };
}

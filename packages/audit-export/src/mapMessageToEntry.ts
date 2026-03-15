import type {
  AuditBundleEntry,
  AuditEventType,
  DisclosureLevel
} from "@cipherpay/audit-types";

export interface ExportableMessage {
  id: string;
  kind: string;
  amount?: string | null;
  sender_key?: string | null;
  sender_name?: string | null;
  recipient_key?: string | null;
  recipient_name?: string | null;
  /** ISO string or Date — used as fallback timestamp when nullifier spent_at is unavailable */
  created_at?: string | Date | null;
  /** tx_signature from the messages row */
  tx_signature?: string | null;
  /** tx_signature from the nullifiers row (fallback) */
  nullifier_tx_sig?: string | null;
  /** Unix seconds when the nullifier was spent */
  spent_at_unix?: number | null;
  nullifier_hex?: string | null;
  nullifier_record_pda?: string | null;
  proof_hex?: string | null;
  proof_public_signals?: string | null;
  verifier_key_id?: string | null;
}

const DEFAULT_VERIFIER_KEY_ID: Record<AuditEventType, string> = {
  transfer: "groth16_bn254_v1",
  withdraw: "groth16_withdraw_bn254_v1",
  deposit: "groth16_deposit_bn254_v1",
};

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
  disclosureLevel: DisclosureLevel = "full"
): AuditBundleEntry {
  const eventType = normalizeEventType(message.kind);

  // Resolve tx_signature: prefer messages row, fall back to nullifiers row
  const txSignature = message.tx_signature ?? message.nullifier_tx_sig ?? undefined;

  // Resolve timestamp (unix seconds): prefer nullifier spent_at, fall back to created_at
  let spentUnixTs: number | undefined;
  if (message.spent_at_unix != null) {
    spentUnixTs = message.spent_at_unix;
  } else if (message.created_at) {
    const d = message.created_at instanceof Date
      ? message.created_at
      : new Date(message.created_at);
    spentUnixTs = Math.floor(d.getTime() / 1000);
  }

  const includeAmount = disclosureLevel === "amount_only" || disclosureLevel === "full";
  const includeRecipient = disclosureLevel === "recipient_only" || disclosureLevel === "full";

  return {
    entry_id: message.id,
    event_type: eventType,
    nullifier: message.nullifier_hex ?? undefined,
    onchain_receipt: {
      nullifier_record_pda: message.nullifier_record_pda ?? undefined,
      tx_signature: txSignature,
      spent_unix_ts: spentUnixTs,
    },
    proof_artifacts: {
      verifier_key_id: message.verifier_key_id ?? DEFAULT_VERIFIER_KEY_ID[eventType],
      groth16_proof: message.proof_hex ?? "",
      public_signals: parsePublicSignals(message.proof_public_signals)
    },
    selective_disclosure: {
      level: disclosureLevel,
      amount: includeAmount ? message.amount ?? undefined : undefined,
      sender: disclosureLevel === "full" ? message.sender_key ?? undefined : undefined,
      sender_name: disclosureLevel === "full" ? message.sender_name ?? undefined : undefined,
      recipient: includeRecipient ? message.recipient_key ?? undefined : undefined,
      recipient_name: includeRecipient ? message.recipient_name ?? undefined : undefined,
    },
    entry_integrity: {
      entry_hash_sha256: ""
    }
  };
}

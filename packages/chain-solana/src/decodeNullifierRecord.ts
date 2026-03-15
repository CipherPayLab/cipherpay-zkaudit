function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function readU64LE(bytes: Uint8Array, offset: number): bigint {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getBigUint64(offset, true);
}

function readI64LE(bytes: Uint8Array, offset: number): bigint {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getBigInt64(offset, true);
}

export interface DecodedNullifierRecord {
  used: boolean;
  bump: number;
  spent_slot: bigint;
  spent_unix_ts: bigint;
  merkle_root_before: string;
  merkle_root_after: string;
  event_type: number;
}

export function decodeNullifierRecord(data: Uint8Array): DecodedNullifierRecord {
  // NullifierRecord layout (state.rs):
  //   Anchor discriminator: 8 bytes
  //   used: bool (1)  bump: u8 (1)  spent_slot: u64 (8)  spent_unix_ts: i64 (8)
  //   merkle_root_before: [u8;32]  merkle_root_after: [u8;32]  event_type: u8 (1)
  //   Total: 8 + 83 = 91 bytes
  //
  // The old heuristic (offset = raw.length >= 98 ? 8 : 0) incorrectly set offset=0
  // for the 91-byte account, reading the 8-byte discriminator as field data.
  // Always skip exactly 8 bytes for the Anchor discriminator.
  const DISCRIMINATOR = 8;
  const MIN_SIZE = DISCRIMINATOR + 83; // 91

  if (data.length < MIN_SIZE) {
    throw new Error(`NullifierRecord too short: got ${data.length}, need ${MIN_SIZE}`);
  }

  const raw = data;
  const offset = DISCRIMINATOR;

  const used = raw[offset] === 1;
  const bump = raw[offset + 1];
  const spent_slot = readU64LE(raw, offset + 2);
  const spent_unix_ts = readI64LE(raw, offset + 10);

  const beforeStart = offset + 18;
  const afterStart = offset + 50;

  const merkle_root_before = bytesToHex(raw.slice(beforeStart, beforeStart + 32));
  const merkle_root_after = bytesToHex(raw.slice(afterStart, afterStart + 32));
  const event_type = raw[offset + 82];

  return {
    used,
    bump,
    spent_slot,
    spent_unix_ts,
    merkle_root_before,
    merkle_root_after,
    event_type
  };
}

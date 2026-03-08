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
  const raw = data.length >= 90 ? data : (() => { throw new Error("NullifierRecord too short"); })();

  const offset = raw.length >= 98 ? 8 : 0;

  if (raw.length < offset + 90) {
    throw new Error("Invalid NullifierRecord length");
  }

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

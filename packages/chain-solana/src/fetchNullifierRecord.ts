import { PublicKey } from "@solana/web3.js";
import { getSolanaConnection } from "./rpc";
import { decodeNullifierRecord, type DecodedNullifierRecord } from "./decodeNullifierRecord";

export async function fetchNullifierRecord(
  pda: string
): Promise<DecodedNullifierRecord | null> {
  const connection = getSolanaConnection();
  const pubkey = new PublicKey(pda);
  const accountInfo = await connection.getAccountInfo(pubkey);

  if (!accountInfo) {
    return null;
  }

  return decodeNullifierRecord(accountInfo.data);
}

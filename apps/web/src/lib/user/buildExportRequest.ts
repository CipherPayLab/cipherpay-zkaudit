export interface UserExportRequest {
  disclosureLevel: "protocol_only";
  ownerWalletPubkey: string;
  selectedIds: string[];
}

export function buildExportRequest(input: {
  ownerWalletPubkey: string;
  selectedIds: string[];
}): UserExportRequest {
  return {
    disclosureLevel: "protocol_only",
    ownerWalletPubkey: input.ownerWalletPubkey,
    selectedIds: input.selectedIds
  };
}

export interface UserExportRequest {
  disclosureLevel: "full";
  ownerWalletPubkey: string;
  selectedIds: string[];
}

export function buildExportRequest(input: {
  ownerWalletPubkey: string;
  selectedIds: string[];
}): UserExportRequest {
  return {
    disclosureLevel: "full",
    ownerWalletPubkey: input.ownerWalletPubkey,
    selectedIds: input.selectedIds
  };
}
